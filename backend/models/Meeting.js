const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  durationMinutes: { type: Number, default: 30 },
  mode: { type: String, enum: ['Offline', 'Google Meet', 'Microsoft Teams'], default: 'Offline' },
  meetingLink: { type: String, default: '' },
  agenda: { type: String, default: '' },
  status: { type: String, enum: ['Upcoming', 'Completed', 'Pending', 'Missed', 'Cancelled'], default: 'Upcoming' },
  requestedBy: { type: String, enum: ['MENTOR', 'STUDENT'], default: 'MENTOR' }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
