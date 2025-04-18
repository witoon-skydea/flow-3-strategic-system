const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize database
const db = require('./config/database');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get base path from environment variable or default to /
const BASE_PATH = process.env.BASE_PATH || '/';

// API Routes
app.use(`${BASE_PATH}api/auth`, require('./routes/authRoutes'));
app.use(`${BASE_PATH}api/users`, require('./routes/userRoutes'));
app.use(`${BASE_PATH}api/organizations`, require('./routes/organizationRoutes'));
app.use(`${BASE_PATH}api/strategy-plans`, require('./routes/strategyPlanRoutes'));
app.use(`${BASE_PATH}api/strategic-goals`, require('./routes/strategicGoalRoutes'));
app.use(`${BASE_PATH}api/hr-dev-plans`, require('./routes/hrDevPlanRoutes'));
app.use(`${BASE_PATH}api/hr-dev-initiatives`, require('./routes/hrDevInitiativeRoutes'));
app.use(`${BASE_PATH}api/digital-dev-plans`, require('./routes/digitalDevPlanRoutes'));
app.use(`${BASE_PATH}api/digital-initiatives`, require('./routes/digitalInitiativeRoutes'));
app.use(`${BASE_PATH}api/action-plans`, require('./routes/actionPlanRoutes'));
app.use(`${BASE_PATH}api/action-items`, require('./routes/actionItemRoutes'));
app.use(`${BASE_PATH}api/risk-management-plans`, require('./routes/riskManagementPlanRoutes'));
app.use(`${BASE_PATH}api/risks`, require('./routes/riskRoutes'));
app.use(`${BASE_PATH}api/dashboard`, require('./routes/dashboardRoutes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(`${BASE_PATH}`, express.static(path.join(__dirname, '../frontend/build')));
  
  app.get(`${BASE_PATH}*`, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Base path: ${BASE_PATH}`);
});
