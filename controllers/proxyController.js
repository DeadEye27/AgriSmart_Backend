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

// Fitur 2 : Mengambil Data Katalog Tanaman (Perenual API)
const searchPlants = async (req, res) => {
    try {
        // Frontend akan mengirim kata kunci pencarian, misalnya ?q=tomato
        const searchQuery = req.query.q;

        if (!searchQuery) {
            return res.status(400).json({
                success: false,
                message: "Parameter kata kunci pencarian (q) wajib dikirim!"
            });
        }

        // URL tujuan ke Perenual API
        const url = `https://perenual.com/api/v2/species-list?key=${process.env.PERENUAL_API_KEY}&q=${searchQuery}`;

        // tembak API eksternal
        const response = await axios.get(url);

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil data katalog tanaman",
            data: response.data
        });

    } catch (error) {
        console.error('[PERENUAL API ERROR]', error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Gagal Mengambil data dari ensiklopedia tanaman."
            });
        }
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

// Fitur 3 : Mengambil Data Konversi Uang (ExchangeRate-API)
const getExchangeRate = async (req, res) => {
    try {
        // URL tujuan ke  ExchangeRate-API (Base Default : USD)
        // pastikan URL ini sesuai dengan dokumnetasi versi api yang digunakan
        const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/USD`;

        // Tembak API Eksternal
        const response = await axios.get(url);

        // mengambil rate IDR saja agar response ke frontend lebih ringan dan spesifik
        const idrRate = response.data.conversion_rates.IDR;

        res.status(200).json({
            success: true,
            message: "Berhasil mengambil kurs tukas USD ke IDR",
            data: {
                base_currency: "USD",
                target_currency: "IDR",
                rate: idrRate
            }
        });

    } catch (error) {
        console.error('[EXCHANGE RATE API ERROR]', error.message);
        
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Gagal Mengambil Data dari Penyedia Kurs"
            });
        }
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

module.exports = { getWeather, searchPlants, getExchangeRate };