import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import logger from '../src/utils/logger';

dotenv.config();

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_DB,
  DATABASE_COLLECTION
} = process.env;

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_DB}?authSource=admin`;

// Validate required environment variables
if (!DATABASE_USERNAME || !DATABASE_PASSWORD || !DATABASE_DB || !DATABASE_HOST || !DATABASE_PORT) {
  logger.error('Missing required database configuration environment variables.');
  process.exit(1); 
}

export const connectDB = async (): Promise<void> => {
  try {
    const options: ConnectOptions = {
      serverSelectionTimeoutMS: 10000,  
      socketTimeoutMS: 45000, 
      dbName: DATABASE_DB, 
    };

    const connection = await mongoose.connect(URI, options);

    // Accessing a specific collection
    const db = connection.connection.db;
    const collection = db.collection(DATABASE_COLLECTION);

    // Logging connection details
    logger.info('Database Connected Successfully...');
    logger.info(`MongoDB Connected: ${connection.connection.name}`);
    logger.info(`Connected to: ${db.databaseName}`);
    logger.info(`Collection count: ${Object.keys(connection.connection.collections).length}`);
    logger.info(`Collection accessed: ${collection.collectionName}`);
  } catch (err) {
    logger.error(`Error while connecting to the database: ${err}`);
  }
};

// Immediately invoke the connection function
connectDB().catch((err) => logger.error(`Database connection error: ${err}`));
