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
        // Menangkap parameter dari URL (?base=USD&target=IDR)
        // Menggunakan toUpperCase() agar formatnya selalu huruf besar sesuai standar API
        const baseCurrency = (req.query.base || 'USD').toUpperCase();
        const targetCurrency = (req.query.target || 'IDR').toUpperCase();
        
        // Menangkap jumlah/nominal yang ingin dikonversi
        // jika user tidak mengirimkan ampunt, kita set default ke 1
        const amount = parseFloat(req.query.amount) || 1;

        // URL tujuan ke  ExchangeRate-API (Base Default : USD)
        // pastikan URL ini sesuai dengan dokumnetasi versi api yang digunakan
        const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGERATE_API_KEY}/latest/${baseCurrency}`;

        // Tembak API Eksternal
        const response = await axios.get(url);

        // mengambil rate berdasarkan targetCurrency yang direquest
        const exchangeRate = response.data.conversion_rates[targetCurrency];

        // Validasi jika mata uang target tidak ditemukan di database exchangeRate API
        if (!exchangeRate) {
            return res.status(404).json({
                success: false,
                message: `Mata uang tujuan (${targetCurrency} tidak didukung atau tidak ditemukan)`
            });
        }

        // Perkalian Amount atau nilai yang dimasukan oleh user dengan exchangerate
        const convertedAmount = amount * exchangeRate;

        res.status(200).json({
            success: true,
            message: `Berhasil mengkonversi ${amount} ${baseCurrency} ke ${targetCurrency}`,
            data: {
                base_currency: baseCurrency,
                target_currency: targetCurrency,
                exchange_rate: exchangeRate,
                original_amount: amount,
                converted_amount: parseFloat(convertedAmount)
            }
        });

    } catch (error) {
        console.error('[EXCHANGE RATE API ERROR]', error.message);
        
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Gagal Mengambil Data dari Penyedia Kurs."
            });
        }
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

// Fitur 4 : Mengambil Jawaban dari AI (Gemini API)
const askGemini = async (req, res) => {
    try {
        // Karena pertanyaan bisa panjang, kita gunakan method POST
        // dan mengambil data dari req.body, bukan req.query
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Pertanyaan (question) wajib dikirm!"
            });
        }

        // Kita gunakan model gemini-1.5-flash (cepat dan cocok untuk asisten chat)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

        // Format payload sesuai standar dokumentasi Gemini API
        const payload = {
            contents: [{
                parts: [{ text: `Kamu adalah asisten urban farming bernama AgriSmart. Jawab pertanyaan in dengan ramah: ${question}` }]
            }]
        };

        // Tombak API Gemini
        const response = await axios.post(url, payload);

        // Mengekstrak jawaban teks dari struktur JSON balasan Gemini yang cukup berlapis
        const aiAnswer = response.data.candidates[0].content.parts[0].text;

        res.status(200).json({
            success: true,
            message: "Berhasil mendapatkan jawaban AI",
            data: {
                question: question,
                answer: aiAnswer
            }
        });

    } catch (error) {
        // Log error yang lebih detail khusus untuk Gemini
        console.error('[GEMINI API ERROR]', error.response?.data || error.message);

        // Tangkap spesifik error 503 (High Demand)
        if (error.response && error.response.status === 503) {
            return res.status(503).json({
                success: false,
                message: "Asisten AgriSmart sedang melayani banyak pengguna. Mohon tunggu sebentar dan mohon coba lagi ya!"
            });
        }

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: "Gagal memproses pertanyaan ke AI Gemini"
            });
        }

        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server backend."
        });
    }
};

// Backup Fitur 4 : Menggunakan AI Alternatif (Groq API - Model Llama 3)
const askGroq = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                message: "Pertanyaan (question) wajib dikirm!"
            });
        }

        const url = 'https://api.groq.com/openai/v1/chat/completions';

        // Payload standar OpenAI/Groq
        const payload = {
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "system",
                    content: "Kamu adalah asisten urban farmingbernama AgriSmart. Jawab pertanyaan ini dengan ramah ringkas dalam bahasa Indonesia"
                },
                {
                    role: "user",
                    content: question
                }
            ]
        };

        const   response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiAnswer = response.data.choices[0].message.content;

        res.status(200).json({
            success: true,
            message: "berhasil mendapatkan jawaban AI (Via Groq)",
            data: {
                question: question,
                answer: aiAnswer
            }
        });

    } catch (error) {
        console.error('[GROQ API ERROR]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server AI cadangan."
        });      
    }
};

module.exports = { getWeather, searchPlants, getExchangeRate, askGemini, askGroq };