require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const partRoutes = require('./routes/parts');
const quizRoutes = require('./routes/quiz');
const recapRoutes = require('./routes/recap');
const exerciseRoutes = require('./routes/exercises');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/recap', recapRoutes);
app.use('/api/exercises', exerciseRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 EduSmart Server running on http://localhost:${PORT}`);
});

module.exports = app;
