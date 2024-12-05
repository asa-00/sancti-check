import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import logger from '../src/utils/logger';

dotenv.config();

mongoose.set('strictQuery', false);

// Environment Variables
const DATABASE_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || '';
const DATABASE_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || '';
const DATABASE_DB = process.env.MONGO_INITDB_DATABASE || '';
const DATABASE_HOST = process.env.DATABASE_HOST || 'localhost';
const DATABASE_PORT = process.env.DATABASE_PORT || '27017';
const DATABASE_COLLECTION = process.env.DATABASE_COLLECTION || 'defaultCollection';

const URI = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}`;

export const connectDB = async (): Promise<void> => {
  try {
    const options: ConnectOptions = {
      dbName: DATABASE_DB, // Ensures the correct database is selected
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
    logger.error(`Error while connecting to the database: ${(err as Error).message}`);
  }
};

// Immediately invoke the connection function
connectDB().catch((err) => logger.error(`Database connection error: ${err}`));

