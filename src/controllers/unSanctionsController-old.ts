import { Request, Response } from 'express';
import SanctionService from '../services/unSanctionsService';
import logger from '../utils/logger';

// Get all sanctions
export const getAllSanctions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sanctions = await SanctionService.sanctionedIndividuals;
    if (sanctions.length > 0) {
      logger.info(`${sanctions.length} Sactions returned from United Nations Security Council Consolidated List`, 'info');
    }
    res.json(sanctions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if a user is sanctioned
export const checkSanctionedUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, country, firstName, lastName, dob, birthplace } = req.body; // Fields to check

  try {
    const sanctions = SanctionService.searchSanctions({ name, country, firstName, lastName, dob, birthplace });
    if ((await sanctions).length > 0) {
      logger.info('Sactions returned from United Nations Security Council Consolidated List', 'info');
    }
    res.json({ sanctioned: (await sanctions).length > 0, individuals: sanctions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sanction by ID (if you want to implement this, you would need to adjust your service)
export const getSanctionById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  try {
    const sanction = SanctionService.sanctionedIndividuals.find(
      ind => ind.dataId === id
    );
    if (!sanction) {
      logger.info('Sanction not found - United Nations Security Council Consolidated List', 'info');
      res.status(404).json({ message: 'Sanction not found' });
    } else {
      logger.info('Sanction returned - United Nations Security Council Consolidated List', 'info');
    }
    res.json(sanction);
  } catch (error) {
    logger.error('Error fetching sanction:', error);
    res.status(500).json({ message: 'An error occurred while processing your request' });
  }
};

export const loadUnConsolidated = async (req: Request, res: Response): Promise<void> => {
  try {
    await SanctionService.loadSanctions();
    res.status(200).json({ message: "Sanctions loaded and database updated." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error loading sanctions", error: error.message });
  }
};

export const checkUnConsolidateFileUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const isChanged = await SanctionService.checkForUpdates();
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
