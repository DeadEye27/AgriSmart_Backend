const db = require('../config/database');
const bcrypt = require('bcrypt');
const { json } = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    }, 
    filename: (req, file, cb) => {
        cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    }
});

// 1. PERUBAHAN: Hapus .single('photo') dari sini, biarkan hanya inisiasi multer-nya saja
const upload = multer({ storage: storage }); 

// 2. PERUBAHAN: Fungsi uploadPhoto sekarang jadi jauh lebih bersih
const uploadPhoto = async (req, res) => {
    // Console log ini sangat berguna untuk debugging (seperti saran temanmu)
    console.log('[UPLOAD] user dari token:', req.user);
    console.log('[UPLOAD] file:', req.file);

    // Karena file sudah di-parsing oleh middleware di route, 
    // kita tinggal ngecek apakah filenya ada atau tidak
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Mohon pilih file foto"
        });
    }

    try {
        const userId = req.user.id;
        const fileName = req.file.filename;
        
        // Update kolom profile_picture di database
        await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [fileName, userId]);

        res.status(200).json({
            success: true,
            message: "Foto Profile Berhasil Diperbarui",
            fileName: fileName
        });
        
    } catch (error) {
        console.error('[UPLOAD ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend"
        });
    }
};

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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan Password wajib diisi!"
            });
        }

        // cari user berdasarkan email di database
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email belum terdaftar."
            });
        }

        const user = users[0]; // ambil data user dari array

        // bandingkan password yang dikirm dengan hash password di database
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword){
            return res.status(401).json({
                success: false,
                message: "Password Salah!"
            });
        }

        // jika benar, token JWT akan dibuat
        // yang disimpan adalah id dan email user, akan kadaluarsa dalam 1 hari
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // mengirim respon sukses beserta tokennya
        res.status(200).json({
            success: true,
            message: "Login Berhasil!",
            token: token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('[LOGIN ERROR]', error);
        res.status(500).json({
            success:  false,
            message: "Terjadi kesalahan pada server beckend"
        });
    }
};

module.exports = { register, login, uploadPhoto, upload };