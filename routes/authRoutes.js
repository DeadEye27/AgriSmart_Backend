const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const { verify } = require('jsonwebtoken');

router.post('/register', register)
router.post('/login', login)
// Endpoint : GET /api/auth/profile
// kita menyisipkan 'verifyToken' di tengah tengah
router.get('/profile', verifyToken, (req, res) => {
    // req.user ini didapat dari proses nomor 5 di authMiddleware tadi
    res.status(200).json({
        success: true,
        message: "Berhasil masuk ke area rahasia",
        user: req.user
    });
});

module.exports = router;