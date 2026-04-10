const express = require('express');
const router = express.Router();
const controller1b = require('../../controllers/tpm/1b_unit_spmi');
const { verifyToken, authorize } = require('../../middlewares/auth');

// Keamanan: Hanya Role TPM dan ADMIN yang bisa akses
router.use(verifyToken, authorize('TPM', 'ADMIN'));

router.get('/', controller1b.index);
router.post('/', controller1b.store);
router.put('/:id', controller1b.update);
router.delete('/:id', controller1b.destroy);
router.get('/export', controller1b.exportExcel);

module.exports = router;