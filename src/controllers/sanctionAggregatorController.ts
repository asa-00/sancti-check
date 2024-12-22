import { Request, Response } from "express";
import SanctionAggregatorService from "../services/sanctionsAggregatorService";

// Controller to search for sanctions
export const searchSanctions = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, placeOfBirth, dateOfBirth, userId } = req.body;

  // Construct search parameters based on the request body
  const searchParams = {
    userId,
    firstName,
    lastName,
    placeOfBirth,
    dateOfBirth
  };

  try {
    // Get aggregated results from the SanctionAggregatorService
    const aggregatedResults = await SanctionAggregatorService.aggregateSanctions(searchParams);

    // Return the aggregated results as a response
    res.status(200).json(aggregatedResults);
  } catch (error) {
    // Handle any errors during the aggregation process
    console.error("Error during sanction search aggregation:", error);
    res.status(500).json({ message: "Error during sanction search aggregation", error: error.message });
  }
};
