const express = require('express');
const router = express.Router();
const controller3a3 = require('../../controllers/upps/3a3_pengembangan_dtpr');
const { verifyToken, authorize } = require('../../middlewares/auth');

// Middleware keamanan: Hanya UPPS dan ADMIN
router.use(verifyToken, authorize('UPPS', 'ADMIN'));

// --- Operasi Data Aktif ---
router.get('/', controller3a3.index);
router.post('/', controller3a3.store);
router.put('/:id', controller3a3.update);
router.delete('/:id', controller3a3.destroy); // Soft Delete

// --- Operasi Tempat Sampah ---
router.get('/trash', controller3a3.trash); // Lihat sampah
router.post('/restore/:id', controller3a3.restore); // Pulihkan
router.delete('/hard/:id', controller3a3.hardDestroy); // Hapus Permanen

// --- Ekspor ---
router.get('/export', controller3a3.exportExcel);

module.exports = router;