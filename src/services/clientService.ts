import Client from '../models/Client';
import { IClient } from '../interfaces/IClient';
import logger from '../utils/logger';

export const getAllClients = async (): Promise<IClient[]> => {
  try {
    return await Client.find();
  } catch (error) {
    logger.error('Error fetching clients:', { message: error.message, stack: error.stack });
    throw new Error('Error fetching clients');
  }
};

export const getClientById = async (clientId: string): Promise<IClient | null> => {
  try {
    return await Client.findById(clientId);
  } catch (error) {
    logger.error('Error fetching client by ID:', { message: error.message, stack: error.stack });
    throw new Error('Error fetching client by ID');
  }
};

export const createClient = async (clientData: IClient): Promise<IClient> => {
  try {
    const newClient = new Client(clientData);
    await newClient.save();
    return newClient;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      logger.warn('Client creation failed: Duplicate key error');
      throw new Error('Client already exists');
    } else {
      logger.error('Error creating client:', { message: error.message, stack: error.stack });
      throw new Error('Error creating client');
    }
  }
};

export const updateClient = async (clientId: string, updateData: Partial<IClient>): Promise<IClient | null> => {
  try {
    return await Client.findByIdAndUpdate(clientId, updateData, { new: true });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      logger.warn('Client update failed: Duplicate key error');
      throw new Error('Client already exists');
    } else {
      logger.error('Error updating client:', { message: error.message, stack: error.stack });
      throw new Error('Error updating client');
    }
  }
};

export const deleteClient = async (clientId: string): Promise<IClient | null> => {
  try {
    return await Client.findByIdAndDelete(clientId);
  } catch (error) {
    logger.error('Error deleting client:', { message: error.message, stack: error.stack });
    throw new Error('Error deleting client');
  }
};