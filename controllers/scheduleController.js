const db = require('../config/database');

// Fitur 1 : Menambahkan Jadwal Siram Baru (Create)
const addSchedule = async (req, res) => {
    try {
        const { plant_id, watering_date } = req.body;
        const userId = req.user.id // dari token JWT

        // Validasi input dasar
        if (!plant_id || !watering_date) {
            return res.status(400).json({
                success: false,
                message: "plant_id dan watering_date (YYYY-MM-DD) wajib diisi!"
            });
        }

        // tambahan validasi sebagai keamanan ekstra : memastikan tanmaan (plant_id) ini BENAR milik user yang sedang login
        const [plant] = await db.query('SELECT id FROM plants WHERE id = ? AND user_id = ?', [plant_id, userId]);

        if (plant.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Akses ditolak! Tanaman tidak d itemukan atau bukan milikmu."
            });
        }

        // jika sudah tervalidasi dan aman, masukan jadwal ke database
        const [result] = await db.query(
            'INSERT INTO schedules (plant_id, watering_date) VALUES (?, ?)',
            [plant_id, watering_date]
        );

        res.status(201).json({
            success: true,
            message: "Jadwal penyiraman berhasil ditambahkan!",
            data: {
                id: result.insertId,
                plant_id: plant_id,
                watering_date: watering_date,
                status: 'pending' // Status default dari database
            }
        });

    } catch (error) {
        console.error('[ADD SCHEDULE ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

// Fitur 2 : Mengambil Dafatar Jadwal User (Read)
const getSchedules = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Menggunakan teknik JOIN SQL agar tidak hanya mendapat ID Tanaman,
        // tapi juga mendapatkan Nama Tanamannya sekaligus untuk memudahkan Frontend.
        const query = `
            SELECT s.id, s.plant_id, p.name AS plant_name, s.watering_date, s.status
            FROM schedules s
            JOIN plants p ON s.plant_id = p.id
            WHERE p.user_id = ?
            ORDER BY s.watering_date ASC
        `;

        const [schedules] = await db.query(query, [userId]);

        res.status(200).json({
            success: true, 
            message: "Berhasil mengambil data jadwal",
            data: schedules
        });

    } catch (error) {
        console.error('[GET SCHEDULES ERROR]', error);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });      
    }
};

module.exports = { addSchedule, getSchedules };