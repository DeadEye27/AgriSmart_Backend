const express = require('express');
const router = express.Router();
const { addPlant, getPlants, updatePlant, deletePlant } = require('../controllers/plantController');
const verifyToken = require('../middlewares/authMiddleware');
const { get } = require('./authRoutes');

// memasang middleware 'verifyToken' di setiap rute tanaman
router.post('/', verifyToken, addPlant); // untuk Create
router.get('/', verifyToken, getPlants); // untuk Read
// URL dengan ':id' menandakan bahwa itu adalah parameter dinamis
router.put('/:id', verifyToken, updatePlant); // untuk Update
router.delete('/:id', verifyToken, deletePlant); // untuk Delete

module.exports = router;
