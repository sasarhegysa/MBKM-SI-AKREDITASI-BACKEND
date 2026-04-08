const db = require('../../config/db');

/**
 * Model untuk Tabel 1.A.4 Beban Kerja DTPR (EWMP)
 * Memenuhi IKU: Engine Kalkulasi & IKT: Optimasi Query
 */
const Model1a4 = {
    /**
     * READ: Mengambil data lengkap dengan perhitungan total SKS
     */
    findAll: async (id_tahun) => {
        const sql = `
            SELECT 
                b.id_beban_kerja,
                p.nama_lengkap AS nama_dtpr,
                -- SKS Pengajaran
                b.sks_ps_sendiri,
                b.sks_ps_lain,
                b.sks_pt_lain,
                -- SKS Penelitian & PKM
                b.sks_penelitian,
                b.sks_pkm,
                -- SKS Manajemen
                COALESCE(t1a1.sks_jabatan, 0) AS sks_manajemen_pt_sendiri, -- OTOMATIS DARI 1.A.1
                b.sks_manajemen_pt_lain,
                -- TOTAL SKS (IKU: Engine Kalkulasi)
                (
                    b.sks_ps_sendiri + b.sks_ps_lain + b.sks_pt_lain + 
                    b.sks_penelitian + b.sks_pkm + 
                    COALESCE(t1a1.sks_jabatan, 0) + b.sks_manajemen_pt_lain
                ) AS total_sks
            FROM 1a4_beban_dtpr b
            JOIN dosen d ON b.id_dosen = d.id_dosen
            JOIN pegawai p ON d.id_pegawai = p.id_pegawai
            LEFT JOIN 1a1_pimpinan_dan_tupoksi t1a1 ON b.id_pimpinan = t1a1.id_pimpinan
            WHERE b.id_tahun = ? AND b.deleted_at IS NULL
            ORDER BY p.nama_lengkap ASC
        `;
        const [rows] = await db.execute(sql, [id_tahun]);
        return rows;
    },

    /**
     * SUMMARY: Menghitung JUMLAH dan RATA-RATA untuk bagian bawah tabel
     */
    getSummary: async (id_tahun) => {
        const sql = `
            SELECT 
                -- JUMLAH (SUM)
                SUM(sks_ps_sendiri) as sum_ps_sendiri,
                SUM(sks_ps_lain) as sum_ps_lain,
                SUM(sks_pt_lain) as sum_pt_lain,
                SUM(sks_penelitian) as sum_penelitian,
                SUM(sks_pkm) as sum_pkm,
                SUM(COALESCE(t1a1.sks_jabatan, 0)) as sum_manajemen_sendiri,
                SUM(sks_manajemen_pt_lain) as sum_manajemen_lain,
                SUM(
                    sks_ps_sendiri + sks_ps_lain + sks_pt_lain + 
                    sks_penelitian + sks_pkm + 
                    COALESCE(t1a1.sks_jabatan, 0) + sks_manajemen_pt_lain
                ) as sum_total,
                -- RATA-RATA (AVG)
                AVG(sks_ps_sendiri) as avg_ps_sendiri,
                AVG(sks_ps_lain) as avg_ps_lain,
                AVG(sks_pt_lain) as avg_pt_lain,
                AVG(sks_penelitian) as avg_penelitian,
                AVG(sks_pkm) as avg_pkm,
                AVG(COALESCE(t1a1.sks_jabatan, 0)) as avg_manajemen_sendiri,
                AVG(sks_manajemen_pt_lain) as avg_manajemen_lain,
                AVG(
                    sks_ps_sendiri + sks_ps_lain + sks_pt_lain + 
                    sks_penelitian + sks_pkm + 
                    COALESCE(t1a1.sks_jabatan, 0) + sks_manajemen_pt_lain
                ) as avg_total
            FROM 1a4_beban_dtpr b
            LEFT JOIN 1a1_pimpinan_dan_tupoksi t1a1 ON b.id_pimpinan = t1a1.id_pimpinan
            WHERE b.id_tahun = ? AND b.deleted_at IS NULL
        `;
        const [rows] = await db.execute(sql, [id_tahun]);
        return rows[0];
    },

// src/models/upps/1a4_beban_dtpr.js

    create: async (data) => {
        try {
            console.log("--- DEBUG START: Simpan 1A4 ---");
            console.log("Data dari Frontend:", data);

            // 1. Cek Dosen
            const [dosen] = await db.execute("SELECT id_pegawai FROM dosen WHERE id_dosen = ?", [data.id_dosen]);
            if (dosen.length === 0) {
                console.log("ERROR: id_dosen tidak ditemukan di tabel dosen");
                throw new Error(`Dosen ID ${data.id_dosen} tidak ada.`);
            }
            const id_pegawai = dosen[0].id_pegawai;
            console.log("ID Pegawai ditemukan:", id_pegawai);

            // 2. Cek Pimpinan (Otomatis)
            const [pimpinan] = await db.execute(
                "SELECT id_pimpinan FROM `1a1_pimpinan_dan_tupoksi` WHERE id_pegawai = ? AND deleted_at IS NULL LIMIT 1", 
                [id_pegawai]
            );
            const id_pimpinan_auto = pimpinan[0] ? pimpinan[0].id_pimpinan : null;
            console.log("ID Pimpinan deteksi otomatis:", id_pimpinan_auto);

            // 3. Insert ke Database
            const sql = `
                INSERT INTO \`1a4_beban_dtpr\` 
                (id_dosen, id_pimpinan, sks_ps_sendiri, sks_ps_lain, sks_pt_lain, 
                sks_penelitian, sks_pkm, sks_manajemen_pt_lain, id_tahun, created_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                data.id_dosen, 
                id_pimpinan_auto, 
                data.sks_ps_sendiri || 0, 
                data.sks_ps_lain || 0, 
                data.sks_pt_lain || 0, 
                data.sks_penelitian || 0, 
                data.sks_pkm || 0, 
                data.sks_manajemen_pt_lain || 0, 
                data.id_tahun || 1, 
                data.created_by || 1
            ];

            console.log("Menjalankan Query INSERT dengan params:", params);
            const result = await db.execute(sql, params);
            console.log("--- DEBUG SUCCESS ---");
            return result;

        } catch (error) {
            console.log("--- DEBUG ERROR DETECTED ---");
            console.error("Pesan Error:", error.message);
            console.error("Stack Trace:", error.stack);
            throw error; // Lempar balik ke controller agar muncul di Postman/Browser
        }
    },

    softDelete: async (id, deleted_by) => {
        const sql = `UPDATE 1a4_beban_dtpr SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id_beban_kerja = ?`;
        return await db.execute(sql, [deleted_by, id]);
    },

    hardDelete: async (id) => {
        const sql = "DELETE FROM `1a4_beban_dtpr` WHERE id_beban_kerja = ?";
        return await db.execute(sql, [id]);
    }
};

module.exports = Model1a4;