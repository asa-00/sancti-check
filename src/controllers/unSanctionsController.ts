import { Request, Response } from 'express';
import SanctionService from '../services/unSanctionsService';
import logger from '../utils/logger';

// Get all sanctions
/* export const getAllSanctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sanctions = await SanctionService.getAllSanctions();
    if (sanctions.length > 0) {
      logger.info(
        `${sanctions.length} sanctions returned from United Nations Security Council Consolidated List`,
        'info'
      );
    }
    res.json(sanctions);
  } catch (error: any) {
    logger.error('Error fetching sanctions:', error.message);
    res.status(500).json({ message: error.message });
  }
}; */

// Check if a user is sanctioned
export const checkSanctionedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, country, firstName, lastName, dob, birthplace } = req.body; // Fields to check

  try {
    const sanctions = await SanctionService.searchSanctions({
      name,
      country,
      firstName,
      lastName,
      dob,
      birthplace,
    });
    if (sanctions.length > 0) {
      logger.info(
        'Sanctions found in United Nations Security Council Consolidated List',
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

// Get sanction by ID
/* export const getSanctionById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const sanction = await SanctionService.getSanctionById(id);
    if (!sanction) {
      logger.info(
        'Sanction not found in United Nations Security Council Consolidated List',
        'info'
      );
      res.status(404).json({ message: 'Sanction not found' });
    } else {
      logger.info(
        'Sanction returned from United Nations Security Council Consolidated List',
        'info'
      );
      res.json(sanction);
    }
  } catch (error: any) {
    logger.error('Error fetching sanction by ID:', error.message);
    res.status(500).json({ message: error.message });
  }
}; */

// Load UN Consolidated List data into the database
export const loadUnConsolidated = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await SanctionService.loadSanctions();
    res.status(200).json({
      message: 'Sanctions loaded and database updated.',
    });
  } catch (error: any) {
    logger.error('Error loading sanctions:', error.message);
    res
      .status(500)
      .json({ message: 'Error loading sanctions', error: error.message });
  }
};

// Check for updates in the UN Consolidated List
export const checkUnConsolidateFileUpdate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const isChanged = await SanctionService.checkForUpdates();
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
