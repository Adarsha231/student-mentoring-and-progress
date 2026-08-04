const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure .env is loaded if present locally
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  dotenv.config({ override: true });
}

const connectDB = async () => {
  try {
    const envUri = process.env.MONGODB_URI;

    if (envUri && envUri.trim() !== '') {
      const maskedUri = envUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log(`[MongoDB] Connecting to database: ${maskedUri}`);
      await mongoose.connect(envUri);
      console.log(`[MongoDB] ✅ SUCCESS! Connected to MongoDB Atlas cluster!`);
      return;
    }

    console.warn(`[MongoDB Notice] No MONGODB_URI found. Starting server for API health check.`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
  }
};

module.exports = connectDB;
