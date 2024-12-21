import { Request, Response } from "express";
import UKSanctionService from "../services/ukSantionsService";
import ukSantionsService from "../services/ukSantionsService";
import logger from '../utils/logger';

export const loadSanctions = async (req: Request, res: Response): Promise<void> => {
  try {
    await UKSanctionService.loadSanctions();
    res.status(200).json({ message: "Sanctions loaded successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading sanctions.", error: error.message });
  }
};

export const searchSanctions = async (req: Request, res: Response): Promise<void> => {
  const { dateOfBirth, placeOfBirth, firstName, lastName } = req.body;

  // Use the OfacSanctionService to search sanctions based on parameters
  const results = await UKSanctionService.searchSanctions({
    placeOfBirth,
    firstName,
    lastName,
    dateOfBirth,
  });

  res.status(200).json(results);
};

// Check for updates in the UN Consolidated List
export const checkUnConsolidateFileUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const isChanged = await ukSantionsService.checkForUpdates();
    if (isChanged) {
      res.status(200).json({
        message: 'Database checked for updates. Changes detected and updated.',
      });
    } else {
      res.status(200).json({
        message: 'Database checked for updates. No changes available.',
      });
    }
  } catch (error: any) {
    logger.error('Error checking for updates:', error.message);
    res
      .status(500)
      .json({ message: 'Error checking for updates', error: error.message });
  }
};