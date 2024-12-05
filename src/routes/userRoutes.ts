import express, { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import USER from "../models/User"; // Importing the User model
import { IUser } from '../interfaces/IUser'; // Assuming you have a user interface defined

const router = express.Router();

// Route to store a new user
router.post("/store", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await USER.create(req.body as IUser); // Type-casting to the IUser interface
    res.status(201).json(user); // Send the created user with status 201
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

// Route to get all users
router.get("/get", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await USER.find<IUser>({});
    res.status(200).json(users); // Send all users with status 200
  } catch (error) {
    next(error); // Pass the error to the error-handling middleware
  }
});

export default router;
