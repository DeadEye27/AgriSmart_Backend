const express = require('express');
const router = express.Router();
const { getWeather, searchPlants } = require('../controllers/proxyController');
const verifyToken = require('../middlewares/authMiddleware');
const { get } = require('./authRoutes');

// Endpoint GET /api/proxy/weather
router.get('/weather', verifyToken, getWeather);
// Endpoint: GET /api/proxy/plants?q=nama_tanaman
router.get('/plants', verifyToken, searchPlants);


module.exports = router;
