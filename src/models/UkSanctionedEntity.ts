import mongoose, { Schema, Document } from "mongoose";
import { IUKSanctionedEntity } from "../interfaces/ISanctionedIndividual";

export interface IUKSanctionedEntityDocument extends IUKSanctionedEntity {}

const AddressSchema = new Schema({
  addressLine1: { type: String },
  addressLine2: { type: String },
  addressLine3: { type: String },
  addressLine4: { type: String },
  addressLine5: { type: String },
  addressLine6: { type: String },
  country: { type: String },
});

const NameSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
});

const UKSanctionedEntitySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    entityId: { type: String },
    uniqueID: { type: String},
    ofsiGroupID: { type: String },
    unReferenceNumber: { type: String },
    names: [NameSchema],
    nonLatinNames: [String],
    regimeName: { type: String },
    individualEntityShip: { type: String },
    designationSource: { type: String },
    sanctionsImposed: [String],
    addresses: [AddressSchema],
    phoneNumbers: [String],
    emailAddresses: [String],
    otherInformation: { type: String },
    dateDesignated: { type: Date },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

export const UKSanctionedEntityModel = mongoose.model<IUKSanctionedEntityDocument>(
  "UKSanctionedEntity",
  UKSanctionedEntitySchema
);
