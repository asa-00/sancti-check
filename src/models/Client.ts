import mongoose, { Document, Schema } from 'mongoose';
import { IClient } from '../interfaces/IClient';

// Extend the IClient interface with mongoose.Document
export interface IClientDocument extends IClient {}

const clientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the updatedAt field before saving
clientSchema.pre<IClientDocument>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Client = mongoose.model<IClientDocument>('Client', clientSchema);

export default Client;
