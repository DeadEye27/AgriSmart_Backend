const express = require('express');
const router = express.Router();
const { addSchedule, getSchedules } = require('../controllers/scheduleController');
const verifyToken = require('../middlewares/authMiddleware');

// memasang satpam atau validasi user login yaitu verifyToken
router.post('/', verifyToken, addSchedule); // tambah jadwal penyiraman
router.get('/', verifyToken, getSchedules); // mengambil semua jadwal penyiraman yang ada di akun user yang sedang login

module.exports = router;
