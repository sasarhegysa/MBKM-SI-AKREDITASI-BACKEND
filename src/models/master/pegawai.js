const db = require('../../config/db');

class Pegawai {
    // 1. Get All Active Data
    static async getAll() {
        const query = `
            SELECT 
                p.id_pegawai, p.nama_lengkap, p.nikp, p.id_unit, p.id_jabatan_struktural, p.pendidikan_terakhir,
                u.nama_unit,
                j.nama_jabatan AS nama_jabatan_struktural
            FROM pegawai p
            LEFT JOIN unit_kerja u ON p.id_unit = u.id_unit
            LEFT JOIN jabatan_struktural j ON p.id_jabatan_struktural = j.id_jabatan_struktural
            WHERE p.deleted_at IS NULL
            ORDER BY p.id_pegawai ASC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    // 1b. Get All Soft Deleted Data
    static async getDeleted() {
        const query = `
            SELECT 
                p.id_pegawai, p.nama_lengkap, p.nikp, p.id_unit, p.id_jabatan_struktural, p.pendidikan_terakhir,
                p.deleted_at, p.deleted_by,
                u.nama_unit,
                j.nama_jabatan AS nama_jabatan_struktural
            FROM pegawai p
            LEFT JOIN unit_kerja u ON p.id_unit = u.id_unit
            LEFT JOIN jabatan_struktural j ON p.id_jabatan_struktural = j.id_jabatan_struktural
            WHERE p.deleted_at IS NOT NULL
            ORDER BY p.deleted_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    // 2. Get Data by ID
    static async getById(id) {
        const query = `
            SELECT 
                p.id_pegawai, p.nama_lengkap, p.nikp, p.id_unit, p.id_jabatan_struktural, p.pendidikan_terakhir,
                p.deleted_at,
                u.nama_unit,
                j.nama_jabatan AS nama_jabatan_struktural
            FROM pegawai p
            LEFT JOIN unit_kerja u ON p.id_unit = u.id_unit
            LEFT JOIN jabatan_struktural j ON p.id_jabatan_struktural = j.id_jabatan_struktural
            WHERE p.id_pegawai = ? AND p.deleted_at IS NULL
        `;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    // 3. Create Data
    static async create(data) {
        const query = `
            INSERT INTO pegawai 
            (nama_lengkap, nikp, id_unit, id_jabatan_struktural, pendidikan_terakhir) 
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [
            data.nama_lengkap,
            data.nikp || null,
            data.id_unit || null,
            data.id_jabatan_struktural || null,
            data.pendidikan_terakhir || null
        ]);
        return result.insertId;
    }

    // 4. Update Data
    static async update(id, data) {
        const query = `
            UPDATE pegawai 
            SET nama_lengkap = ?, nikp = ?, id_unit = ?, id_jabatan_struktural = ?, pendidikan_terakhir = ?
            WHERE id_pegawai = ? AND deleted_at IS NULL
        `;
        const [result] = await db.query(query, [
            data.nama_lengkap,
            data.nikp || null,
            data.id_unit || null,
            data.id_jabatan_struktural || null,
            data.pendidikan_terakhir || null,
            id
        ]);
        return result.affectedRows;
    }

    // 5. Soft Delete Data
    static async softDelete(id, userId) {
        const query = 'UPDATE pegawai SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ? WHERE id_pegawai = ? AND deleted_at IS NULL';
        const [result] = await db.query(query, [userId, id]);
        return result.affectedRows;
    }

    // 6. Hard Delete Data
    static async hardDelete(id) {
        const query = 'DELETE FROM pegawai WHERE id_pegawai = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows;
    }

    // 7. Restore Data
    static async restore(id) {
        const query = 'UPDATE pegawai SET deleted_at = NULL, deleted_by = NULL WHERE id_pegawai = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows;
    }
}

module.exports = Pegawai;
