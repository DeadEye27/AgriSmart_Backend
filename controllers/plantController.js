const db = require('../config/database');
const { get } = require('../routes/authRoutes');

// Fitur 1 : Menambahkan Tanaman Baru (Create)
const addPlant = async (req, res) => {
    try {
        const { name, species, watering_frequency } = req.body;

        // mengambil ID user dari token JWT yang sudah di-decode oleh middleware
        const userId = req.user.id;

        // Validasi Input
        if (!name || !watering_frequency) {
            return res.status(400).json({
                success: false,
                message: "Nama tanaman dan frekeunsi siram (hari) wajib diisi!"
            });
        }

        // simpan ke database
        const [result] = await db.query(
            'INSERT INTO plants (user_id, name, species, watering_frequency) VALUES (?, ?, ?, ?)',
            [userId, name, species || null, watering_frequency]
        );

        res.status(201).json({
            success: true,
            message: "Tanaman berhasil ditambahkan!",
            data: {
                id: result.insertId,
                userId: userId,
                name: name,
                species: species,
                watering_frequency: watering_frequency
            }
        });

    } catch (error) {
        console.error('[ADD PLANT ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahab pada server backend."
        });
    }
};

// Fitur 2 : Mengambil Daftar Tanaman milik User (Read)
const getPlants = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil data dari database yang HANYA milik user tersebut
        const [plants] = await db.query('SELECT * FROM plants WHERE user_id = ?', [userId]);

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data tanaman.",
            data: plants
        });
    } catch (error) {
        console.error('[GET PLANTS ERROR]', error);
        res.status(500).json({
            success: false, 
            message: "Terjadi kesalahan pada server backend"
        });
    }
};

module.exports = { addPlant, getPlants };