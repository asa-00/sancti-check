import mongoose, { Document, Schema } from 'mongoose';

export interface IUnSanctionedEntity extends Document {
  dataId: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  unListType: string;
  referenceNumber: string;
  listedOn: Date;
  nameOriginalScript?: string;
  comments1?: string;
  titles?: string[];
  designations?: string[];
  nationality?: string[];
  listType?: string[];
  lastDayUpdated?: Date[];
  aliases?: { quality: string; aliasName: string }[];
  dateOfBirth?: { typeOfDate?: string; year?: string };
  placeOfBirth?: { city?: string; stateProvince?: string; country?: string };
}

const aliasSchema = new Schema({
  quality: { type: String, required: true },
  aliasName: { type: String, required: true },
});

const dateOfBirthSchema = new Schema({
  typeOfDate: { type: String },
  year: { type: String },
});

const placeOfBirthSchema = new Schema({
  city: { type: String },
  stateProvince: { type: String },
  country: { type: String },
});

const UnSanctionedEntitySchema = new Schema<IUnSanctionedEntity>({
  dataId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  secondName: { type: String },
  thirdName: { type: String },
  unListType: { type: String, required: true },
  referenceNumber: { type: String, required: true },
  listedOn: { type: Date, required: true },
  nameOriginalScript: { type: String },
  comments1: { type: String },
  titles: { type: [String], default: [] },
  designations: { type: [String], default: [] },
  nationality: { type: [String], default: [] },
  listType: { type: [String], default: [] },
  lastDayUpdated: { type: [Date], default: [] },
  aliases: { type: [aliasSchema], default: [] },
  dateOfBirth: { type: dateOfBirthSchema, default: {} },
  placeOfBirth: { type: placeOfBirthSchema, default: {} },
});

export const UnSanctionedEntityModel = mongoose.model<IUnSanctionedEntity>(
  'UnSanctionedEntity',
  UnSanctionedEntitySchema
);
