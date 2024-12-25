import User from '../models/User';
import { IUser } from '../interfaces/IUser';
import logger from '../utils/logger';

export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    return await User.find().select('-password');
  } catch (error) {
    logger.error('Error fetching users:', { message: error.message, stack: error.stack });
    throw new Error('Error fetching users');
  }
};

export const getUserById = async (userId: string): Promise<IUser | null> => {
  try {
    return await User.findById(userId).select('-password');
  } catch (error) {
    logger.error('Error fetching user by ID:', { message: error.message, stack: error.stack });
    throw new Error('Error fetching user by ID');
  }
};

export const updateUser = async (userId: string, updateData: Partial<IUser>): Promise<IUser | null> => {
  try {
    return await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      logger.warn('User update failed: Duplicate key error');
      throw new Error('User already exists');
    } else {
      logger.error('Error updating user:', { message: error.message, stack: error.stack });
      throw new Error('Error updating user');
    }
  }
};

export const deleteUser = async (userId: string): Promise<IUser | null> => {
  try {
    return await User.findByIdAndDelete(userId).select('-password');
  } catch (error) {
    logger.error('Error deleting user:', { message: error.message, stack: error.stack });
    throw new Error('Error deleting user');
  }
};