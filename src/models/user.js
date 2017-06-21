import mongoose from 'mongoose';

import { HotelSchema } from './hotel';
import { TripSchema } from './trip';

const Schema = mongoose.Schema;

const HotelResultSchema = new Schema({
  hotelIndex: Number,
  hotels: [HotelSchema]
});

const UserSchema = new Schema({
  userId: { type: String, required: true },
  result: HotelResultSchema,
  tripId: String,
  trips: [TripSchema]
});

export const User = mongoose.model('user', UserSchema);
