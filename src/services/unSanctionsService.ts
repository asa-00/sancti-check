import axios from "axios";
import xml2js from "xml2js";
import {
  UnSanctionedEntityModel,
  IUnSanctionedEntity,
} from "../models/UnSanctionedEntity";
import logger from "../utils/logger";
import { ISanctionsSearchParams } from "../interfaces/ISanctionedIndividual";
import { calculateMatchQuality, searchSanctions } from './sanctionsUtils';

class UnSanctionService {
  private fileUrl =
    "https://scsanctions.un.org/resources/xml/en/consolidated.xml";
  public sanctionedIndividuals: IUnSanctionedEntity[] = [];

  // Load sanctions from XML file and save to the database
  async loadSanctions(): Promise<void> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);
  
      if (!result?.CONSOLIDATED_LIST?.INDIVIDUALS?.[0]?.INDIVIDUAL) {
        throw new Error("Invalid XML structure: INDIVIDUAL not found.");
      }
  
      logger.info("UN list XML data parsed successfully.");
  
      const entities = this.processEntities(
        result.CONSOLIDATED_LIST.INDIVIDUALS[0].INDIVIDUAL
      );
        
      if (entities.length === 0) {
        throw new Error("No valid entities were parsed from XML.");
      }

      logger.info(`Processed ${entities.length} entities.`);
  
      const bulkOperations = entities.map((entity) => ({
        updateOne: {
          filter: { dataId: entity.dataId },
          update: { $set: entity },
          upsert: true,
        },
      }));
  
      logger.info(`Executing bulkWrite with ${bulkOperations.length} operations.`);
      await UnSanctionedEntityModel.bulkWrite(bulkOperations);
  
      logger.info("Sanctions loaded and database updated successfully.");
    } catch (error) {
      logger.error(`Error loading sanctions: ${error.message}`, error);
      throw error;
    }
  }

  private parseDate(value: string): Date | undefined {
    if (!value || value.trim() === "") {
      logger.debug("Empty or missing date value encountered.");
      return undefined;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      logger.debug(`Invalid date encountered: ${value}`);
      return undefined;
    }
    return date;
  }; 
  

  // Process XML data into entities matching the model
  private processEntities(entries: any[]): IUnSanctionedEntity[] {
    return entries.map((entry) => {
      const entity: Partial<IUnSanctionedEntity> = {
        dataId: entry.DATAID?.[0] || "Unknown",
        firstName: entry.FIRST_NAME?.[0] || "",
        secondName: entry.SECOND_NAME?.[0],
        thirdName: entry.THIRD_NAME?.[0],
        unListType: entry.UN_LIST_TYPE?.[0] || "",
        referenceNumber: entry.REFERENCE_NUMBER?.[0] || "",
        listedOn: this.parseDate(entry.LISTED_ON?.[0]),
        nameOriginalScript: entry.NAME_ORIGINAL_SCRIPT?.[0],
        comments1: entry.COMMENTS1?.[0],
        titles: entry.TITLE?.map((title: any) => title.VALUE?.[0]).filter(Boolean),
        designations: entry.DESIGNATION?.map((d: any) => d.VALUE?.[0]).filter(Boolean),
        nationality: entry.NATIONALITY?.map((nat: any) => nat.VALUE?.[0]).filter(Boolean),
        listType: entry.LIST_TYPE?.map((lt: any) => lt.VALUE?.[0]).filter(Boolean),
  
        // Parse multiple LAST_DAY_UPDATED values into an array of Dates
        lastDayUpdated: entry.LAST_DAY_UPDATED?.[0]?.VALUE
          ? entry.LAST_DAY_UPDATED[0].VALUE.map((value: string) => this.parseDate(value)).filter(Boolean)
          : [],
  
        aliases: entry.INDIVIDUAL_ALIAS?.map((alias: any) => ({
          quality: alias.QUALITY?.[0] || "",
          aliasName: alias.ALIAS_NAME?.[0] || "",
        })).filter((alias: any) => alias.quality || alias.aliasName),
        
        placeOfBirth: entry.INDIVIDUAL_PLACE_OF_BIRTH?.[0]
          ? {
              city: entry.INDIVIDUAL_PLACE_OF_BIRTH[0].CITY?.[0],
              stateProvince: entry.INDIVIDUAL_PLACE_OF_BIRTH[0].STATE_PROVINCE?.[0],
              country: entry.INDIVIDUAL_PLACE_OF_BIRTH[0].COUNTRY?.[0],
            }
          : undefined,
        
        dateOfBirth: entry.INDIVIDUAL_DATE_OF_BIRTH?.[0]
          ? {
              typeOfDate: entry.INDIVIDUAL_DATE_OF_BIRTH[0].TYPE_OF_DATE?.[0],
              year: entry.INDIVIDUAL_DATE_OF_BIRTH[0].YEAR?.[0],
            }
          : undefined,
      };
  
      // Remove undefined or empty fields from the entity
      Object.keys(entity).forEach((key) => {
        const value = (entity as any)[key];
        if (
          value === undefined ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === "object" && Object.keys(value).length === 0)
        ) {
          delete (entity as any)[key];
        }
      });
  
      return entity as IUnSanctionedEntity;
    });
  }
  
  async searchSanctions(params: ISanctionsSearchParams): Promise<ISanctionsSearchParams[]> {
    const query: any = {};

    if (params.firstName) {
      query.firstName = { $regex: new RegExp(params.firstName, "i") };
    }
    if (params.lastName) {
      query.$or = [
        { secondName: { $regex: new RegExp(params.lastName, "i") } },
        { thirdName: { $regex: new RegExp(params.lastName, "i") } },
      ];
    }
    if (params.placeOfBirth?.country) {
      query["placeOfBirth.country"] = {
        $regex: new RegExp(params.placeOfBirth.country, "i"),
      };
    }
    if (params.dateOfBirth?.year) {
      query["dateOfBirth.year"] = params.dateOfBirth.year;
    }

    logger.info("Executing database search with query:", query);

    try {
      const results = await UnSanctionedEntityModel.find(query).lean().exec();
      logger.debug("Got result for search:", JSON.stringify(results, null, 2));
      const scoredResults = results.map((entity) => {
        let score = 0;
        const totalFields = 4; // Number of potential matching fields
        let matchedFields = 0;

        if (
          params.firstName &&
          entity.firstName
            .toLowerCase()
            .includes(params.firstName.toLowerCase())
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.lastName &&
          (entity.secondName
            ?.toLowerCase()
            .includes(params.lastName.toLowerCase()) ||
            entity.thirdName
              ?.toLowerCase()
              .includes(params.lastName.toLowerCase()))
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.placeOfBirth?.country &&
          entity.placeOfBirth?.country
            ?.toLowerCase()
            .includes(params.placeOfBirth.country.toLowerCase())
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.dateOfBirth?.year &&
          entity.dateOfBirth?.year === params.dateOfBirth.year
        ) {
          score += 1;
          matchedFields += 1;
        }

        const quality = calculateMatchQuality(matchedFields, totalFields)
 
        return {
          name: `${entity.firstName} ${entity.secondName} ${entity.thirdName}`,
          firstName: entity.firstName,
          secondName: entity.secondName || "",
          thirdName: entity.thirdName || "",
          placeOfBirth: entity.placeOfBirth || {},
          dateOfBirth: entity.dateOfBirth || { year: "Unknown"},
          score: (score / totalFields) * 100,
          matchQuality: quality,
        };
      });

      return scoredResults.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error("Error searching sanctions:", error.message);
      throw new Error("Database query failed");
    }
  }

  // Check for updates in the sanctions list and reload if necessary
  async checkForUpdates(): Promise<Boolean> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      if (!result?.CONSOLIDATED_LIST?.INDIVIDUALS?.[0]?.INDIVIDUAL) {
        logger.info("No changes detected in the sanctions list.");
        return false;
      }

      logger.info("Changes detected in the sanctions list. Reloading...");
      await this.loadSanctions();
      return true;
    } catch (error) {
      logger.error("Error checking for updates:", error.message);
      throw error;
    }
  }
}

export default new UnSanctionService();
