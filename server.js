const express = require('express');
require('dotenv').config();
const path = require('path');
const connectDB = require('./config/db');
const logger = require('./src/utils/logger');

const app = express();
const port = process.env.PORT || 5000;

const authRoutes = require('./src/routes/authRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const sanctionsRoutes = require('./src/routes/sanctionsRoutes');
const errorHandler = require('./src/utils/errorHandler'); 
const authMiddleware = require('./src/middleware/authMiddleware'); 

// Connect to MongoDB
// connectDB();


// Middleware
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

// Protected route example
app.get('/api/protected-route', authMiddleware, (req, res) => {
    res.json({ message: 'You have access to this protected route.', user: req.user });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sanctions', sanctionsRoutes);

// Error handling
app.use(errorHandler); // Ensure this is a function

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
