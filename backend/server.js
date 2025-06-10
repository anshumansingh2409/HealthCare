import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

// ✅ CORS Config
app.use(cors({
  origin: ['http://127.0.0.1:5501'], // allow frontend origin
  credentials: true, // only needed if you're using cookies
}));

// Body parser
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
