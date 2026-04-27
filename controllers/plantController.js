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

// Fitur 3 : Mengubah Data Tanaman (Update)
const updatePlant = async (req, res) => {
    try {
        const plantId = req.params.id; // mengambil ID tanaman dari URL contoh : /api/plants/1
        const userId = req.user.id; // ID user dari token JWT
        const { name, species, watering_frequency } = req.body;

        // 1. Cek apakah tanaman tersebut ada dan BENAR milik user yang sedang login
        const [existingPlant] = await db.query('SELECT * FROM plants WHERE id = ? AND user_id = ?', [plantId, userId]);

        if (existingPlant.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tanaman tidak ditemukan atau anda tidak memiliki akses untuk mengubahnya."
            });
        }

        // 2. Do the Update
        // jika ada field yang tidak dikirm dari Frontend, kita gunakan data lama (existingPlant)
        await db.query(
            'UPDATE plants SET name = ?, species = ?, watering_frequency = ? WHERE id = ?',
            [
                name || existingPlant[0].name,
                species || existingPlant[0].species,
                watering_frequency || existingPlant[0].watering_frequency,
                plantId
            ]
        );

        res.status(200).json({
            success: true,
            message: "Data tanaman diperbarui"
        });

    } catch (error) {
        console.error('[UPDATE PLANT ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });      
    }
};

// Fitur 4 : Menghapus Tanaman (Delete)
const deletePlant = async (req, res) => {
    try {
        const plantId = req.params.id;
        const userId = req.user.id;

        // 1. pastikan tanaman ada dan milik si user
        const [existingPlant] = await db.query('SELECT * FROM plants WHERE id = ? AND user_id = ?', [plantId, userId]);

        if (existingPlant.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Tanaman tidak ditemukan atau Anda tidak memiliki akses untuk menghapusnya"
            });
        }
        
        // 2. hapus dari database
        await db.query('DELETE FROM plants WHERE id = ?', [plantId]);

        res.status(200).json({
            success: true,
            message: "Tanaman Berhasil dihapus!"
        });

    } catch (error) {
        console.error('[DELETE PLANT ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server"
        });
    }
};

module.exports = { addPlant, getPlants, updatePlant, deletePlant };