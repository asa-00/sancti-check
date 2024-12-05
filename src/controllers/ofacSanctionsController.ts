import { Request, Response } from "express";
import OfacSanctionService from "../services/ofacSanctionsService"; // The service that interacts with OFAC API

// Controller to search for sanctions
export const searchSanctions = async (req: Request, res: Response): Promise<void> => {
  const { dateOfBirth, placeOfBirth, firstName, lastName, dob, birthplace } = req.body;

  // Use the OfacSanctionService to search sanctions based on parameters
  const results = await OfacSanctionService.searchSanctions({
    placeOfBirth,
    firstName,
    lastName,
    dateOfBirth,
  });

  res.status(200).json(results);
};

// Controller to check the health of the OFAC API
export const checkHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  const isHealthy = await OfacSanctionService.checkHealth();

  if (!isHealthy) {
    res.status(503).json({ message: "OFAC API is not healthy" });
    return;
  }

  res.status(200).json({ message: "OFAC API is healthy" });
};

export const loadSDN = async (req: Request, res: Response): Promise<void> => {
  try {
    await OfacSanctionService.loadSanctionsFromFile();
    res.status(200).json({ message: "Sanctions loaded and database updated." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading sanctions", error: error.message });
  }
};

export const checkSDNFileUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const isChanged = await OfacSanctionService.checkForUpdates();
    if (isChanged) {
        res.status(200).json({ message: "Database checked for updates. Changes detected and updated" });
    } else {
        res.status(200).json({ message: "Database checked for updates. No changes available" });
    }
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error checking for updates", error: error.message });
  }
};
