const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/proxyController');
const verifyToken = require('../middlewares/authMiddleware');
const { get } = require('./authRoutes');

// Endpoint GET /api/proxy/weather
router.get('/weather', verifyToken, getWeather);

module.exports = router;
