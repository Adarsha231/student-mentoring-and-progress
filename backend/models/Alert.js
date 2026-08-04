const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
  type: { 
    type: String, 
    enum: ['ATTENDANCE_DROP', 'MARKS_DROP', 'ASSIGNMENT_DROP', 'HIGH_RISK_ESCALATION'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
