import mongoose, { Schema, Document } from 'mongoose';

export interface IHighQualityResult extends Document {
  name: string;
  country: string;
  dateOfBirth: string;
  matchQuality: string;
  score: number;
  source: string;
  isReviewed: boolean;
  reviewedBy?: string;
  reviewComment?: string;
}

const HighQualityResultSchema: Schema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  matchQuality: { type: String, required: true },
  score: { type: Number, required: true },
  source: { type: String, required: true },
  isReviewed: { type: Boolean, default: false },
  reviewedBy: { type: String, default: null },
  reviewComment: { type: String, default: null },
});

export const HighQualityResultModel = mongoose.model<IHighQualityResult>('HighQualityResult', HighQualityResultSchema);