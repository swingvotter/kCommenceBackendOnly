const mongoose = require("mongoose");

const db = async () => {
  if (!process.env.DB_URL) {
    throw new Error("DB_URL environment variable is not set");
  }

  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    throw error; // Propagate the error
  }
};

module.exports = db;
