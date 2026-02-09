const mongoose = require('mongoose');

const connectDB = async (options = {}) => {
  const defaultOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    ...options,
  };
  const conn = await mongoose.connect(process.env.MONGODB_URI, defaultOptions);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
