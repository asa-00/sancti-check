// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../utils/errors';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  let statusCode: number;
  let errorMessage: string;

  if (err instanceof BadRequestError) {
    statusCode = 400;
    errorMessage = err.message;
  } else if (err instanceof mongoose.Error) {
    statusCode = 500;
    errorMessage = 'Database error';
  } else if (typeof err === 'string') {
    statusCode = 500;
    errorMessage = err;
  } else {
    statusCode = 500;
    errorMessage = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
