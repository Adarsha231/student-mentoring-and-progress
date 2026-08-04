const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Meeting = require('../models/Meeting');
const MentorNote = require('../models/MentorNote');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const { calculateRiskLevel } = require('../utils/riskEngine');

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering'
];

const DEPT_CODES = {
  'Computer Science & Engineering': 'CS',
  'Information Science & Engineering': 'IS',
  'Electronics & Communication Engineering': 'EC',
  'Mechanical Engineering': 'ME'
};

const MENTOR_NAMES = [
  'Dr. Rajesh Sharma',
  'Prof. Ananya Rao',
  'Dr. Vikramaditya Hegde',
  'Prof. Sunita Deshmukh',
  'Dr. Ramesh Kumar',
  'Prof. Kavita Reddy',
  'Dr. Aris Thorne',
  'Prof. Meera Joshi',
  'Dr. Arvind Patel',
  'Prof. Deepak Verena'
];

const FIRST_NAMES = ['Aarav', 'Ananya', 'Aditya', 'Bhavya', 'Chetan', 'Diya', 'Eshwar', 'Farhan', 'Gautam', 'Harini', 'Ishan', 'Jiya', 'Karthik', 'Lakshmi', 'Manish', 'Neha', 'Omkar', 'Pooja', 'Rahul', 'Sneha', 'Tanvi', 'Utkarsh', 'Varun', 'Yash', 'Zoya'];
const LAST_NAMES = ['Kulkarni', 'Nair', 'Bhat', 'Shetty', 'Pillai', 'Rao', 'Gowda', 'Mehta', 'Gupta', 'Singh', 'Chaudhary', 'Desai', 'Patil', 'Iyer', 'Joshi', 'Menon'];

const SEMESTER_SUBJECTS = {
  1: [
    { code: 'MA101', name: 'Engineering Mathematics I', credits: 4 },
    { code: 'PH102', name: 'Engineering Physics', credits: 4 },
    { code: 'EE103', name: 'Basic Electrical Engineering', credits: 3 },
    { code: 'EG104', name: 'Engineering Graphics & Design', credits: 3 }
  ],
  2: [
    { code: 'MA201', name: 'Engineering Mathematics II', credits: 4 },
    { code: 'CH202', name: 'Engineering Chemistry', credits: 4 },
    { code: 'EC203', name: 'Basic Electronics & Communication', credits: 3 },
    { code: 'CS204', name: 'C Programming & Problem Solving', credits: 4 }
  ],
  3: [
    { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4 },
    { code: 'CS302', name: 'Digital Logic & Design', credits: 3 },
    { code: 'CS303', name: 'Discrete Mathematics', credits: 4 },
    { code: 'CS304', name: 'Object Oriented Programming with C++', credits: 3 }
  ],
  4: [
    { code: 'CS401', name: 'Design & Analysis of Algorithms', credits: 4 },
    { code: 'CS402', name: 'Operating Systems Fundamentals', credits: 4 },
    { code: 'CS403', name: 'Computer Organization & Architecture', credits: 3 },
    { code: 'CS404', name: 'Microprocessors & Microcontrollers', credits: 3 }
  ],
  5: [
    { code: 'CS501', name: 'Database Management Systems', credits: 4 },
    { code: 'CS502', name: 'Computer Networks', credits: 4 },
    { code: 'CS503', name: 'Theory of Computation', credits: 3 },
    { code: 'CS504', name: 'Full-Stack Web Technology', credits: 4 }
  ],
  6: [
    { code: 'CS601', name: 'Software Engineering & Testing', credits: 4 },
    { code: 'CS602', name: 'Machine Learning Fundamentals', credits: 4 },
    { code: 'CS603', name: 'Compiler Design', credits: 3 },
    { code: 'CS604', name: 'Information & Cyber Security', credits: 3 }
  ]
};

