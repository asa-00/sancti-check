import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Extending the Request interface to include a `user` property
export interface AuthRequest extends Request {
  user?: string;
}

// Define the middleware as a RequestHandler
export const authMiddleware: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return; // Ensure `void` is returned
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.user = decoded.userId; // Attach user info to the request object
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return; // Ensure `void` is returned
  }
};

export default authMiddleware;
