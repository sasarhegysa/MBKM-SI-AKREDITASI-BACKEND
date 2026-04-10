const db = require('../../config/db');

/**
 * Model Tabel 3.A.3 Pengembangan DTPR
 * Mendukung Full CRUD: Soft Delete, Restore, & Hard Delete
 */
const Model3a3 = {
    // 1. Ambil data yang aktif
    findAllRange: async (id_tahun) => {
        const sql = `
            SELECT 
                p.id_pengembangan,
                peg.nama_lengkap AS nama_dtpr,
                p.jenis_pengembangan,
                p.nama_pengembangan,
                p.link_bukti,
                p.id_tahun
            FROM \`3a3_pengembangan_dtpr\` p
            JOIN dosen d ON p.id_dosen = d.id_dosen
            JOIN pegawai peg ON d.id_pegawai = peg.id_pegawai
            WHERE p.id_tahun BETWEEN (? - 2) AND ? 
            AND p.deleted_at IS NULL
            ORDER BY p.id_tahun DESC, peg.nama_lengkap ASC
        `;
        const [rows] = await db.execute(sql, [id_tahun, id_tahun]);
        return rows;
    },

    // 2. Ambil data di "Tempat Sampah"
    findAllDeleted: async (id_tahun) => {
        const sql = `
            SELECT p.*, peg.nama_lengkap AS nama_dtpr
            FROM \`3a3_pengembangan_dtpr\` p
            JOIN dosen d ON p.id_dosen = d.id_dosen
            JOIN pegawai peg ON d.id_pegawai = peg.id_pegawai
            WHERE p.id_tahun = ? AND p.deleted_at IS NOT NULL
            ORDER BY p.deleted_at DESC
        `;
        const [rows] = await db.execute(sql, [id_tahun]);
        return rows;
    },

    // 3. Stats untuk Header (TS-2, TS-1, TS)
    getStats: async (current_id_tahun) => {
        const sql = `
            SELECT id_tahun, COUNT(DISTINCT id_dosen) as jumlah_dosen
            FROM \`3a3_pengembangan_dtpr\`
            WHERE id_tahun BETWEEN (? - 2) AND ? AND deleted_at IS NULL
            GROUP BY id_tahun
        `;
        const [rows] = await db.execute(sql, [current_id_tahun, current_id_tahun]);
        return rows;
    },

    create: async (data) => {
        const sql = `
            INSERT INTO \`3a3_pengembangan_dtpr\` 
            (id_dosen, jenis_pengembangan, nama_pengembangan, link_bukti, id_tahun, created_by) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await db.execute(sql, [data.id_dosen, data.jenis_pengembangan, data.nama_pengembangan, data.link_bukti, data.id_tahun, data.created_by]);
    },

    update: async (id, data) => {
        const sql = `
            UPDATE \`3a3_pengembangan_dtpr\` 
            SET id_dosen = ?, jenis_pengembangan = ?, nama_pengembangan = ?, link_bukti = ?, updated_by = ?
            WHERE id_pengembangan = ?
        `;
        return await db.execute(sql, [data.id_dosen, data.jenis_pengembangan, data.nama_pengembangan, data.link_bukti, data.updated_by, id]);
    },

    softDelete: async (id, deleted_by) => {
        const sql = `UPDATE \`3a3_pengembangan_dtpr\` SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id_pengembangan = ?`;
        return await db.execute(sql, [deleted_by, id]);
    },

    restore: async (id) => {
        const sql = `UPDATE \`3a3_pengembangan_dtpr\` SET deleted_at = NULL, deleted_by = NULL WHERE id_pengembangan = ?`;
        return await db.execute(sql, [id]);
    },

    hardDelete: async (id) => {
        const sql = "DELETE FROM `3a3_pengembangan_dtpr` WHERE id_pengembangan = ?";
        return await db.execute(sql, [id]);
    }
};

module.exports = Model3a3;