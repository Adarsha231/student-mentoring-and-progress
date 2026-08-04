const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, default: 5, min: 1, max: 8 },
  subjectCode: { type: String, required: true },
  subjectName: { type: String, required: true },
  credits: { type: Number, default: 4 },
  cie1: { type: Number, default: 0, min: 0, max: 50 },
  cie2: { type: Number, default: 0, min: 0, max: 50 },
  cie3: { type: Number, default: 0, min: 0, max: 50 },
  averageMarks: { type: Number, default: 0 },
  averagePercentage: { type: Number, default: 0 },
  seeMarks: { type: Number, default: 75, min: 0, max: 100 }, // Semester End Examination (SEE) Score
  seeGrade: { type: String, default: 'A' },
  finalPercentage: { type: Number, default: 80 }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
