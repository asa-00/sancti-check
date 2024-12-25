import { Request, Response } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../services/userService';
import logger from '../utils/logger';

export const getAllUsersController = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await updateUser(req.params.id, req.body);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    logger.error('Error updating user:', error.message);
    res.status(500).json({ message: 'Error updating user' });
  }
};

export const deleteUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await deleteUser(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Error deleting user' });
  }
};