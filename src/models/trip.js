import mongoose from 'mongoose';

import { HotelSchema } from './hotel';

const Schema = mongoose.Schema;

export const TripSchema = new Schema({
  date: Date,
  days: Number,
  place: String,
  flightId: String,
  hotel: HotelSchema
});
