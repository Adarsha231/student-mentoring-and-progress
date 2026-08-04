const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Ensure .env is loaded regardless of working directory
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: true });
} else {
  dotenv.config({ override: true });
}

let mongoServer = null;

const connectDB = async () => {
  try {
    const envUri = process.env.MONGODB_URI;

    if (envUri && envUri.trim() !== '') {
      const maskedUri = envUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
      console.log(`[MongoDB] Attempting connection to custom URI: ${maskedUri}`);
      try {
        await mongoose.connect(envUri, { serverSelectionTimeoutMS: 8000 });
        console.log(`[MongoDB] ✅ SUCCESS! Connected to custom MongoDB Atlas cluster!`);
        return;
      } catch (atlasErr) {
        console.error(`[MongoDB Atlas Error] ❌ Could not connect to custom URI: ${atlasErr.message}`);
        console.log(`[MongoDB Fallback] Falling back to standalone MongoMemoryServer database...`);
      }
    } else {
      console.log(`[MongoDB] No custom MONGODB_URI found in .env`);
    }

    // Default local MongoDB attempt
    const localUri = 'mongodb://127.0.0.1:27017/student_mentoring';
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[MongoDB] Connected to local MongoDB at ${localUri}`);
      return;
    } catch (err) {
      console.log('[MongoDB] Local MongoDB service not detected.');
    }

    // In-memory fallback
    mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[MongoDB] Connected to in-memory database at ${memoryUri}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
