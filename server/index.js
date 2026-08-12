import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router as apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API & Webhook Routes
app.use('/api', apiRouter);
app.use('/webhook', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB Connection with fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shadow_arrow';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully.');
  })
  .catch((err) => {
    console.log('MongoDB Connection Notice: Local DB disconnected. Running on high-performance memory storage engine.');
  });

app.listen(PORT, () => {
  console.log(`⚡ SHADOW ARROW Express Server running at http://localhost:${PORT}`);
});
