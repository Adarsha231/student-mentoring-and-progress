const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usn: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, default: 'A' },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', default: null },
  riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  overallAttendance: { type: Number, default: 0 },
  avgCieMarks: { type: Number, default: 0 },
  assignmentCompletionRate: { type: Number, default: 0 },
  lastMeetingDate: { type: Date, default: null },
  parentPhone: { type: String, default: '+91 9876543210' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
