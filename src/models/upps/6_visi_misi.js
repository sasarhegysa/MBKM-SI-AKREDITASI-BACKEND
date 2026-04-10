const db = require('../../config/db');

const Model6 = {
    // Ambil data aktif per Prodi
    findAll: async (id_prodi) => {
        const sql = "SELECT * FROM `6_visi_misi` WHERE id_prodi = ? AND deleted_at IS NULL";
        const [rows] = await db.execute(sql, [id_prodi]);
        return rows;
    },

    // Ambil data sampah
    findTrash: async (id_prodi) => {
        const sql = "SELECT * FROM `6_visi_misi` WHERE id_prodi = ? AND deleted_at IS NOT NULL";
        const [rows] = await db.execute(sql, [id_prodi]);
        return rows;
    },

    create: async (data) => {
        /**
         * Update Field: 
         * Menggunakan misi_upps dan visi_keilmuan_ps sesuai struktur DB terbaru.
         */
        const sql = `INSERT INTO \`6_visi_misi\` 
            (id_prodi, visi_pt, misi_pt, visi_upps, misi_upps, visi_keilmuan_ps, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        return await db.execute(sql, [
            data.id_prodi, 
            data.visi_pt, 
            data.misi_pt, 
            data.visi_upps, 
            data.misi_upps, 
            data.visi_keilmuan_ps, // Diubah dari misi_keilmuan_ps
            data.created_by
        ]);
    },

    update: async (id, data) => {
        /**
         * Update Field:
         * Menyesuaikan parameter update dengan visi_keilmuan_ps.
         */
        const sql = `UPDATE \`6_visi_misi\` 
            SET visi_pt = ?, misi_pt = ?, visi_upps = ?, misi_upps = ?, visi_keilmuan_ps = ?, updated_by = ? 
            WHERE id_vm = ?`;
        return await db.execute(sql, [
            data.visi_pt, 
            data.misi_pt, 
            data.visi_upps, 
            data.misi_upps, 
            data.visi_keilmuan_ps, // Diubah dari misi_keilmuan_ps
            data.updated_by, 
            id
        ]);
    },

    softDelete: async (id, deleted_by) => {
        const sql = "UPDATE `6_visi_misi` SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id_vm = ?";
        return await db.execute(sql, [deleted_by, id]);
    },

    restore: async (id) => {
        const sql = "UPDATE `6_visi_misi` SET deleted_at = NULL, deleted_by = NULL WHERE id_vm = ?";
        return await db.execute(sql, [id]);
    },

    hardDelete: async (id) => {
        const sql = "DELETE FROM `6_visi_misi` WHERE id_vm = ?";
        return await db.execute(sql, [id]);
    }
};

module.exports = Model6;