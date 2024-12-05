import mongoose from "mongoose";
import dotenv from "dotenv";
import USER from "../models/User"; // Import the Mongoose User model
import { IUser } from "../interfaces/IUser"; // Import the User interface

dotenv.config();

// Define the user to be added
const newUser: IUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  password: "securepassword123", // Ideally hashed, but raw for demonstration
  // Add any other required fields here
};

// Function to perform the migration
async function addUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sancticheckdb");
    console.log("Connected to the database...");

    // Check if the user already exists
    const existingUser = await USER.findOne({ email: newUser.email });
    if (existingUser) {
      console.log("User already exists:", existingUser);
    } else {
      // Add the user to the database
      const createdUser = await USER.create(newUser);
      console.log("User added successfully:", createdUser);
    }
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log("Disconnected from the database...");
  }
}

// Run the migration
addUser().catch((error) => console.error("Unhandled error:", error));
