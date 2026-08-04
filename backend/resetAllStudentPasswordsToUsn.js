const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

async function resetAllStudentPasswordsToUsn() {
  await connectDB();

  console.log('\n=======================================================');
  console.log('🔄 SETTING ALL STUDENT PASSWORDS TO THEIR EXACT USN');
  console.log('=======================================================');

  const students = await Student.find().populate('userId');
  console.log(`Found ${students.length} students in MongoDB Atlas database.`);

  const salt = await bcrypt.genSalt(10);
  let updatedCount = 0;

  for (const student of students) {
    if (student.userId && student.usn) {
      const usnUpper = student.usn.trim().toUpperCase();
      const hashedPassword = await bcrypt.hash(usnUpper, salt);

      await User.findByIdAndUpdate(student.userId._id, {
        password: hashedPassword
      });

      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated ${updatedCount} student passwords in MongoDB Atlas!`);
  console.log('=======================================================\n');

  // Verify first 5 students
  console.log('--- VERIFYING LOGIN FOR SAMPLE USNS ---');
  const sampleStudents = students.slice(0, 5);
  for (const s of sampleStudents) {
    const user = await User.findById(s.userId._id);
    const match = await user.matchPassword(s.usn);
    console.log(`USN: [${s.usn.padEnd(12)}] -> Login Password Match (${s.usn}): ${match ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  console.log('=======================================================\n');

  process.exit(0);
}

resetAllStudentPasswordsToUsn();
