const Pegawai = require('../../models/master/pegawai');

/**
 * Tabel Master: Pegawai
 * Controller untuk mengelola data pegawai.
 */

// 1. Get All Active Data
exports.index = async (req, res) => {
    try {
        const data = await Pegawai.getAll();
        res.json({
            success: true,
            message: 'Berhasil mengambil data pegawai.',
            data: data
        });
    } catch (error) {
        console.error('[Error GET Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pegawai.', error: error.message });
    }
};

// 1b. Get All Soft Deleted Data
exports.deletedList = async (req, res) => {
    try {
        const data = await Pegawai.getDeleted();
        res.json({
            success: true,
            message: 'Berhasil mengambil data pegawai (Sampah/Terhapus).',
            data: data
        });
    } catch (error) {
        console.error('[Error GET Deleted Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pegawai.', error: error.message });
    }
};

// 2. Get Data by ID
exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Pegawai.getById(id);

        if (!data) {
            return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan (atau sudah dihapus).' });
        }

        res.json({
            success: true,
            message: 'Berhasil mengambil detail data pegawai.',
            data: data
        });
    } catch (error) {
        console.error('[Error GET Pegawai By ID]', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data pegawai.', error: error.message });
    }
};

// 3. Create Data
exports.store = async (req, res) => {
    try {
        const { nama_lengkap, nikp, id_unit, id_jabatan_struktural, pendidikan_terakhir } = req.body;

        if (!nama_lengkap) {
            return res.status(400).json({ success: false, message: 'nama_lengkap wajib diisi.' });
        }

        const insertId = await Pegawai.create({
            nama_lengkap, nikp, id_unit, id_jabatan_struktural, pendidikan_terakhir
        });

        res.status(201).json({
            success: true,
            message: 'Data pegawai berhasil ditambahkan.',
            data: { id_pegawai: insertId, ...req.body }
        });
    } catch (error) {
        console.error('[Error POST Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal menambahkan data pegawai.', error: error.message });
    }
};

// 4. Update Data
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_lengkap, nikp, id_unit, id_jabatan_struktural, pendidikan_terakhir } = req.body;

        if (!nama_lengkap) {
            return res.status(400).json({ success: false, message: 'nama_lengkap wajib diisi.' });
        }

        const checkData = await Pegawai.getById(id);
        if (!checkData) {
            return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan atau sudah dihapus.' });
        }

        await Pegawai.update(id, {
            nama_lengkap, nikp, id_unit, id_jabatan_struktural, pendidikan_terakhir
        });

        res.json({ success: true, message: 'Data pegawai berhasil diperbarui.' });
    } catch (error) {
        console.error('[Error PUT Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui data pegawai.', error: error.message });
    }
};

// 5. Soft Delete Data
exports.destroy = async (req, res) => {
    try {
        const { id } = req.params;
        // Asumsi middleware auth menyimpan .id_user di objek req.user
        // Jika tidak, gunakan dummy/null terlebih dahulu
        const userId = req.user ? req.user.id_user : null;

        const checkData = await Pegawai.getById(id);
        if (!checkData) return res.status(404).json({ success: false, message: 'Data pegawai tidak ditemukan.' });

        await Pegawai.softDelete(id, userId);

        res.json({ success: true, message: 'Data pegawai berhasil dipindahkan ke tempat sampah (Soft Delete).' });
    } catch (error) {
        console.error('[Error Soft DELETE Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data pegawai.', error: error.message });
    }
};

// 6. Hard Delete Data
exports.hardDestroy = async (req, res) => {
    try {
        const { id } = req.params;
        await Pegawai.hardDelete(id);
        res.json({ success: true, message: 'Data pegawai berhasil dihapus secara permanen (Hard Delete).' });
    } catch (error) {
        console.error('[Error Hard DELETE Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal menghapus data secara permanen.', error: error.message });
    }
};

// 7. Restore Data
exports.restore = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await Pegawai.restore(id);
        
        if (affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Gagal memulihkan. ID tidak ada atau data memang tidak dalam kondisi terhapus.' });
        }
        res.json({ success: true, message: 'Data pegawai berhasil dipulihkan (Restore).' });
    } catch (error) {
        console.error('[Error Restore Pegawai]', error);
        res.status(500).json({ success: false, message: 'Gagal memulihkan data pegawai.', error: error.message });
    }
};
