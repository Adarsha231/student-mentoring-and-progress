const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Student = require('./models/Student');

async function testStudentLogin() {
  await connectDB();

  console.log('\n--- TESTING LOGIN LOGIC ---');

  const usnInput = '1MS22CS001';
  console.log('1. Searching for student with USN:', usnInput);

  const student = await Student.findOne({ usn: new RegExp(`^${usnInput}$`, 'i') });
  console.log('Found Student Doc:', student ? { usn: student.usn, userId: student.userId } : 'NOT FOUND');

  if (student) {
    const user = await User.findById(student.userId);
    console.log('Found User Doc:', user ? { email: user.email, name: user.name, role: user.role } : 'NOT FOUND');

    if (user) {
      const match = await user.matchPassword(usnInput);
      console.log('Password Match Result for password "' + usnInput + '":', match);
    }
  }

  process.exit(0);
}

testStudentLogin();
