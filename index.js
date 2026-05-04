const express = require('express');
const cors =  require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const db = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const proxyRoutes = require('./routes/proxyRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Halo dari Backend AgriSmart! Server berjalan dengan baik",
    });
});

app.listen(port, ()=> {
    console.log(`[SERVER] AgriSmart API berjalan di http://localhost:${port}`);
});