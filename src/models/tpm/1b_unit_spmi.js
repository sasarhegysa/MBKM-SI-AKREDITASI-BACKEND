const db = require('../../config/db');

/**
 * Model Tabel 1.B Unit SPMI dan SDM
 * Dikelola oleh TPM (Tim Penjaminan Mutu)
 */
const Model1b = {
    // Menampilkan data aktif berdasarkan tahun
    findAll: async (id_tahun) => {
        const sql = `
            SELECT 
                s.*, 
                u.nama_unit,
                t.nama_tahun
            FROM \`1B_unit_spmi_dan_sdm\` s
            JOIN unit_kerja u ON s.unit_kerja_id_unit = u.id_unit
            JOIN tahun_akademik t ON s.tahun_akademik_id_tahun = t.id_tahun
            WHERE s.tahun_akademik_id_tahun = ? AND s.deleted_at IS NULL
        `;
        const [rows] = await db.execute(sql, [id_tahun]);
        return rows;
    },

    create: async (data) => {
        // Kalkulasi otomatis jumlah_auditor sebelum simpan
        const totalAuditor = (parseInt(data.auditor_certified) || 0) + (parseInt(data.auditor_non_certified) || 0);
        
        const sql = `
            INSERT INTO \`1B_unit_spmi_dan_sdm\` 
            (dokumen_spmi, jumlah_auditor, auditor_certified, auditor_non_certified, 
             frekuensi_audit, bukti_certified_auditor, laporan_audit, 
             unit_kerja_id_unit, tahun_akademik_id_tahun, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await db.execute(sql, [
            data.dokumen_spmi, totalAuditor, data.auditor_certified, data.auditor_non_certified,
            data.frekuensi_audit, data.bukti_certified_auditor, data.laporan_audit,
            data.unit_kerja_id_unit, data.tahun_akademik_id_tahun, data.created_by
        ]);
    },

    update: async (id, data) => {
        const totalAuditor = (parseInt(data.auditor_certified) || 0) + (parseInt(data.auditor_non_certified) || 0);
        
        const sql = `
            UPDATE \`1B_unit_spmi_dan_sdm\` 
            SET dokumen_spmi = ?, jumlah_auditor = ?, auditor_certified = ?, 
                auditor_non_certified = ?, frekuensi_audit = ?, 
                bukti_certified_auditor = ?, laporan_audit = ?, 
                unit_kerja_id_unit = ?, updated_by = ?
            WHERE id_unit_spmi = ?
        `;
        return await db.execute(sql, [
            data.dokumen_spmi, totalAuditor, data.auditor_certified, data.auditor_non_certified,
            data.frekuensi_audit, data.bukti_certified_auditor, data.laporan_audit,
            data.unit_kerja_id_unit, data.updated_by, id
        ]);
    },

    softDelete: async (id, deleted_by) => {
        const sql = "UPDATE `1B_unit_spmi_dan_sdm` SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id_unit_spmi = ?";
        return await db.execute(sql, [deleted_by, id]);
    }
};

module.exports = Model1b;