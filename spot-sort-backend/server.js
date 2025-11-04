// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- Middleware ---
// Enable CORS for your React frontend (running on port 3000/5173/etc.)
app.use(cors());

// Body Parsers
// Need express.json() for JSON data (e.g., login, OTP requests)
app.use(express.json());
// Need express.urlencoded for form data
app.use(express.urlencoded({ extended: false }));

// --- Static Folder ---
// This is crucial for serving the images you upload via Multer.
// It makes the '/uploads' directory publicly accessible.
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- API Routes ---
// This tells the server to use your route files for any
// request starting with '/api/auth' or '/api/issues'.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/audit', require('./routes/audit'));

// Basic Welcome Route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Spot & Sort API' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));