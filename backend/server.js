import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

// Import routes
import topicRoutes from './routes/topics.js';
import contentRoutes from './routes/content.js';
import assessmentRoutes from './routes/assessments.js';
import chatRoutes from './routes/chat.js';
import profileRoutes from './routes/profile.js';
import analyticsRoutes from './routes/analytics.js';
import authRoutes from './routes/auth.js';
import feedbackRoutes from './routes/feedback.js';
import flashcardRoutes from './routes/flashcards.js';

// Import socket handlers
import chatSocketHandler from './sockets/chatSocket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS ? process.env.CORS_ALLOWED_ORIGINS.split(',') : [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'https://edu-gen-kappa.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, origin); // Dynamically allow other origins to prevent CORS errors during deployment
    }
  },
  credentials: true,
};

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/chapters', contentRoutes);
app.use('/api/quizzes', contentRoutes);
app.use('/api/exams', contentRoutes);
app.use('/api/quiz', assessmentRoutes);
app.use('/api/exam', assessmentRoutes);
app.use('/api/results', assessmentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/notes', profileRoutes); // Notes under profile routes

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Chat socket handler
  chatSocketHandler(socket, io);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
