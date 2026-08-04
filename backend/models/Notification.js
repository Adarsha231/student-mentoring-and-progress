const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['MEETING_SCHEDULED', 'MEETING_REMINDER', 'FEEDBACK_ADDED', 'FOLLOWUP_REMINDER', 'HIGH_RISK_ALERT', 'MEETING_REQUESTED'],
    required: true 
  },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
