const mongoose = require('mongoose');

const connectDB = async (options = {}) => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, options);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
