import dotenv from 'dotenv';
dotenv.config();


import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://founder:founderos@cluster0.v7pvldo.mongodb.net");
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};
