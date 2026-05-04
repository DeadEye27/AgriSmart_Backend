const express = require('express');
const router = express.Router();
const { register, login, uploadPhoto } = require('../controllers/authController');
const verifyToken = require('../middlewares/authMiddleware');
const { verify } = require('jsonwebtoken');
const db = require('../config/database');

router.post('/register', register)
router.post('/login', login)
// Endpoint : GET /api/auth/profile
// kita menyisipkan 'verifyToken' di tengah tengah
router.get('/profile', verifyToken, async (req, res) => {
    try {
        // Query ke database untuk mengambil data lengkap user berdasarkan ID di token
        // Perhatikan kita memilih kolom id, name, email, dan profile_picture saja (tanpa password)
        const [ users ] = await db.query(
            'SELECT id, name, email, profile_picture FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan"
            });
        }
        // req.user ini didapat dari proses nomor 5 di authMiddleware tadi
        res.status(200).json({
            success: true,
            message: "Berhasil masuk ke area rahasia",
            data: users[0]
        });
    } catch (error) {
        console.error('[PROFILE ERROR]', error);
        res.status(500).json({
            success:  false,
            message: "Terjadi kesalahan pada server beckend"
        });
    }
});

router.post('/upload', verifyToken, uploadPhoto);

module.exports = router;