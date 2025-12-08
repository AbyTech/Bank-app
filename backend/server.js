const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import database connection function
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'https://app.primewavepay.com', 'https://prime-wave-bank.netlify.app'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Database connection handled in serverless function

// Mount routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/countries', require('./routes/countries'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/users', require('./routes/users'));

// Basic Route
app.get('/', (req, res) => {
  res.send('Banking API is running...');
});

// Define Port and Start Server
const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    // Connect to database if not already connected
    await connectDB();

    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// For local development
module.exports.app = app;
