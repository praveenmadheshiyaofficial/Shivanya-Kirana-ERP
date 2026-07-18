const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/purchase', require('./routes/purchase.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/accounts', require('./routes/accounts.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/users', require('./routes/user.routes'));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Shivanya Kirana ERP Backend is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Shivanya Kirana ERP Backend running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});

module.exports = app;
