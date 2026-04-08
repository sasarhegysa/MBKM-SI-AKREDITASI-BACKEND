const express = require('express');
const router = express.Router();
const controller1a1 = require('../../controllers/upps/1a1_pimpinan_dan_tupoksi');
const { verifyToken, authorize } = require('../../middlewares/auth');
const { UNITS } = require('../../config/permissions');

/**
 * ROUTES: Tabel 1.A.1 Pimpinan dan Tupoksi
 * Memenuhi IKU: Pengembangan RESTful API & IKT: Keamanan
 */

// Global Middleware untuk rute ini: Harus Login & Harus dari Unit UPPS atau ADMIN
router.use(verifyToken, authorize(UNITS.UPPS, UNITS.ADMIN));

// 1. Endpoint Dashboard (Read All)
router.get('/', controller1a1.index);

// 2. Endpoint Tambah Data (Create) - Menjalankan Auto-SKS Engine
router.post('/', controller1a1.store);

// 3. Endpoint Update Data
router.put('/:id', controller1a1.update);

// 4. Endpoint Hapus Data (Soft Delete)
router.delete('/:id', controller1a1.destroy);
router.delete('/hard/:id', controller1a1.hardDestroy);

// 5. Endpoint Export Excel
// Catatan: Letakkan di atas rute yang menggunakan params jika ada konflik
router.get('/export', controller1a1.exportExcel);

module.exports = router;