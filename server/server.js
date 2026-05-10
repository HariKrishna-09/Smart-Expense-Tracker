const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Test Route
app.get('/', (req, res) => {
  res.send('Backend Running');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use(
  '/api/transactions',
  require('./routes/transactionRoutes')
);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});