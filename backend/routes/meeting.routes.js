const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/meetings
// @desc    Get meetings for current logged in user (Mentor or Student)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'MENTOR') {
      const mentor = await Mentor.findOne({ userId: req.user._id });
      if (mentor) query.mentorId = mentor._id;
    } else if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) query.studentId = student._id;
    }

    const meetings = await Meeting.find(query)
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name email avatar' } })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email avatar' }, select: 'usn department semester' })
      .sort({ date: 1, time: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/meetings
// @desc    Schedule a new mentoring session (Mentor or Student request)
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, mentorId, title, date, time, durationMinutes, mode, meetingLink, agenda } = req.body;

    let targetStudentId = studentId;
    let targetMentorId = mentorId;

    if (req.user.role === 'MENTOR') {
      const mentor = await Mentor.findOne({ userId: req.user._id });
      if (mentor) targetMentorId = mentor._id;
    } else if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ userId: req.user._id });
      if (student) {
        targetStudentId = student._id;
        targetMentorId = student.mentorId;
      }
    }

    if (!targetStudentId || !targetMentorId) {
      return res.status(400).json({ message: 'Both Student and Mentor must be assigned to schedule a meeting.' });
    }

    const meeting = await Meeting.create({
      mentorId: targetMentorId,
      studentId: targetStudentId,
      title: title || 'Mentoring Session',
      date,
      time,
      durationMinutes: Number(durationMinutes) || 30,
      mode: mode || 'Offline',
      meetingLink: meetingLink || '',
      agenda: agenda || '',
      status: 'Upcoming',
      requestedBy: req.user.role === 'STUDENT' ? 'STUDENT' : 'MENTOR'
    });

    const studentDoc = await Student.findById(targetStudentId).populate('userId');
    const mentorDoc = await Mentor.findById(targetMentorId).populate('userId');

    // Notify student if mentor scheduled, or notify mentor if student requested
    if (req.user.role === 'MENTOR' && studentDoc && studentDoc.userId) {
      await Notification.create({
        userId: studentDoc.userId._id,
        title: '📅 New Mentoring Session Scheduled',
        message: `Your mentor scheduled a session for ${date} at ${time} (${mode}).`,
        type: 'MEETING_SCHEDULED',
        link: '/dashboard'
      });
    } else if (req.user.role === 'STUDENT' && mentorDoc && mentorDoc.userId) {
      await Notification.create({
        userId: mentorDoc.userId._id,
        title: '📨 Mentoring Session Requested',
        message: `Student ${studentDoc.usn} requested a mentoring session on ${date} at ${time}.`,
        type: 'MEETING_REQUESTED',
        link: '/meetings'
      });
    }

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' }, select: 'usn department' });

    res.status(201).json(populatedMeeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/meetings/:id/status
// @desc    Update meeting status (Completed, Cancelled, Missed)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    meeting.status = status;
    await meeting.save();

    // Update last meeting date on student
    if (status === 'Completed') {
      await Student.findByIdAndUpdate(meeting.studentId, { lastMeetingDate: new Date() });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
