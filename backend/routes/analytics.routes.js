const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Meeting = require('../models/Meeting');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/analytics/overview
// @desc    Get aggregated charts & analytics data for visual charts
router.get('/overview', protect, async (req, res) => {
  try {
    // 1. Risk Distribution
    const highRisk = await Student.countDocuments({ riskLevel: 'HIGH' });
    const mediumRisk = await Student.countDocuments({ riskLevel: 'MEDIUM' });
    const lowRisk = await Student.countDocuments({ riskLevel: 'LOW' });

    const riskDistribution = [
      { name: 'Low Risk', value: lowRisk, color: '#10B981' },
      { name: 'Medium Risk', value: mediumRisk, color: '#F59E0B' },
      { name: 'High Risk', value: highRisk, color: '#EF4444' }
    ];

    // 2. CIE Marks Trend (Across CIE 1, 2, 3)
    const marksAgg = await Marks.aggregate([
      {
        $group: {
          _id: null,
          avgCie1: { $avg: '$cie1' },
          avgCie2: { $avg: '$cie2' },
          avgCie3: { $avg: '$cie3' }
        }
      }
    ]);

    const marksTrend = [
      { test: 'CIE 1', scorePercentage: Math.round(((marksAgg[0]?.avgCie1 || 32) / 50) * 100) },
      { test: 'CIE 2', scorePercentage: Math.round(((marksAgg[0]?.avgCie2 || 35) / 50) * 100) },
      { test: 'CIE 3', scorePercentage: Math.round(((marksAgg[0]?.avgCie3 || 38) / 50) * 100) }
    ];

    // 3. Meeting Analytics
    const completedMeetings = await Meeting.countDocuments({ status: 'Completed' });
    const upcomingMeetings = await Meeting.countDocuments({ status: 'Upcoming' });
    const missedMeetings = await Meeting.countDocuments({ status: 'Missed' });

    const meetingStats = [
      { name: 'Completed', count: completedMeetings },
      { name: 'Upcoming', count: upcomingMeetings },
      { name: 'Missed', count: missedMeetings }
    ];

    res.json({
      riskDistribution,
      marksTrend,
      meetingStats,
      totals: {
        students: highRisk + mediumRisk + lowRisk,
        highRisk
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
