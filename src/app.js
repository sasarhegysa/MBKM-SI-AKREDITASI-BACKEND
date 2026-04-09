const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import Routes (IKU: Pengembangan RESTful API)
const authRoutes = require('./routes/authRoutes');
const route1a1 = require('./routes/upps/1a1_pimpinan_dan_tupoksi');
const route1a4 = require('./routes/upps/1a4_beban_dtpr');

const app = express();

// 2. Middleware Global
app.use(cors()); 
app.use(express.json()); 

// 3. Definisi Route Utama
app.use('/api/auth', authRoutes);
app.use('/api/upps/1a1-pimpinan', route1a1); 
app.use('/api/upps/1a4-beban', route1a4);

// Master Routes
const pegawaiRoutes = require('./routes/master/pegawaiRoutes');
app.use('/api/master/pegawai', pegawaiRoutes);

// 4. Root Endpoint (Checking Status)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API Sistem Akreditasi STIKOM PGRI Banyuwangi - Online',
        version: '2.1 (LAM INFOKOM)'
    });
});

// 5. Global Error Handling (IKU: Error Handling yang Informatif)
app.use((err, req, res, next) => {
    console.error(`[Error]: ${err.message}`);
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Terjadi kesalahan internal pada server.'
    });
});

// 6. Menjalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di port ${PORT}`);
    console.log(`✅ Auth: http://localhost:${PORT}/api/auth/login`);
    console.log(`✅ UPPS 1.A.1: http://localhost:${PORT}/api/upps/1a1-pimpinan`);
});