require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const packageRoutes = require('./routes/packageRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const forwarderRoutes = require('./routes/forwarderRoutes');
const shipmentHealthStatusRoutes = require('./routes/shipmentHealthStatusRoutes');
const { seedForwarders } = require('./seed/forwarderSeed');
const { seedShipmentHealthStatuses } = require('./seed/shipmentHealthStatusSeed');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow cross-origin requests from the frontend
app.use(cors({
  origin: "*"
}));

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Main Auth router mapping
app.use('/api/auth', authRoutes);

// Orders router mapping
app.use('/api/orders', orderRoutes);

// Packages router mapping
app.use('/api/packages', packageRoutes);

// Bookings router mapping
app.use('/api/bookings', bookingRoutes);

// Quotations router mapping
app.use('/api/quotations', quotationRoutes);

// Shipments router mapping
app.use('/api/shipments', shipmentRoutes);

// Forwarders router mapping
app.use('/api/forwarders', forwarderRoutes);

// Shipment health statuses router mapping
app.use('/api/shipment-health-statuses', shipmentHealthStatusRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong inside the server.'
  });
});

// Initialize Database & Start Server
async function startServer() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDb();
    console.log('Connected to MongoDB successfully.');

    await seedForwarders();
    await seedShipmentHealthStatuses();

    app.listen(PORT, () => {
      console.log(`Authentication server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database or start server:', error);
    process.exit(1);
  }
}

startServer();
