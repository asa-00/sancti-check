import { Request, Response } from 'express';
import { HighQualityResultModel } from '../models/HighQualityResult';
import logger from '../utils/logger';

export const getAllHighQualityResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const results = await HighQualityResultModel.find();
    res.json(results);
  } catch (error) {
    logger.error('Error fetching HighQualityResults:', error.message);
    res.status(500).json({ message: 'Error fetching HighQualityResults' });
  }
};

export const updateHighQualityResult = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isReviewed, reviewedBy, reviewComment } = req.body;

  try {
    const updatedResult = await HighQualityResultModel.findByIdAndUpdate(
      id,
      { isReviewed, reviewedBy, reviewComment },
      { new: true }
    );

    if (!updatedResult) {
      res.status(404).json({ message: 'HighQualityResult not found' });
      return;
    }

    res.json(updatedResult);
  } catch (error) {
    logger.error('Error updating HighQualityResult:', error.message);
    res.status(500).json({ message: 'Error updating HighQualityResult' });
  }
};