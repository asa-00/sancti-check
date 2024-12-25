import bcrypt from 'bcryptjs';
import User from '../models/User';
import { IUser } from '../interfaces/IUser';
import { generateAccessToken, generateRefreshToken } from './tokenService';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

export const register = async (name: string, email: string, password: string, role: string = 'user'): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const newUser = new User({ name, email, password, role });
    const refreshToken = generateRefreshToken(newUser);
    newUser.refreshToken = refreshToken;
    await newUser.save();
    return { accessToken: generateAccessToken(newUser), refreshToken };
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      logger.warn('User registration failed: Email already in use');
      throw new Error('Email already in use');
    } else {
      logger.error('Error registering user:', { message: error.message, stack: error.stack });
      throw new Error('Error registering user');
    }
  }
};

export const login = async (email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Invalid email or password');
      throw new Error('Invalid email or password');
    }

    // Debugging logs to check the passwords
    logger.debug('Comparing passwords', { plainTextPassword: password, hashedPassword: user.password });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Invalid email or password');
      throw new Error('Invalid email or password');
    }

    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken: generateAccessToken(user), refreshToken };
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      // Log validation errors as warnings
      logger.warn(error.message);
    } else {
      // Log other errors as errors
      logger.error('Error logging in user:', { message: error.message, stack: error.stack });
    }
    throw new Error(error.message);
  }
};
