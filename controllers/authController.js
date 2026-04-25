const db = require('../config/database');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        // menangkap data yang dikirm dari frontend
        const { name, email, password } = req.body;

        // validasi data tidak kosong
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Semua data (name, email, password) wajib diisi!"
            });
        };

        // mengecek apakah email sudah digunakan atau belum
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: " Email sudah terdaftar, silahkan gunakan email lain atau login"
            });
        };

        // hash password menggunakan bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // simpan user baru ke database
        const [result] = await db.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
            [name, email, hashedPassword]
        );

        // berikan respon sukses ke frontend
        res.status(201).json({
            success: true,
            message: "Registrasi berhasil",
            data: {
                id: result.insertId,
                name: name,
                email: email
            }
        });

    } catch (error) {
        console.log('[RESGISTER ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend"
        });
    }
};

module.exports = { register };