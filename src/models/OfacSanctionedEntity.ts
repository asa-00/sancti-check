import mongoose, { Schema, Document } from "mongoose";

// Define the interface for an OFAC sanctioned entity
export interface IOfacSanctionedEntity extends Document {
  dateOfBirth?: { typeOfDate?: string; year?: string }; // Date of birth field
  firstName: string;
  secondName?: string;
  thirdName?: string;
  placeOfBirth?: { city?: string; stateProvince?: string; country?: string }; // Place of birth details
  id: string;
  name: string;
  country?: string; // Optional, as some entities might not have a country
  aliases?: string[]; // Optional array of aliases
  addresses?: string[]; // Optional array of addresses
  programs?: string[]; // Optional array of sanction programs
  features?: { type: string; value: string; dateRange?: { fromDate: string; toDate: string } }[]; // Optional feature list
  lastUpdated: Date;
}

// Define the schema for an OFAC sanctioned entity
const OfacSanctionedEntitySchema = new Schema<IOfacSanctionedEntity>({
  id: { type: String, required: true, unique: true }, // Unique identifier for the entity
  name: { type: String, required: true }, // Name of the entity
  firstName: { type: String, required: true },
  secondName: { type: String },
  thirdName: { type: String },
  country: { type: String }, // Country of origin or residence
  aliases: [{ type: String }], // List of aliases
  addresses: [{ type: String }], // List of addresses
  programs: [{ type: String }], // List of sanction programs
  features: [
    {
      type: { type: String }, // Type of feature
      value: { type: String }, // Value associated with the feature
      dateRange: {
        fromDate: { type: String }, // Optional start date
        toDate: { type: String }, // Optional end date
      },
    },
  ],
  dateOfBirth: {
    typeOfDate: { type: String },
    year: { type: String },
  },
  placeOfBirth: {
    city: { type: String },
    stateProvince: { type: String },
    country: { type: String },
  },
  lastUpdated: { type: Date, default: Date.now }, // Timestamp for last update
});

// Export the OFAC sanctioned entity model
export const OfacSanctionedEntityModel = mongoose.model<IOfacSanctionedEntity>(
  "OfacSanctionedEntity",
  OfacSanctionedEntitySchema
);
