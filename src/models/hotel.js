import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const HotelSchema = new Schema({
  id: String,
  name: String,
  neighborhood: String,
  city: String,
  picture: String,
  currency: String,
  price: Number
});
