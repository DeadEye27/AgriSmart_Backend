const express = require('express');
const cors =  require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const db = require('./config/database');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Halo dari Backend AgriSmart! Server berjalan dengan baik",
    });
});

app.listen(port, ()=> {
    console.log(`[SERVER] AgriSmart API berjalan di http://localhost:${port}`);
});