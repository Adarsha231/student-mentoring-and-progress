const express = require('express');
const router = express.Router();
const MentorNote = require('../models/MentorNote');
const Meeting = require('../models/Meeting');
const Student = require('../models/Student');
const Mentor = require('../models/Mentor');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/notes
// @desc    Record new Mentor Note with action items & follow-up date
router.post('/', protect, async (req, res) => {
  try {
    const { meetingId, studentId, discussion, problemsIdentified, recommendations, actionItems, followUpDate, meetingStatus } = req.body;

    const mentor = await Mentor.findOne({ userId: req.user._id });
    const mentorId = mentor ? mentor._id : req.body.mentorId;

    if (!mentorId || !studentId || !discussion) {
      return res.status(400).json({ message: 'Mentor, Student, and Discussion text are required.' });
    }

    const note = await MentorNote.create({
      meetingId: meetingId || null,
      mentorId,
      studentId,
      discussion,
      problemsIdentified: problemsIdentified || '',
      recommendations: recommendations || '',
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      meetingStatus: meetingStatus || 'Completed'
    });

    // Update associated meeting status if provided
    if (meetingId) {
      await Meeting.findByIdAndUpdate(meetingId, { status: meetingStatus || 'Completed' });
    }

    // Update student's last meeting date
    await Student.findByIdAndUpdate(studentId, { lastMeetingDate: new Date() });

    // Send notification to student
    const student = await Student.findById(studentId).populate('userId');
    if (student && student.userId) {
      await Notification.create({
        userId: student.userId._id,
        title: '📝 New Mentor Feedback & Action Items',
        message: 'Your mentor added session notes and assigned action items.',
        type: 'FEEDBACK_ADDED',
        link: '/dashboard'
      });
    }

    const populatedNote = await MentorNote.findById(note._id)
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' }, select: 'usn' });

    res.status(201).json(populatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/notes/:noteId/action-items/:actionItemId
// @desc    Toggle action item status (Pending / In Progress / Done)
router.put('/:noteId/action-items/:actionItemId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const note = await MentorNote.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const item = note.actionItems.id(req.params.actionItemId);
    if (!item) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    item.status = status;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
