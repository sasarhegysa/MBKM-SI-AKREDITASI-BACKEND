const express = require('express');
const router = express.Router();
const pegawaiController = require('../../controllers/master/pegawaiController');
const { verifyToken, authorize } = require('../../middlewares/auth');
const { UNITS } = require('../../config/permissions');

/**
 * ROUTES: Tabel Master Pegawai
 */

router.use(verifyToken, authorize(UNITS.ADMIN));

// Get All Active Data
router.get('/', pegawaiController.index);

// Get All Soft Deleted Data
// Peringatan: Harus diletakkan di atas rute '/:id' untuk menghindari salah pembacaan ID
router.get('/deleted', pegawaiController.deletedList);

// Get Data by ID
router.get('/:id', pegawaiController.show);

// Create Data
router.post('/', pegawaiController.store);

// Update Data
router.put('/:id', pegawaiController.update);

// Soft Delete
router.delete('/:id', pegawaiController.destroy);

// Hard Delete
router.delete('/hard/:id', pegawaiController.hardDestroy);

// Restore Soft Deleted Data
router.put('/restore/:id', pegawaiController.restore);

module.exports = router;
