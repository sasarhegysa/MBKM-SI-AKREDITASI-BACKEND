const jwt = require('jsonwebtoken');

/**
 * AUTHENTICATION MIDDLEWARE
 * Mendukung autentikasi via Header (Bearer) dan Query Parameter (token).
 * Memenuhi IKU: Integritas Data & Error Handling
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = null;

    // 1. Cek token di Header (Format: Bearer <token>)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } 
    // 2. Cek token di Query String (Format: ?token=<token>)
    // Ini solusi agar browser bisa download/export file lewat link <a> atau window.open
    else if (req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak! Token tidak ditemukan atau format salah.' 
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Simpan data user (id_user, id_unit, nama_unit) ke request
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token tidak valid atau sudah kadaluarsa.' 
        });
    }
};

/**
 * AUTHORIZATION MIDDLEWARE
 * Menjamin tiap unit hanya bisa mengakses tabel yang menjadi tanggung jawabnya.
 * Memenuhi IKT: Keamanan Autentikasi & Otorisasi
 */
const authorize = (...allowedUnits) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User tidak teridentifikasi.' });
        }

        // 1. ADMIN (Unit 13) selalu punya akses ke semua tabel (Master Key)
        // 2. Cek apakah unit user ada dalam daftar unit yang diizinkan
        const hasAccess = req.user.nama_unit === 'ADMIN' || allowedUnits.includes(req.user.nama_unit);

        if (!hasAccess) {
            return res.status(403).json({ 
                success: false, 
                message: `Akses dilarang! Unit ${req.user.nama_unit} tidak memiliki wewenang pada data ini.` 
            });
        }

        next();
    };
};

module.exports = { verifyToken, authorize };