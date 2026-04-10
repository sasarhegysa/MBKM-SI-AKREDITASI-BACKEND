const express = require('express');
const router = express.Router();
const controller6 = require('../../controllers/upps/6_visi_misi');
const { verifyToken, authorize } = require('../../middlewares/auth');

router.use(verifyToken, authorize('UPPS', 'ADMIN'));

router.get('/', controller6.index);
router.get('/trash', controller6.trash);
router.post('/', controller6.store);
router.put('/:id', controller6.update);
router.delete('/:id', controller6.destroy);
router.post('/restore/:id', controller6.restore);
router.delete('/hard/:id', controller6.hardDestroy);
router.get('/export', controller6.exportExcel);

module.exports = router;