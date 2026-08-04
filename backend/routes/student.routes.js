const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Meeting = require('../models/Meeting');
const MentorNote = require('../models/MentorNote');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/students/:id/profile
// @desc    Get detailed student academic & mentoring profile
router.get('/:id/profile', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name email phone avatar department')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email phone avatar department' }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendanceRecords = await Attendance.find({ studentId: student._id });
    const marksRecords = await Marks.find({ studentId: student._id }).sort({ semester: -1, subjectCode: 1 });
    const assignmentRecords = await Assignment.find({ studentId: student._id }).sort({ dueDate: 1 });
    
    const meetings = await Meeting.find({ studentId: student._id })
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name' } })
      .sort({ date: -1, time: -1 });

    const notes = await MentorNote.find({ studentId: student._id })
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    // Format Performance Graph Data with CIE & SEE Exam Scores
    const cieChartData = marksRecords.map(m => ({
      semester: m.semester,
      subject: m.subjectCode,
      subjectName: m.subjectName,
      cie1: m.cie1,
      cie2: m.cie2,
      cie3: m.cie3,
      averageCie: m.averageMarks,
      seeScore: m.seeMarks,
      seeGrade: m.seeGrade,
      finalPercentage: m.finalPercentage
    }));

    const attendanceChartData = attendanceRecords.map(a => ({
      semester: a.semester,
      subject: a.subjectCode,
      subjectName: a.subjectName,
      attended: a.attendedClasses,
      total: a.totalClasses,
      percentage: a.percentage
    }));

    // Unique semesters list
    const availableSemesters = [...new Set(marksRecords.map(m => m.semester))].sort((a, b) => b - a);

    const actionItems = [];
    notes.forEach(note => {
      note.actionItems.forEach(ai => {
        actionItems.push({
          _id: ai._id,
          noteId: note._id,
          item: ai.item,
          status: ai.status,
          dueDate: ai.dueDate,
          createdAt: note.createdAt
        });
      });
    });

    res.json({
      student,
      attendance: attendanceRecords,
      marks: marksRecords,
      assignments: assignmentRecords,
      meetings,
      notes,
      actionItems,
      availableSemesters: availableSemesters.length > 0 ? availableSemesters : [student.semester],
      charts: {
        cie: cieChartData,
        attendance: attendanceChartData
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/student/my-dashboard
// @desc    Get dashboard metrics for logged-in Student with Sem-wise CIE & SEE Exam Scores
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone avatar')
      .populate({
        path: 'mentorId',
        populate: { path: 'userId', select: 'name email phone avatar' }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attendance = await Attendance.find({ studentId: student._id });
    const marks = await Marks.find({ studentId: student._id }).sort({ semester: -1, subjectCode: 1 });
    const assignments = await Assignment.find({ studentId: student._id });

    const availableSemesters = [...new Set(marks.map(m => m.semester))].sort((a, b) => b - a);

    const upcomingMeetings = await Meeting.find({
      studentId: student._id,
      status: 'Upcoming'
    }).populate({ path: 'mentorId', populate: { path: 'userId', select: 'name email' } });

    const pastMeetings = await Meeting.find({
      studentId: student._id,
      status: { $in: ['Completed', 'Missed'] }
    }).populate({ path: 'mentorId', populate: { path: 'userId', select: 'name' } }).sort({ date: -1 });

    const notes = await MentorNote.find({ studentId: student._id })
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json({
      student,
      attendance,
      marks,
      assignments,
      availableSemesters: availableSemesters.length > 0 ? availableSemesters : [student.semester],
      upcomingMeetings,
      pastMeetings,
      notes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
