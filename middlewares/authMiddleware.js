const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    // 1. ambil header authorization dari request Frontend
    const authHeader = req.headers['authorization'];

    // 2. Format token biasannya : "Bearer <token_panjang_disini>"
    // memisahkan kata "Bearer" dan ambil tokennya aja
    const token = authHeader && authHeader.split(' ')[1];

    //  3. Jika token tidak  dikirim sekali
    if(!token) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak! Token otentikasi tidak ditemukan."
        });
    }

    try {
        // 4. cek keaslian token menggunakan Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. data user (id dan email dari token) dititipkan ke dalam request
        // agar bisa dipakai oleh fungsi2 selanjutnya (CRUD Tanaman)
        req.user = decoded;

        // 6. lanjut ke proses breikutnya (masuk ke dalam endpoint tujuan)
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Akses ditolak! Token tidak valid atau sudah kadaluarsa."
        });
    }
};

module.exports = verifyToken;