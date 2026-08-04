const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true, uppercase: true },
  department: { type: String, required: true },
  designation: { type: String, default: 'Assistant Professor' },
  maxMentees: { type: Number, default: 15 },
  officeHours: { type: String, default: 'Mon-Fri 2:00 PM - 4:00 PM' },
  cabinNumber: { type: String, default: 'CS-302' }
}, { timestamps: true });

module.exports = mongoose.model('Mentor', mentorSchema);
