import axios from "axios";
import xml2js from "xml2js";
import { v4 as uuidv4 } from "uuid";
import { UKSanctionedEntityModel } from "../models/UkSanctionedEntity";
import logger from "../utils/logger";
import { IUKSanctionedEntity } from "../interfaces/IUKSanctionedEntity";
import { ISanctionsSearchParams } from "../interfaces/ISanctionedIndividual";

class UKSanctionService {
  private lastUpdatedDate: Date | null = null;
  private fileUrl =
    "https://assets.publishing.service.gov.uk/media/67641812cdb5e64b69e30880/UK_Sanctions_List.xml";

  async loadSanctions(): Promise<void> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      if (!result?.Designations?.Designation) {
        throw new Error("Invalid XML structure: Designation not found.");
      }
      logger.info("UK List XML data parsed successfully.");
      const entities = this.processEntities(result.Designations.Designation);
      logger.info(`Processed ${entities.length} entities.`);

      if (entities.length === 0) {
        throw new Error("No valid entities were parsed from XML.");
      }

      await UKSanctionedEntityModel.bulkWrite(
        entities.map((entity) => ({
          updateOne: {
            filter: { id: entity.entityId },
            update: { $set: entity },
            upsert: true,
          },
        }))
      );

      logger.info("Sanctions loaded and database updated successfully.");
    } catch (error) {
      logger.error("Error loading sanctions:", error.message);
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
  }

  private processEntities(entries: any[]): IUKSanctionedEntity[] {
    return entries
      .map((entry, index) => {
        const parseDate = (dateString: string) => {
          const [day, month, year] = dateString.split("/");
          return new Date(`${year}-${month}-${day}`);
        };
        try {
          const id =
            entry.logicalId?.[0] || entry.euReferenceNumber?.[0] || uuidv4();
          return {
            id: id,
            entityId: entry.EntityID?.[0] || id,
            uniqueID: `${entry.UniqueID?.[0]}-${index}` || "Unknown",
            ofsiGroupID: entry.OFSIGroupID?.[0],
            unReferenceNumber: entry.UNReferenceNumber?.[0],
            names:
              entry.Names?.[0]?.Name?.map((name: any) => ({
                name: name.Name6?.[0] || "",
                type: name.NameType?.[0] || "Unknown",
              })) || [],
            nonLatinNames:
              entry.NonLatinNames?.[0]?.NonLatinName?.map(
                (name: any) => name.NameNonLatinScript?.[0]
              ) || [],
            regimeName: entry.RegimeName?.[0],
            individualEntityShip: entry.IndividualEntityShip?.[0],
            designationSource: entry.DesignationSource?.[0],
            sanctionsImposed: [entry.SanctionsImposed?.[0]],
            addresses:
              entry.Addresses?.[0]?.Address?.map((addr: any) => ({
                addressLine1: addr.AddressLine1?.[0],
                addressLine2: addr.AddressLine2?.[0],
                addressLine3: addr.AddressLine3?.[0],
                addressLine4: addr.AddressLine4?.[0],
                addressLine5: addr.AddressLine5?.[0],
                addressLine6: addr.AddressLine6?.[0],
                country: addr.AddressCountry?.[0],
              })) || [],
            phoneNumbers: entry.PhoneNumbers?.[0]?.PhoneNumber,
            emailAddresses: entry.EmailAddresses?.[0]?.EmailAddress,
            otherInformation: entry.OtherInformation?.[0],
            dateDesignated: parseDate(entry.DateDesignated[0]),
            lastUpdated: parseDate(entry.LastUpdated?.[0]),
          };
        } catch (err) {
          logger.error(
            `Error processing entry at index ${index}: ${err.message}`
          );
          return null; // Skip invalid entries
        }
      })
      .filter(Boolean);
  }

  async searchSanctions(params: ISanctionsSearchParams): Promise<
    {
      firstName: string;
      secondName: string;
      thirdName: string;
      primaryName: string;
      aliases: string[];
      placeOfBirth: { country: string };
      dateOfBirth: { year: string };
      matchQuality: string;
      score: number;
    }[]
  > {
    const query: any = {};

    // Combine firstName and lastName into a single query for names
    if (params.firstName || params.lastName) {
      const nameParts: string[] = [];
      if (params.firstName) {
        nameParts.push(params.firstName);
      }
      if (params.lastName) {
        nameParts.push(params.lastName);
      }
      const nameRegex = new RegExp(nameParts.join(" "), "i");
      query["names.name"] = { $regex: nameRegex }; // Match against `names.name`

      logger.info("Executing database search with query:", { nameParts: params.firstName, nameRegx: query["names.name"]  });
    }

    // Match place of birth by country
/*     if (params.placeOfBirth?.country) {
      query["addresses.addressCountry"] = {
        $regex: new RegExp(params.placeOfBirth.country, "i"),
      };
    }
 */
    // Match date of birth by the year
   /*  if (params.dateOfBirth?.year) {
      query["dateDesignated"] = {
        $gte: new Date(`${params.dateOfBirth.year}-01-01`),
        $lte: new Date(`${params.dateOfBirth.year}-12-31`),
      };
    } */

    logger.info("Executing database search with query:", JSON.stringify(query));

    try {
      const results = await UKSanctionedEntityModel.find(query).lean().exec();

      if (!results.length) {
        logger.info("No results found with the given query.");
        return [];
      }

      // Map results with scoring logic
      const scoredResults = results.map((entity) => {
        let score = 0;
        const totalFields = 4; // Number of matching criteria
        let matchedFields = 0;

        // Scoring logic for names
        if (
          params.firstName &&
          entity.names.some((name) =>
            name.name.toLowerCase().includes(params.firstName.toLowerCase())
          )
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.lastName &&
          entity.names.some((name) =>
            name.name.toLowerCase().includes(params.lastName.toLowerCase())
          )
        ) {
          score += 1;
          matchedFields += 1;
        }

        // Scoring logic for place of birth
        if (
          params.placeOfBirth?.country &&
          entity.addresses.some((address) =>
            address.country
              ?.toLowerCase()
              .includes(params.placeOfBirth.country.toLowerCase())
          )
        ) {
          score += 1;
          matchedFields += 1;
        }

        // Scoring logic for date of birth
        if (
          params.dateOfBirth?.year &&
          new Date(entity.dateDesignated).getFullYear() ===
            parseInt(params.dateOfBirth.year, 10)
        ) {
          score += 1;
          matchedFields += 1;
        }

        const matchQuality =
          matchedFields === totalFields
            ? "High"
            : matchedFields > 0
            ? "Medium"
            : "Low";

        return {
          firstName: entity.names[0]?.name || "",
          secondName: entity.names[1]?.name || "",
          thirdName: entity.names[2]?.name || "",
          primaryName:
            entity.names.find((name) => name.type === "Primary Name")?.name ||
            "",
          aliases: entity.names
            .filter((name) => name.type === "Alias")
            .map((alias) => alias.name),
          placeOfBirth: {
            country: entity.addresses[0]?.country || "",
          },
          dateOfBirth: {
            year: new Date(entity.dateDesignated).getFullYear().toString(),
          },
          matchQuality,
          score: (score / totalFields) * 100, // Convert score to percentage
        };
      });

      // Sort results by score in descending order
      return scoredResults.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error("Error searching UK sanctions list:", error.message);
      throw new Error("Database query failed");
    }
  }

  async searchSanctionsNew(params: any): Promise<IUKSanctionedEntity[]> {
    const query: any = {};

    if (params.name) {
      query["names.name"] = { $regex: new RegExp(params.name, "i") };
    }

    if (params.country) {
      query["addresses.country"] = { $regex: new RegExp(params.country, "i") };
    }

    return UKSanctionedEntityModel.find(query).lean().exec();
  }

  // Check for updates in the UK sanctions list
  async checkForUpdates(): Promise<boolean> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      const dateGenerated = result?.Designations?.DateGenerated?.[0];
      if (!dateGenerated) {
        throw new Error("Invalid XML structure: DateGenerated not found.");
      }

      // Parse the `DateGenerated` field
      const [day, month, year] = dateGenerated.split("/").map(Number);
      const generatedDate = new Date(year, month - 1, day);

      if (isNaN(generatedDate.getTime())) {
        throw new Error(
          `Invalid date format in DateGenerated: ${dateGenerated}`
        );
      }

      // Compare the generated date with the last known update date
      if (this.lastUpdatedDate && this.lastUpdatedDate >= generatedDate) {
        logger.info("No updates detected in the UK sanctions list.");
        return false;
      }

      // Update the last updated date and reload the sanctions
      this.lastUpdatedDate = generatedDate;
      logger.info(
        `Detected updates in the UK sanctions list. New date: ${dateGenerated}. Reloading...`
      );
      await this.loadSanctions();
      return true;
    } catch (error) {
      logger.error(
        "Error checking for updates in the UK sanctions list:",
        error.message
      );
      throw error;
    }
  }
}

export default new UKSanctionService();