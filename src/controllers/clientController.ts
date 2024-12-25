import { Request, Response } from 'express';
import { getAllClients, getClientById, createClient, updateClient, deleteClient } from '../services/clientService';
import logger from '../utils/logger';

export const getAllClientsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    logger.error('Error fetching clients:', error.message);
    res.status(500).json({ message: 'Error fetching clients' });
  }
};

export const getClientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await getClientById(req.params.id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    logger.error('Error fetching client:', error.message);
    res.status(500).json({ message: 'Error fetching client' });
  }
};

export const createClientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    logger.error('Error creating client:', error.message);
    res.status(400).json({ message: 'Error creating client' });
  }
};

export const updateClientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await updateClient(req.params.id, req.body);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    logger.error('Error updating client:', error.message);
    res.status(500).json({ message: 'Error updating client' });
  }
};

export const deleteClientController = async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await deleteClient(req.params.id);
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('Error deleting client:', error.message);
    res.status(500).json({ message: 'Error deleting client' });
  }
};
export { getAllClients, getClientById, createClient, updateClient, deleteClient };

