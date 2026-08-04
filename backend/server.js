const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/mentor', require('./routes/mentor.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));
app.use('/api/notes', require('./routes/note.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Student Mentoring Platform API', time: new Date() });
});

// Seed API trigger for easy remote seed execution if needed
app.post('/api/seed', async (req, res) => {
  try {
    const seedDatabase = require('./seed/seedData');
    await seedDatabase();
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const path = require('path');

// Serve static frontend assets in production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to DB
connectDB().then(async () => {
  // Auto seed if empty DB
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('[Seed] Database is empty. Running initial seed...');
    const seedDatabase = require('./seed/seedData');
    await seedDatabase();
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Student Mentoring API Server running on port ${PORT}`);
    console.log(`=======================================================`);
  });
});
