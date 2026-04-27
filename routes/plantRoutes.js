const express = require('express');
const router = express.Router();
const { addPlant, getPlants } = require('../controllers/plantController');
const verifyToken = require('../middlewares/authMiddleware');
const { get } = require('./authRoutes');

// memasang middleware 'verifyToken' di setiap rute tanaman
router.post('/', verifyToken, addPlant); // untuk Create
router.get('/', verifyToken, getPlants); // untuk Read

module.exports = router;
