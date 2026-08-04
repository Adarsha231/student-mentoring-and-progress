const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  title: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Submitted', 'Pending', 'Late', 'Graded'], default: 'Pending' },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
