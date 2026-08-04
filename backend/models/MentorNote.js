const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending' },
  dueDate: { type: Date, default: null }
});

const mentorNoteSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  discussion: { type: String, required: true },
  problemsIdentified: { type: String, default: '' },
  recommendations: { type: String, default: '' },
  actionItems: [actionItemSchema],
  followUpDate: { type: Date, default: null },
  meetingStatus: { type: String, enum: ['Completed', 'Pending', 'Missed'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('MentorNote', mentorNoteSchema);
