import { Request, Response } from 'express';
import User from '../models/User';
import { register, login } from '../services/authService'; // Ensure these functions are defined in authService.ts

// Login controller
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const token = await login(email, password); // Using the login function here
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Register controller
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    const token = await register(name, email, password); // Using the register function here
    res.json({ token });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export { loginUser as login, registerUser as register };