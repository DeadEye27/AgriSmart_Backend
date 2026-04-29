const axios = require('axios');
require('dotenv').config();

// Fitur 1 : Mengambil Data Cuaca
const getWeather = async (req, res) => {
    try {
        // Butuh latitude (lat) dan longitude (lon) dari Frontend
        const { lat, lon } =  req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "Paramater latitude (lat) dan longitude (lon) wajib dikirim!"
            });
        }

        // URL tujuan ke OpenWeatherMap (menggunakan satuan metrik / Celcius)
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
        
        // backend kita menembak API eksternal menggunakan axios
        const response = await axios.get(url);
        
        // jika berhasil, kita kembalikan datanya ke Frontend
        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data cuaca",
            data: response.data
        });

    } catch (error) {
        console.error('[WEATHER API ERROR]', error.message);

        // error hnadling jika API Key salah atau limit habis
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Gagal mengambil data dari penyedia cuaca."
            });
        }
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

module.exports = { getWeather };