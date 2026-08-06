const express = require('express');
const router = express.Router();
const Mentor = require('../models/Mentor');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const MentorNote = require('../models/MentorNote');
const Meeting = require('../models/Meeting');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateStudentAiDiagnostic } = require('../services/aiCopilotService');

router.use(protect, authorize('MENTOR', 'ADMIN'));

// Helper to get mentor document for current user
const getMentorDoc = async (req) => {
  if (req.user.role === 'MENTOR') {
    return await Mentor.findOne({ userId: req.user._id });
  }
  return await Mentor.findOne();
};

const { syncStudentAcademicMetrics } = require('../utils/riskEngine');

// @route   GET /api/mentor/dashboard
// @desc    Get Mentor Dashboard summary & risk metrics
router.get('/dashboard', async (req, res) => {
  try {
    const mentor = await getMentorDoc(req);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    // Dynamically sync metrics for all assigned mentees
    const mentees = await Student.find({ mentorId: mentor._id });
    await Promise.all(mentees.map(s => syncStudentAcademicMetrics(s)));

    const totalStudents = await Student.countDocuments({ mentorId: mentor._id });
    const highRisk = await Student.countDocuments({ mentorId: mentor._id, riskLevel: 'HIGH' });
    const mediumRisk = await Student.countDocuments({ mentorId: mentor._id, riskLevel: 'MEDIUM' });
    const lowRisk = await Student.countDocuments({ mentorId: mentor._id, riskLevel: 'LOW' });

    const upcomingMeetings = await Meeting.countDocuments({
      mentorId: mentor._id,
      status: 'Upcoming'
    });

    const pendingFollowups = await MentorNote.countDocuments({
      mentorId: mentor._id,
      followUpDate: { $gte: new Date() }
    });

    const activeAlerts = await Alert.find({ mentorId: mentor._id, resolved: false })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalStudents,
      highRisk,
      mediumRisk,
      lowRisk,
      upcomingMeetings,
      pendingFollowups,
      alerts: activeAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/mentor/students
// @desc    Get mentor's assigned students with search, filters & risk badges
router.get('/students', async (req, res) => {
  try {
    const mentor = await getMentorDoc(req);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }

    // Sync all mentees before filtering
    const mentees = await Student.find({ mentorId: mentor._id });
    await Promise.all(mentees.map(s => syncStudentAcademicMetrics(s)));

    const { search, department, semester, riskLevel, minAttendance } = req.query;
    let query = { mentorId: mentor._id };

    if (department && department !== 'ALL') {
      query.department = department;
    }
    if (semester && semester !== 'ALL') {
      query.semester = Number(semester);
    }
    if (riskLevel && riskLevel !== 'ALL') {
      query.riskLevel = riskLevel.toUpperCase();
    }
    if (minAttendance) {
      query.overallAttendance = { $gte: Number(minAttendance) };
    }

    let students = await Student.find(query)
      .populate('userId', 'name email phone avatar')
      .sort({ usn: 1 });

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      students = students.filter(s => 
        (s.userId && s.userId.name.match(searchRegex)) || 
        s.usn.match(searchRegex) || 
        s.department.match(searchRegex)
      );
    }

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/mentor/ai-diagnostic/:studentId
// @desc    Generate AI Mentor Copilot diagnostic report & intervention plan
router.post('/ai-diagnostic/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate('userId', 'name email department phone');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ studentId: student._id });
    const marks = await Marks.find({ studentId: student._id });
    const notes = await MentorNote.find({ studentId: student._id });

    const aiReport = await generateStudentAiDiagnostic({
      student,
      attendance,
      marks,
      notes
    });

    res.json({
      studentId: student._id,
      generatedAt: new Date().toISOString(),
      report: aiReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/mentor/alerts/:alertId/resolve
// @desc    Resolve automated alert
router.put('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.resolved = true;
    await alert.save();

    res.json({ message: 'Alert marked as resolved', alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
