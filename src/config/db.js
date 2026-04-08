const mysql = require('mysql2');
require('dotenv').config();

// Membuat koneksi pool ke database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubah pool menjadi versi promise agar mendukung async/await
const db = pool.promise();

// Penanganan Error Awal: Cek koneksi saat server dinyalakan (IKU: Error Handling)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal terhubung ke MySQL:', err.message);
    } else {
        console.log('✅ Berhasil terhubung ke Database MySQL STIKOM.');
        connection.release();
    }
});

module.exports = db;