const getGrade = (percentage) => {
  if (percentage >= 90) return 'S (Outstanding)';
  if (percentage >= 80) return 'A+ (Excellent)';
  if (percentage >= 70) return 'A (Very Good)';
  if (percentage >= 60) return 'B (Good)';
  if (percentage >= 50) return 'C (Above Average)';
  if (percentage >= 40) return 'P (Pass)';
  return 'F (Fail / Re-appear)';
};

async function seedDatabase() {
  console.log('[Seed] Starting clean bulk database wipe & seed process...');

  try {
    await mongoose.connection.dropDatabase();
    console.log('[Seed] Dropped existing Atlas database successfully.');
  } catch (err) {
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Mentor.deleteMany({}),
      Attendance.deleteMany({}),
      Marks.deleteMany({}),
      Assignment.deleteMany({}),
      Meeting.deleteMany({}),
      MentorNote.deleteMany({}),
      Alert.deleteMany({}),
      Notification.deleteMany({})
    ]);
  }

  const salt = await bcrypt.genSalt(10);
  const adminHashedPass = await bcrypt.hash('AdminPassword123!', salt);
  const mentorHashedPass = await bcrypt.hash('MentorPassword123!', salt);

  // 1. Create Admin HOD
  const adminUserId = new mongoose.Types.ObjectId();
  await User.insertMany([{
    _id: adminUserId,
    name: 'College Admin (HOD)',
    email: 'admin@mentoring.edu',
    password: adminHashedPass,
    role: 'ADMIN',
    department: 'Computer Science & Engineering',
    phone: '+91 9876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }]);

  // 2. Prepare & Create 10 Mentors in batch
  const mentorUsersToCreate = [];
  const mentorDocsToCreate = [];

  for (let i = 0; i < 10; i++) {
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const uId = new mongoose.Types.ObjectId();
    const mId = new mongoose.Types.ObjectId();
    const deptCode = DEPT_CODES[dept] || 'CS';
    const mentorEmail = `mentor${i + 1}@mentoring.edu`;
    const mentorHashedPass = await bcrypt.hash(mentorEmail, salt);

    mentorUsersToCreate.push({
      _id: uId,
      name: MENTOR_NAMES[i],
      email: mentorEmail,
      password: mentorHashedPass,
      role: 'MENTOR',
      department: dept,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000008)}`
    });

    mentorDocsToCreate.push({
      _id: mId,
      userId: uId,
      employeeId: `EMP2026${(i + 1).toString().padStart(3, '0')}`,
      department: dept,
      designation: i % 3 === 0 ? 'Professor' : i % 2 === 0 ? 'Associate Professor' : 'Assistant Professor',
      maxMentees: 15,
      cabinNumber: `${deptCode}-${301 + i}`
    });
  }

  await User.insertMany(mentorUsersToCreate);
  await Mentor.insertMany(mentorDocsToCreate);
  console.log('[Seed] 10 Faculty Mentors created in high-speed batch.');

  // 3. Prepare & Create 100 Students in batch
  const studentUsersToCreate = [];
  const studentDocsToCreate = [];
  const attendanceToCreate = [];
  const marksToCreate = [];
  const assignmentsToCreate = [];
  const alertsToCreate = [];

  for (let i = 0; i < 100; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const dept = DEPARTMENTS[i % DEPARTMENTS.length];
    const deptCode = DEPT_CODES[dept] || 'CS';
    const sem = 5; // Current Semester is 5

    const usn = `1MS22${deptCode}${(i + 1).toString().padStart(3, '0')}`;

    const uId = new mongoose.Types.ObjectId();
    const studentId = new mongoose.Types.ObjectId();

    const deptMentors = mentorDocsToCreate.filter(m => m.department === dept);
    const assignedMentor = deptMentors.length > 0 ? deptMentors[i % deptMentors.length] : mentorDocsToCreate[i % mentorDocsToCreate.length];

    const studentUsnHashedPass = await bcrypt.hash(usn, salt);

    studentUsersToCreate.push({
      _id: uId,
      name: `${fn} ${ln}`,
      email: `student${i + 1}@mentoring.edu`,
      password: studentUsnHashedPass,
      role: 'STUDENT',
      department: dept,
      phone: `+91 91${Math.floor(10000000 + Math.random() * 90000008)}`
    });

    let attPct, cieAvg, assignCompPct;

    if (i % 7 === 0) {
      attPct = Math.floor(45 + Math.random() * 14);
      cieAvg = Math.floor(30 + Math.random() * 12);
      assignCompPct = Math.floor(30 + Math.random() * 18);
    } else if (i % 4 === 0) {
      attPct = Math.floor(62 + Math.random() * 12);
      cieAvg = Math.floor(45 + Math.random() * 22);
      assignCompPct = Math.floor(52 + Math.random() * 25);
    } else {
      attPct = Math.floor(78 + Math.random() * 18);
      cieAvg = Math.floor(72 + Math.random() * 24);
      assignCompPct = Math.floor(80 + Math.random() * 20);
    }

    const calculatedRisk = calculateRiskLevel(attPct, cieAvg, assignCompPct);

    studentDocsToCreate.push({
      _id: studentId,
      userId: uId,
      usn,
      department: dept,
      semester: sem,
      section: i % 2 === 0 ? 'A' : 'B',
      mentorId: assignedMentor._id,
      riskLevel: calculatedRisk,
      overallAttendance: attPct,
      avgCieMarks: cieAvg,
      assignmentCompletionRate: assignCompPct,
      lastMeetingDate: new Date(Date.now() - (i % 15) * 86400000)
    });

    // Populate marks starting all the way from Semester 1 up to current semester (Semesters 1, 2, 3, 4, 5)
    for (let s = 1; s <= sem; s++) {
      const subjects = SEMESTER_SUBJECTS[s] || SEMESTER_SUBJECTS[5];
      const isCurrentSemester = (s === sem);

      subjects.forEach(sub => {
        const totalCls = 40;
        const attCls = Math.round((attPct / 100) * totalCls + (Math.random() * 4 - 2));
        const validAttCls = Math.min(totalCls, Math.max(10, attCls));

        attendanceToCreate.push({
          studentId,
          semester: s,
          subjectCode: sub.code,
          subjectName: sub.name,
          totalClasses: totalCls,
          attendedClasses: validAttCls,
          percentage: Math.round((validAttCls / totalCls) * 100)
        });

        // CIE Scores (Out of 50)
        const c1 = Math.min(50, Math.max(12, Math.round((cieAvg / 100) * 50 + (Math.random() * 8 - 4))));
        const c2 = Math.min(50, Math.max(12, Math.round((cieAvg / 100) * 50 + (Math.random() * 8 - 4))));
        const c3 = isCurrentSemester ? 0 : Math.min(50, Math.max(12, Math.round((cieAvg / 100) * 50 + (Math.random() * 8 - 4))));
        const avgCie = isCurrentSemester ? Math.round((c1 + c2) / 2) : Math.round((c1 + c2 + c3) / 3);

        // SEE Exam Score: Null for current ongoing semester; actual score for previous completed semesters (Sem 1, 2, 3, 4)
        let seeScore = null;
        let gradeStr = 'In Progress';
        let combinedPercentage = Math.round((avgCie / 50) * 100);

        if (!isCurrentSemester) {
          seeScore = Math.min(100, Math.max(35, Math.round((cieAvg / 50) * 85 + (Math.random() * 12 - 6))));
          combinedPercentage = Math.round(((avgCie / 50) * 50) + ((seeScore / 100) * 50));
          gradeStr = getGrade(combinedPercentage);
        }

        marksToCreate.push({
          studentId,
          semester: s,
          subjectCode: sub.code,
          subjectName: sub.name,
          credits: sub.credits,
          cie1: c1,
          cie2: c2,
          cie3: c3,
          averageMarks: avgCie,
          averagePercentage: Math.round((avgCie / 50) * 100),
          seeMarks: seeScore,
          seeGrade: gradeStr,
          finalPercentage: combinedPercentage
        });

        assignmentsToCreate.push({
          studentId,
          subjectCode: sub.code,
          subjectName: sub.name,
          title: `Assignment 1: ${sub.name} Fundamentals`,
          dueDate: new Date(Date.now() - 5 * 86400000),
          status: assignCompPct > 50 ? 'Submitted' : 'Pending',
          score: assignCompPct > 50 ? 45 : 0,
          maxScore: 50
        });
      });
    }

    if (calculatedRisk === 'HIGH') {
      alertsToCreate.push({
        studentId,
        mentorId: assignedMentor._id,
        type: 'HIGH_RISK_ESCALATION',
        title: 'High Risk Escalation',
        message: `Student ${usn} (${fn} ${ln}) has breached risk threshold with ${attPct}% attendance & ${cieAvg} avg CIE.`,
        severity: 'High',
        resolved: false
      });
    }
  }

  await User.insertMany(studentUsersToCreate);
  await Promise.all([
    Student.insertMany(studentDocsToCreate),
    Attendance.insertMany(attendanceToCreate),
    Marks.insertMany(marksToCreate),
    Assignment.insertMany(assignmentsToCreate),
    Alert.insertMany(alertsToCreate)
  ]);

  console.log('[Seed] 100 Students created with full academic history starting from Semester 1 to current semester!');

  // 4. Batch insert sample meetings & notes
  const meetingsToCreate = [];
  const notesToCreate = [];

  for (let i = 0; i < 15; i++) {
    const sampleStudent = studentDocsToCreate[i * 6];
    const sampleMentor = mentorDocsToCreate[i % mentorDocsToCreate.length];
    const meetingDate = new Date(Date.now() + (i % 2 === 0 ? 3 : -5) * 86400000).toISOString().split('T')[0];
    const meetingId = new mongoose.Types.ObjectId();

    meetingsToCreate.push({
      _id: meetingId,
      mentorId: sampleMentor._id,
      studentId: sampleStudent._id,
      title: i % 2 === 0 ? 'Academic Progress & CIE Review' : 'Mid-Semester Mentoring Review',
      date: meetingDate,
      time: '14:30',
      durationMinutes: 30,
      mode: i % 3 === 0 ? 'Google Meet' : i % 4 === 0 ? 'Microsoft Teams' : 'Offline',
      meetingLink: i % 3 === 0 ? 'https://meet.google.com/xyz-abcd-efg' : '',
      agenda: 'Review CIE 1 marks, discuss attendance improvement plan and time management.',
      status: i % 2 === 0 ? 'Upcoming' : 'Completed',
      requestedBy: 'MENTOR'
    });

    if (i % 2 !== 0) {
      notesToCreate.push({
        meetingId,
        mentorId: sampleMentor._id,
        studentId: sampleStudent._id,
        discussion: `Discussed low scores in CIE 1 and strategies to catch up on missed laboratory sessions.`,
        problemsIdentified: `Struggling with subject concepts and lab assignments.`,
        recommendations: `Advised attending remedial classes and forming a study group.`,
        actionItems: [
          { item: 'Submit pending Lab Assignment 2 by Friday', status: 'In Progress', dueDate: new Date(Date.now() + 4 * 86400000) }
        ],
        followUpDate: new Date(Date.now() + 10 * 86400000),
        meetingStatus: 'Completed'
      });
    }
  }

  await Promise.all([
    Meeting.insertMany(meetingsToCreate),
    MentorNote.insertMany(notesToCreate)
  ]);

  console.log('=======================================================');
  console.log('⚡ SEED COMPLETE IN MONGODB ATLAS!');
  console.log('Full Academic Transcript: Semesters 1, 2, 3, 4, and 5 included!');
  console.log('Sample Accounts for Login:');
  console.log('  ADMIN  : admin@mentoring.edu / AdminPassword123!');
  console.log('  MENTOR : mentor1@mentoring.edu / mentor1@mentoring.edu (Email is both Username & Password)');
  console.log('  STUDENT: 1MS22CS001 / 1MS22CS001');
  console.log('=======================================================');
}

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}

module.exports = seedDatabase;
