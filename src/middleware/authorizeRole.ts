import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const authorizeRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user as any).role === role) {
      next();
    } else {
      logger.warn('Unauthorized access attempt');
      res.status(403).json({ message: 'Forbidden' });
    }
  };
};