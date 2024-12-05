import axios from "axios";
import xml2js from "xml2js";
import logger from "../utils/logger";
import { IOfacSanctionedEntity, OfacSanctionedEntityModel } from "../models/OfacSanctionedEntity";
import { IUNSanctionsSearchParams } from '../interfaces/ISanctionedIndividual';

export interface SanctionedIndividual {
  dataId: string;
  id: string;
  name: string;
  country?: string;
  aliases?: string[];
  addresses?: string[];
  programs?: string[];
  features?: { type: string; value: string; dateRange?: { fromDate: string; toDate: string } }[];
  dateOfBirth?: string;
  matchQuality?: string;
}

export interface Feature {
  type: string;
  value: string;
  dateRange?: {
    fromDate: string;
    toDate: string;
  };
}

export interface SearchParams {
  firstName?: string;     
  lastName?: string;       
  placeOfBirth?: {
    country?: string;         
  };
  dateOfBirth?: {
    year?: string;          
  };
}

class OfacSanctionService {
  private changesApi = "https://sanctionslistservice.ofac.treas.gov/changes/latest";
  private fileUrl = "https://sanctionslistservice.ofac.treas.gov/api/download/sdn.xml";
  private lastCheckedDate: string = "";
  private apiUrl = "https://sanctionslistservice.ofac.treas.gov";
  private sanctionedIndividuals: SanctionedIndividual[] = [];

  constructor() {}

  // Helper method to calculate match quality
  private calculateMatchQuality(entity: any, params: SearchParams): string {
    let score = 0;
    let matchedFields = 0;
    const totalFields = 4; // First name, last name, country, date of birth
  
    // Handle firstName match
    if (params.firstName && entity.name?.toLowerCase().includes(params.firstName.toLowerCase())) {
      score += 1;
      matchedFields += 1;
    }
  
    // Handle lastName match
    if (params.lastName && entity.name?.toLowerCase().includes(params.lastName.toLowerCase())) {
      score += 1;
      matchedFields += 1;
    }
  
    // Handle country match
    if (params.placeOfBirth?.country && entity.country?.toLowerCase().includes(params.placeOfBirth.country.toLowerCase())) {
      score += 1;
      matchedFields += 1;
    }
  
    // Handle dateOfBirth match
    if (params.dateOfBirth?.year && entity.dateOfBirth?.year === params.dateOfBirth.year) {
      score += 1;
      matchedFields += 1;
    }
  
    // Calculate quality based on matched fields
    const quality = matchedFields === totalFields ? "High" :
                    matchedFields > 0 ? "Medium" : "Low";
  
    return quality;
  }

  async searchSanctions(params: SearchParams): Promise<any[]> {
    const query: any = {};
  
    // Match name against both firstName and lastName in a single field
    if (params.firstName || params.lastName) {
      const nameParts: string[] = [];
      if (params.firstName) {
        nameParts.push(params.firstName);
      }
      if (params.lastName) {
        nameParts.push(params.lastName);
      }
      const nameRegex = new RegExp(nameParts.join(" "), "i"); // Combine first and last name for regex
      query.name = { $regex: nameRegex }; // Case-insensitive match for the name field
    }
  
    if (params.placeOfBirth?.country) {
      query["country"] = { 
        $regex: new RegExp(params.placeOfBirth.country, "i"), 
        $exists: true,
      };
    }
  
    // Match dateOfBirth if provided
    if (params.dateOfBirth?.year) {
      query["dateOfBirth.year"] = params.dateOfBirth.year;
    }
  
    logger.info("Executing database search with query:", query);
  
    try {
      const results = await OfacSanctionedEntityModel.find(query).lean().exec();
  
      if (!results.length) {
        logger.info("No results found with the given query.");
        return [];
      }
  
      const sanctionedResults = results.map((entity: IOfacSanctionedEntity) => {
        const matchQuality = this.calculateMatchQuality(entity, params);
        return {
          id: entity.id,
          name: entity.name,
          country: entity.country,
          programs: entity.programs || [],
          addresses: entity.addresses || [],
          features: entity.features || [],
          dateOfBirth: entity.dateOfBirth?.year || "Unknown",
          matchQuality, // Add matchQuality
        };
      });
  
      return sanctionedResults;
    } catch (error) {
      logger.error("Error searching sanctions:", error.message);
      throw new Error("Database query failed");
    }
  }

  // Load sanctions from XML file and save to the database
  async loadSanctionsFromFile(): Promise<void> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      if (!result?.sdnList?.sdnEntry) {
        throw new Error("Invalid XML structure: sdnEntry not found.");
      }

      const entities = this.processEntities(result.sdnList.sdnEntry);
      await OfacSanctionedEntityModel.bulkWrite(
        entities.map((entity) => ({
          updateOne: {
            filter: { id: entity.id },
            update: entity,
            upsert: true,
          },
        }))
      );

      console.log("Sanctions loaded and database updated.");
    } catch (error) {
      console.error("Error loading sanctions from file:", error.message);
    }
  }

  // Process XML data into entities matching the model
  private processEntities(entries: any[]): any[] {
    return entries
      .map((entry, index) => {
        try {
          return {
            id: entry.uid?.[0] || "Unknown",
            name: entry.firstName?.[0] || entry.lastName?.[0] || "Unknown",
            country:
              entry.addressList?.[0]?.address?.[0]?.country?.[0] || "Unknown",
            aliases:
              entry.akaList?.[0]?.aka?.map((aka: any) => aka.akaName?.[0]) ||
              [],
            addresses:
              entry.addressList?.[0]?.address?.map(
                (addr: any) => addr.city?.[0]
              ) || [],
            lastUpdated: new Date(),
          };
        } catch (err) {
          logger.error(
            `Error processing entry at index ${index}: ${err.message}`
          );
          return null; // Skip this entry
        }
      })
      .filter(Boolean); // Remove null entries
  }

  async checkForUpdates(): Promise<Boolean> {
    try {
      const response = await axios.get(this.changesApi);
      const latestChangeDate = response.data?.dateLastPublished;

      if (this.lastCheckedDate !== latestChangeDate) {
        console.log("Change detected. Updating database...");
        this.lastCheckedDate = latestChangeDate;
        await this.loadSanctionsFromFile();
        return true;
      } else {
        logger.info("No changes detected.");
        return false;
      }
    } catch (error) {
      logger.error("Error checking for updates:", error.message);
    }
  }
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/alive`);
      return response.status === 200;
    } catch (error) {
      console.error("OFAC API health check failed:", error.message);
      return false;
    }
  }
}

export default new OfacSanctionService();
