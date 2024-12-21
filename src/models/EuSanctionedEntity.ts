import mongoose, { Schema, Document } from "mongoose";

// Interface for birthdates
interface Birthdate {
  date: Date | null;
  city?: string;
  country?: string;
}

// Interface for regulations
interface Regulation {
  numberTitle: string;
  publicationDate: Date | null;
  url: string;
}

// Main interface for EU sanctioned entities
export interface IEUSanctionedEntity extends Document {
  id: string;
  euReferenceNumber: string;
  name: string;
  aliases: string[];
  citizenship: string[]; // Ensure this matches your schema definition
  birthdates: {
    date: Date | null;
    city?: string;
    country?: string;
  }[];
  regulations: {
    numberTitle: string;
    publicationDate: Date | null;
    url: string;
  }[];
  lastUpdated: Date;
}

// Schema for birthdates
const BirthdateSchema = new Schema({
  date: { type: Date, default: null },
  city: { type: String, default: "Unknown" },
  country: { type: String, default: "Unknown" },
});

// Schema for regulations
const RegulationSchema = new Schema({
  numberTitle: { type: String, default: "Unknown" },
  publicationDate: { type: Date, default: null },
  url: { type: String, required: true },
});

// Main schema for EU sanctioned entities
const EuSanctionedEntitySchema = new Schema({
  id: { type: String, required: true, unique: true },
  euReferenceNumber: { type: String, default: "Unknown" },
  name: { type: String, required: true },
  aliases: { type: [String], default: [] },
  citizenship: { type: [String], default: [] },
  birthdates: { type: [BirthdateSchema], default: [] },
  regulations: { type: [RegulationSchema], default: [] },
  lastUpdated: { type: Date, default: Date.now },
});

// Model export
export const EuSanctionedEntityModel = mongoose.model<IEUSanctionedEntity>(
  "EuSanctionedEntity",
  EuSanctionedEntitySchema
);
