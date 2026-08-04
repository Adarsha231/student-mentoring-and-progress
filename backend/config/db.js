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

let mongoServer = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.PORT;
  const envUri = process.env.MONGODB_URI;

  if (envUri && envUri.trim() !== '') {
    const maskedUri = envUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log(`[MongoDB] Attempting connection to MongoDB Atlas: ${maskedUri}`);
    try {
      await mongoose.connect(envUri, { serverSelectionTimeoutMS: 8000 });
      console.log(`[MongoDB] ✅ SUCCESS! Connected to MongoDB Atlas cluster!`);
      return;
    } catch (atlasErr) {
      console.error(`[MongoDB Atlas Connection Warning] ${atlasErr.message}`);
    }
  } else {
    console.log(`[MongoDB] No custom MONGODB_URI found in environment variables.`);
  }

  // Attempt local MongoDB if running locally
  if (!isProduction) {
    const localUri = 'mongodb://127.0.0.1:27017/student_mentoring';
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`[MongoDB] Connected to local MongoDB at ${localUri}`);
      return;
    } catch (err) {
      console.log('[MongoDB] Local MongoDB service not detected.');
    }

    // Try in-memory server ONLY in local development
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Connected to local in-memory database at ${memoryUri}`);
      return;
    } catch (memErr) {
      console.warn(`[MongoDB Memory Server Fallback Warning] ${memErr.message}`);
    }
  }

  // Safe production fallback (Prevents Render exit code 1 crash)
  console.warn(`[MongoDB Notice] Starting API server. Ensure MONGODB_URI is set in Render Environment tab.`);
};

module.exports = connectDB;
