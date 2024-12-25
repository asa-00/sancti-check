import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User'; 
import { IUser } from '../interfaces/IUser'; 
import logger from '../utils/logger';

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || '0H2vq41TxOhrwumokJasF9K5gJFpR4MNTLmscUo5CTE=';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'ePMihH+CliEVbGWe9wkiofxoZQlkp5d7npGa6JhgUGA=';

interface CustomRequest extends Request {
  user?: JwtPayload | string;
}

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign({ id: user.id, name: user.name }, accessTokenSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign({ id: user.id, name: user.name }, refreshTokenSecret, { expiresIn: '7d' });
};

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const token = req.cookies?.accessToken || req.headers['authorization'];
  if (!token) {
    logger.warn('No token provided for authentication');
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      logger.error('Token verification failed:', err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn('No refresh token provided');
    res.sendStatus(401);
    return;
  }

  jwt.verify(refreshToken, refreshTokenSecret, async (err, user) => {
    if (err) {
      logger.error('Refresh token verification failed:', err.message);
      return res.sendStatus(403);
    }

    try {
      const dbUser = await UserModel.findById((user as JwtPayload).id);
      if (!dbUser) {
        logger.warn('User not found for refresh token');
        return res.sendStatus(403);
      }

      const newAccessToken = generateAccessToken(dbUser);
      res.json({ accessToken: newAccessToken });
    } catch (dbError) {
      logger.error('Error fetching user from database:', dbError.message);
      res.sendStatus(500);
    }
  });
};