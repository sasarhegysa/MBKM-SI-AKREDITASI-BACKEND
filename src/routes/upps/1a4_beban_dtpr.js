const express = require('express');
const router = express.Router();
const controller1a4 = require('../../controllers/upps/1a4_beban_dtpr');
const { verifyToken, authorize } = require('../../middlewares/auth');
const { UNITS } = require('../../config/permissions');

// Middleware Global: Hanya UPPS dan ADMIN yang bisa mengelola data beban kerja
router.use(verifyToken, authorize(UNITS.UPPS, UNITS.ADMIN));

// 1. Ambil List Beban DTPR (Gunakan query ?id_tahun=...)
router.get('/', controller1a4.index);

// 2. Tambah Data Beban Kerja Baru
router.post('/', controller1a4.store);

// 3. Hapus Data (Soft Delete)
router.delete('/:id', controller1a4.destroy);
router.delete('/hard/:id', controller1a4.hardDestroy);

// 4. Export ke Excel (Gunakan query ?id_tahun=...&token=...)
router.get('/export', controller1a4.exportExcel);

module.exports = router;