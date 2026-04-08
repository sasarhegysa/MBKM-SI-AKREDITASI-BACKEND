const db = require('../../config/db');

/**
 * Model untuk Tabel 1.A.1 Pimpinan dan Tupoksi
 * Memenuhi IKU: Rancangan Skema Database & IKT: Optimasi Query
 */
const Model1a1 = {
    /**
     * Engine Kalkulasi SKS Otomatis
     * Mencari SKS berdasarkan kombinasi Jabatan (Ketua/Staff) + Nama Unit
     * Memenuhi IKU: Engine Kalkulasi Server-Side
     */
    findAutoSks: async (id_pegawai) => {
        const sql = `
            SELECT ms.sks 
            FROM pegawai p
            JOIN unit_kerja uk ON p.id_unit = uk.id_unit
            JOIN jabatan_struktural js ON p.id_jabatan_struktural = js.id_jabatan_struktural
            JOIN master_sks_jabatan ms ON ms.nama_pencarian = CONCAT(js.nama_jabatan, ' ', uk.nama_unit)
            WHERE p.id_pegawai = ?
        `;
        const [rows] = await db.execute(sql, [id_pegawai]);
        return rows[0] ? rows[0].sks : 0.00;
    },

    /**
     * READ: Ambil Semua Data untuk Dashboard & Export Excel
     * Melakukan JOIN ke 4 tabel untuk data lengkap sesuai Instrumen LKPS [cite: 102]
     */
    findAll: async () => {
        const sql = `
            SELECT 
                t.id_pimpinan,
                -- LOGIKA: Jika unit = 'PRODI', gabungkan dengan nama dari tabel prodi.
                -- Jika bukan, tampilkan nama unit aslinya saja.
                IF(uk.nama_unit = 'PRODI', CONCAT('PRODI ', pr.nama_prodi), uk.nama_unit) AS nama_unit_display,
                p.nama_lengkap,
                t.periode_mulai,
                t.periode_selesai,
                p.pendidikan_terakhir,
                jf.nama_jafung,
                t.tupoksi,
                t.sks_jabatan
            FROM 1a1_pimpinan_dan_tupoksi t
            JOIN pegawai p ON t.id_pegawai = p.id_pegawai
            JOIN unit_kerja uk ON p.id_unit = uk.id_unit
            -- Jalur ke tabel prodi melalui tabel dosen
            LEFT JOIN dosen d ON p.id_pegawai = d.id_pegawai
            LEFT JOIN prodi pr ON d.id_prodi = pr.id_prodi
            LEFT JOIN jabatan_fungsional jf ON t.id_jafung = jf.id_jafung
            WHERE t.deleted_at IS NULL
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    /**
     * CREATE: Simpan Data Pimpinan Baru
     * Memenuhi IKU: Integritas Data & Error Handling
     */
    create: async (data) => {
        const sql = `
            INSERT INTO 1a1_pimpinan_dan_tupoksi 
            (id_pegawai, periode_mulai, periode_selesai, tupoksi, sks_jabatan, id_jafung, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            data.id_pegawai, 
            data.periode_mulai, 
            data.periode_selesai, 
            data.tupoksi, 
            data.sks_jabatan, // Nilai hasil snapshot dari findAutoSks
            data.id_jafung, 
            data.created_by
        ];
        return await db.execute(sql, params);
    },

    /**
     * UPDATE: Perbarui Data Pimpinan
     */
    update: async (id, data) => {
        const sql = `
            UPDATE 1a1_pimpinan_dan_tupoksi 
            SET id_pegawai = ?, periode_mulai = ?, periode_selesai = ?, 
                tupoksi = ?, sks_jabatan = ?, id_jafung = ?, updated_by = ?
            WHERE id_pimpinan = ? AND deleted_at IS NULL
        `;
        const params = [
            data.id_pegawai, data.periode_mulai, data.periode_selesai, 
            data.tupoksi, data.sks_jabatan, data.id_jafung, data.updated_by, id
        ];
        return await db.execute(sql, params);
    },

    /**
     * DELETE: Soft Delete (Integritas Data)
     */
    softDelete: async (id, deleted_by) => {
        const sql = `
            UPDATE 1a1_pimpinan_dan_tupoksi 
            SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? 
            WHERE id_pimpinan = ?
        `;
        return await db.execute(sql, [deleted_by, id]);
    },
    
    hardDelete: async (id) => {
        const sql = "DELETE FROM `1a1_pimpinan_dan_tupoksi` WHERE id_pimpinan = ?";
        return await db.execute(sql, [id]);
}
};

module.exports = Model1a1;