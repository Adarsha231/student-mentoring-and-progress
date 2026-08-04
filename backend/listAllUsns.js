const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Student = require('./models/Student');

async function listUsns() {
  await connectDB();

  const students = await Student.find().select('usn department semester').limit(20);
  console.log('\n--- SAMPLE USNS IN DATABASE ---');
  students.forEach(s => console.log(`USN: [${s.usn}] - Dept: ${s.department}`));
  console.log('Total students count:', await Student.countDocuments());

  process.exit(0);
}

listUsns();
