import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './database/db';
import logger from './src/utils/logger';

const app = express();
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_HOST = process.env.SERVER_HOST;

// Connect to MongoDB
connectDB();


// Middleware
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

import authRoutes from './src/routes/authRoutes';
import clientRoutes from './src/routes/clientRoutes';
import userRoutes from './src/routes/userRoutes';
import unSanctionsRoutes from './src/routes/unSanctionsRoutes';
import ofacSanctionsRoutes from './src/routes/ofacSanctionsRoutes';
import euSanctionsRoutes from './src/routes/euSanctionsRoutes';
import ukSanctionsRoutes from './src/routes/ukSanctionsRoutes';
import sanctionsAggregatorRoutes from './src/routes/sanctionsAggregatorRoutes';
import { errorHandler } from './src/utils/errorHandler'; 
import authMiddleware from './src/middleware/authMiddleware'; 
import highQualityResultRoutes from './src/routes/highQualityResultRoutes';

// Routes
app.use('/api/protected-route', authMiddleware)
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sanctions/un', unSanctionsRoutes);
app.use('/api/sanctions/ofac', ofacSanctionsRoutes);
app.use('/api/sanctions/eu', euSanctionsRoutes);
app.use('/api/sanctions/uk', ukSanctionsRoutes);
app.use('/api/sanctions', sanctionsAggregatorRoutes);
app.use('/api/sanctions/high-quality-results', highQualityResultRoutes);

// Health check route
app.use("/api/health", (req: Request, res: Response): void => {
  res.status(200).json({ 
    message: "Server up and running!",
    time: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler); 

app.listen(SERVER_PORT, () => {
  logger.info(`Server running on port ${SERVER_PORT}`);
});
