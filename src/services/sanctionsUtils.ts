import { transliterate } from 'transliteration';
import { ISanctionsSearchParams, ISanctionedEntity } from '../interfaces/ISanctionedIndividual';
import { Model } from 'mongoose';

interface IFieldMappings {
  name: (entity: any) => string;
  aliases: (entity: any) => string[];
  birthdates: (entity: any) => { date: Date | null; city: string; country: string }[];
}

export const buildQuery = (params: ISanctionsSearchParams): any => {
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

  return query;
};

export const calculateMatchQuality = (matchedFields: number, totalFields: number): string => {
  if (matchedFields === totalFields) {
    return "High";
  } else if (matchedFields > 0) {
    return "Medium";
  } else {
    return "Low";
  }
};

export const scoreAndSortResults = (results: any[], params: ISanctionsSearchParams, fieldMappings: IFieldMappings): ISanctionedEntity[] => {
  const scoredResults = results.map((entity) => {
    let score = 0;
    const totalFields = 4; // Number of potential matching fields
    let matchedFields = 0;

    const name = fieldMappings.name(entity);
    const aliases = fieldMappings.aliases(entity);
    const birthdates = fieldMappings.birthdates(entity);

    // Scoring logic
    if (
      params.firstName &&
      name.toLowerCase().includes(params.firstName.toLowerCase())
    ) {
      score += 1;
      matchedFields += 1;
    }
    if (
      params.lastName &&
      aliases.some((alias) =>
        alias.toLowerCase().includes(params.lastName.toLowerCase())
      )
    ) {
      score += 1;
      matchedFields += 1;
    }
    if (
      params.placeOfBirth?.country &&
      birthdates.some((birth) =>
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
      birthdates.some(
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
      firstName: name.split(" ")[0] || "",
      secondName: aliases[0]?.split(" ")[1] || "",
      thirdName: aliases[0]?.split(" ")[2] || "",
      placeOfBirth: {
        city: birthdates[0]?.city || "",
        stateProvince: "",
        country: birthdates[0]?.country || "",
      },
      dateOfBirth: {
        typeOfDate: "Gregorian",
        year: birthdates[0]?.date
          ? new Date(birthdates[0].date).getFullYear().toString()
          : "",
      },
      matchQuality: quality,
      score: (score / totalFields) * 100,
    };
  });

  return scoredResults.sort((a, b) => b.score - a.score); // Sort results by score in descending order
};

export const searchSanctions = async (model: Model<any>, params: ISanctionsSearchParams, fieldMappings: IFieldMappings): Promise<ISanctionedEntity[]> => {
  const query = buildQuery(params);
  try {
    const results = await model.find(query).lean().exec();
    return scoreAndSortResults(results, params, fieldMappings);
  } catch (error) {
    throw new Error("Database query failed");
  }
};