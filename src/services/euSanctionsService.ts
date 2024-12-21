import axios from "axios";
import xml2js from "xml2js";
import { EuSanctionedEntityModel, IEUSanctionedEntity } from "../models/EuSanctionedEntity";
import logger from "../utils/logger";
import { transliterate } from 'transliteration';
import { ISanctionsSearchParams } from "../interfaces/ISanctionedIndividual";
import { calculateMatchQuality } from "./sanctionsUtils";
import { v4 as uuidv4 } from "uuid";

interface ISanctionedEntity {
  firstName: string;
  secondName: string;
  thirdName: string;
  placeOfBirth: {
    city?: string;
    stateProvince?: string;
    country?: string;
  };
  dateOfBirth: {
    typeOfDate?: string;
    year?: string;
  };
  matchQuality: string;
  score: number;
}

class EUSanctionService {
  private rssFeedUrl = "https://webgate.ec.europa.eu/fsd/fsf/public/rss";
  private fileUrl = "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw";
  private lastPubDate: string = "";

  // Load sanctions from XML file and save to the database
  async loadSanctions(): Promise<void> {
    try {
      const response = await axios.get(this.fileUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(response.data);

      logger.info("XML data parsed successfully.");

      if (!result?.export?.sanctionEntity) {
        throw new Error("Invalid XML structure: sanctionEntity not found.");
      }

      const entities = this.processEntities(result.export.sanctionEntity);

      logger.info(`Processed ${JSON.stringify(entities)} entities.`);

      await EuSanctionedEntityModel.bulkWrite(
        entities.map((entity) => ({
          updateOne: {
            filter: { id: entity.logicalId },
            update: { $set: entity },
            upsert: true,
          },
        }))
      );

      logger.info("EU sanctions list successfully loaded and database updated.");
    } catch (error) {
      logger.error("Error loading sanctions from the EU sanctions list:", error.message);
      throw error;
    }
  }

  // Check for updates in the EU sanctions list
  async checkForUpdates(): Promise<boolean> {
    try {
      const response = await axios.get(this.rssFeedUrl, { responseType: "text" });
      const parser = new xml2js.Parser();
      const rssData = await parser.parseStringPromise(response.data);

      const latestItem = rssData?.rss?.channel?.[0]?.item?.[0];
      const latestPubDate = latestItem?.pubDate?.[0];

      if (!latestPubDate || latestPubDate === this.lastPubDate) {
        logger.info("No new updates detected in the EU sanctions list.");
        return false;
      }

      this.lastPubDate = latestPubDate;
      logger.info("New EU sanctions list detected. Updating the database...");
      await this.loadSanctions();
      return true;
    } catch (error) {
      logger.error("Error checking for updates:", error.message);
      throw new Error("Failed to check for updates");
    }
  }

  // Search the EU sanctions list
  async searchSanctions(params: ISanctionsSearchParams): Promise<ISanctionedEntity[]> {
    const query: any = {};

    // Transliterate search parameters
    const transliteratedParams = {
      ...params,
      firstName: params.firstName ? transliterate(params.firstName) : undefined,
      lastName: params.lastName ? transliterate(params.lastName) : undefined,
      placeOfBirth: params.placeOfBirth?.country ? { country: transliterate(params.placeOfBirth.country) } : undefined,
    };

    // Construct query based on input parameters
    if (transliteratedParams.firstName) {
      query.name = { $regex: new RegExp(transliteratedParams.firstName, "i") }; // Search first name in `name`
    }
    if (transliteratedParams.lastName) {
      query.aliases = { $regex: new RegExp(transliteratedParams.lastName, "i") }; // Search aliases for last name
    }
    if (transliteratedParams.placeOfBirth?.country) {
      query["birthdates.country"] = {
        $regex: new RegExp(transliteratedParams.placeOfBirth.country, "i"),
      };
    }
    if (params.dateOfBirth?.year) {
      query["birthdates.date"] = {
        $gte: new Date(`${params.dateOfBirth.year}-01-01`),
        $lte: new Date(`${params.dateOfBirth.year}-12-31`),
      };
    }

    logger.info("Executing database search with query:", JSON.stringify(query));

    try {
      const results = await EuSanctionedEntityModel.find(query).lean().exec();

      const scoredResults = results.map((entity) => {
        let score = 0;
        const totalFields = 4; // Number of potential matching fields
        let matchedFields = 0;

        // Scoring logic
        if (
          params.firstName &&
          entity.name?.toLowerCase().includes(params.firstName.toLowerCase())
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.lastName &&
          entity.aliases?.some((alias) =>
            alias.toLowerCase().includes(params.lastName.toLowerCase())
          )
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.placeOfBirth?.country &&
          entity.birthdates?.some((birth) =>
            birth.country
              ?.toLowerCase()
              .includes(params.placeOfBirth.country.toLowerCase())
          )
        ) {
          score += 1;
          matchedFields += 1;
        }
        if (
          params.dateOfBirth?.year &&
          entity.birthdates?.some(
            (birth) =>
              birth.date &&
              new Date(birth.date).getFullYear() === Number(params.dateOfBirth.year)
          )
        ) {
          score += 1;
          matchedFields += 1;
        }

        const quality = calculateMatchQuality(matchedFields, totalFields);

        return {
          firstName: entity.name.split(" ")[0] || "",
          secondName: entity.aliases?.[0]?.split(" ")[1] || "",
          thirdName: entity.aliases?.[0]?.split(" ")[2] || "",
          placeOfBirth: {
            city: entity.birthdates?.[0]?.city || "",
            stateProvince: "",
            country: entity.birthdates?.[0]?.country || "",
          },
          dateOfBirth: {
            typeOfDate: "Gregorian",
            year: entity.birthdates?.[0]?.date
              ? new Date(entity.birthdates[0].date).getFullYear().toString()
              : "",
          },
          matchQuality: quality,
          score: (score / totalFields) * 100,
        };
      });

      return scoredResults.sort((a, b) => b.score - a.score); // Sort results by score in descending order
    } catch (error) {
      logger.error("Error searching EU sanctions:", error.message);
      throw new Error("Database query failed");
    }
  }

  // Process XML data into entities matching the model
  private processEntities(entries: any[]): any[] {
    return entries
      .map((entry, index) => {
        try {
          const regulationData = entry.regulation?.[0]?.$ || {};
          const regulations = regulationData
            ? {
                numberTitle: regulationData.numberTitle || "Unknown",
                publicationDate: regulationData.publicationDate
                  ? new Date(regulationData.publicationDate)
                  : null,
                url: regulationData.publicationUrl?.[0] || "Unknown",
              }
            : null;

          const aliases =
            entry.nameAlias?.map((alias: any) => alias.$?.wholeName) || [];
          const name = aliases[0] || "Unknown";

          const birthdates =
            entry.birthdate?.map((birth: any) => ({
              date: birth.$?.birthdate ? new Date(birth.$?.birthdate) : null,
              city: birth.$?.city || "Unknown",
              country: birth.$?.countryDescription || "Unknown",
            })) || [];

          const euReferenceNumber = entry.euReferenceNumber?.[0] || "Unknown";
          const id = entry.logicalId?.[0] || uuidv4();;

          const entityToSave = {
            id,
            euReferenceNumber,
            name,
            aliases,
            birthdates,
            regulations,
            lastUpdated: new Date(),
          };

          return entityToSave;
        } catch (err) {
          logger.error(`Error processing entry at index ${index}: ${err.message}`);
          return null; // Skip invalid entries
        }
      })
      .filter(Boolean); // Remove null entries
  }
}

export default new EUSanctionService();