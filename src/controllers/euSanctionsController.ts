import { Request, Response } from "express";
import EUSanctionService from "../services/euSanctionsService";
import logger from "../utils/logger"; 


export const loadSanctions = async (req: Request, res: Response): Promise<void> => {
  try {
    await EUSanctionService.loadSanctions();
    res.status(200).json({ message: "EU sanctions list successfully loaded." });
  } catch (error) {
    res.status(500).json({ message: "Error loading EU sanctions list", error: error.message });
  }
};

// Check if a user is sanctioned
export const searchSanctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, lastName, dateOfBirth, placeOfBirth } = req.body; // Fields to check

  try {
    const sanctions = await EUSanctionService.searchSanctions({
      firstName,
      lastName,
      placeOfBirth,
      dateOfBirth
    });
    if (sanctions.length > 0) {
      logger.info(
        'Sanctions found in European Union sanctions List',
        'info'
      );
    }
    res.json({
      sanctioned: sanctions.length > 0,
      individuals: sanctions,
    });
  } catch (error: any) {
    logger.error('Error checking sanctioned user:', error.message);
    res.status(500).json({ message: error.message });
  }
};

/* export const searchSanctions = async (req: Request, res: Response): Promise<void> => {
  
  try {
    const results = await EUSanctionService.searchSanctions(req.body);
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Error searching EU sanctions list", error: error.message });
  }
}; */

export const checkForUpdates = async (req: Request, res: Response): Promise<void> => {
  try {
    const isUpdated = await EUSanctionService.checkForUpdates();
    res.status(200).json({
      message: isUpdated ? "EU sanctions list updated." : "No new updates found.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error checking for updates", error: error.message });
  }
};
