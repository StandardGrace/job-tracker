// Requires + config loading
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// App setup + middleware
const app = express();
app.use(cors());
app.use(express.json());

// Mongo DNS fix for Node.js 18+
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

// Mongo connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error:', err));

// Application routes
const applicationRoutes = require('./routes/applications');
app.use('/api/applications', applicationRoutes);

// The ping route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

