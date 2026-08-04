const mongoose = require('mongoose');
const connectDB = require('./config/db');

async function checkAtlasCollections() {
  await connectDB();

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\n=======================================================');
  console.log('📊 LIVE MONGODB ATLAS DATABASE VERIFICATION');
  console.log('Database Name:', mongoose.connection.db.databaseName);
  console.log('=======================================================');

  for (const col of collections) {
    const count = await mongoose.connection.db.collection(col.name).countDocuments();
    console.log(`• Collection [${col.name.padEnd(16)}]: ${count} documents`);
  }

  console.log('=======================================================\n');
  process.exit(0);
}

checkAtlasCollections();
