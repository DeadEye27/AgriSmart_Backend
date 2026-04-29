const express = require('express');
const router = express.Router();
const { getWeather, searchPlants, getExchangeRate } = require('../controllers/proxyController');
const verifyToken = require('../middlewares/authMiddleware');
const { get } = require('./authRoutes');

// Endpoint GET /api/proxy/weather
router.get('/weather', verifyToken, getWeather);
// Endpoint: GET /api/proxy/plants?q=nama_tanaman
router.get('/plants', verifyToken, searchPlants);
// Endpoint: GET /api/proxy/exchange-rate
router.get('/exchange-rate', verifyToken, getExchangeRate);


module.exports = router;
