import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import characterRoutes from './routes/character.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/character', characterRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    environment: process.env.NODE_ENV || 'development', 
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection with in-memory server for development
const connectDB = async (retries = 5) => {
  try {
    let uri = process.env.MONGODB_URI;
    
    // Use in-memory MongoDB server for development if no URI is provided
    if (!uri && process.env.NODE_ENV === 'development') {
      console.log('Starting MongoDB Memory Server for development...');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log(`MongoDB Memory Server started at ${uri}`);
    } else if (!uri) {
      uri = 'mongodb://localhost:27017/bloodfest';
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    if (retries > 0) {
      console.log(`MongoDB connection failed. Retrying... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('MongoDB connection failed after all retries:', error);
      process.exit(1);
    }
  }
};

connectDB();

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  mongoose.connection.close().then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});