const Model1a1 = require('../../models/upps/1a1_pimpinan_dan_tupoksi');
const ExcelJS = require('exceljs');

/**
 * Controller untuk Tabel 1.A.1 Pimpinan dan Tupoksi
 * Memenuhi IKU: RESTful API & Engine Kalkulasi
 */
const controller1a1 = {
    // 1. READ: Ambil semua data pimpinan
    index: async (req, res) => {
        try {
            const data = await Model1a1.findAll();
            res.status(200).json({
                success: true,
                message: "Data Tabel 1.A.1 Berhasil Diambil",
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
        }
    },

    // 2. CREATE: Simpan data dengan auto-SKS
    store: async (req, res) => {
        try {
            const { id_pegawai, periode_mulai, periode_selesai, tupoksi, id_jafung } = req.body;

            // Engine Kalkulasi: Cari pakem SKS secara otomatis berdasarkan Jabatan + Unit
            const autoSks = await Model1a1.findAutoSks(id_pegawai);

            const dataToSave = {
                id_pegawai,
                periode_mulai,
                periode_selesai,
                tupoksi,
                sks_jabatan: autoSks, // Hasil snapshot otomatis
                id_jafung,
                created_by: req.user.id_user // Diambil dari JWT Token
            };

            await Model1a1.create(dataToSave);
            res.status(201).json({
                success: true,
                message: "Data Pimpinan berhasil ditambahkan",
                detail: `SKS Jabatan otomatis terdeteksi: ${autoSks}`
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Gagal menyimpan data" });
        }
    },

    // 3. UPDATE: Perbarui data (Termasuk hitung ulang SKS jika id_pegawai berubah)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { id_pegawai } = req.body;

            // Hitung ulang SKS untuk memastikan integritas data jika pegawai berubah
            const autoSks = await Model1a1.findAutoSks(id_pegawai);

            const dataToUpdate = {
                ...req.body,
                sks_jabatan: autoSks,
                updated_by: req.user.id_user
            };

            await Model1a1.update(id, dataToUpdate);
            res.status(200).json({ success: true, message: "Data berhasil diperbarui" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. DELETE: Soft Delete data pimpinan
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            await Model1a1.softDelete(id, req.user.id_user);
            res.status(200).json({ success: true, message: "Data berhasil dihapus (Soft Delete)" });
        } catch (error) {
            res.status(500).json({ success: false, message: "Gagal menghapus data" });
        }
    },

    hardDestroy: async (req, res) => {
        try {
            const { id } = req.params;
            await Model1a1.hardDelete(id);
            res.status(200).json({ success: true, message: "Data pimpinan hangus permanen!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    exportExcel: async (req, res) => {
        try {
            const data = await Model1a1.findAll();
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Tabel 1.A.1');

            // 1. TAMBAHKAN JUDUL (Baris 1)
            worksheet.mergeCells('A1:F1');
            const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = 'Tabel 1.A.1 Tabel Pimpinan dan Tupoksi UPPS dan PS';
            titleRow.getCell(1).font = { bold: true, size: 12 };
            titleRow.getCell(1).alignment = { horizontal: 'center' };

            // 2. DEFINISI HEADER (Baris 2)
            // Kita set kolom dulu, tapi headernya nanti kita timpa manual buat styling
            worksheet.getRow(2).values = ['Unit Kerja', 'Nama Ketua', 'Periode Jabatan', 'Pendidikan Terakhir', 'Jabatan Fungsional', 'Tugas Pokok dan Fungsi'];
            
            worksheet.columns = [
                { key: 'nama_unit', width: 20 },
                { key: 'nama_lengkap', width: 30 },
                { key: 'periode', width: 20 },
                { key: 'pendidikan_terakhir', width: 20 },
                { key: 'nama_jafung', width: 25 },
                { key: 'tupoksi', width: 50 }
            ];

            // 3. TAMBAHKAN DATA (Mulai Baris 3)
            data.forEach(item => {
                worksheet.addRow({
                    nama_unit: item.nama_unit_display,
                    nama_lengkap: item.nama_lengkap,
                    periode: `${item.periode_mulai} - ${item.periode_selesai}`,
                    pendidikan_terakhir: item.pendidikan_terakhir,
                    nama_jafung: item.nama_jafung || '-',
                    tupoksi: item.tupoksi
                });
            });

            // 4. STYLING SESUAI GAMBAR
            
            // --- Style Header (Baris 2) --- Warna Abu-abu
            const headerRow = worksheet.getRow(2);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } }; // Abu-abu gelap sesuai gambar
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            });

            // --- Style Body (Baris 3 dst) --- Warna Kuning
            worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber > 2) { // Melewati Judul dan Header
                    row.eachCell((cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } }; // KUNING MENYALA BOS
                        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        cell.border = {
                            top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                        };
                    });
                }
            });

            // 5. TAMBAHKAN KETERANGAN (Di baris paling bawah)
            const lastRow = worksheet.lastRow.number + 1;
            worksheet.mergeCells(`A${lastRow}:F${lastRow}`);
            const footerRow = worksheet.getRow(lastRow);
            footerRow.getCell(1).value = 'Keterangan: Data yang ditulis dalam tabel ini termasuk Unit Penjaminan Mutu';
            footerRow.getCell(1).font = { italic: false, size: 10 };
            footerRow.getCell(1).alignment = { horizontal: 'left' };

            // 6. PROSES DOWNLOAD
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Tabel_1A1_Pimpinan.xlsx');
            
            await workbook.xlsx.write(res);
            res.end();

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Gagal ekspor ke Excel" });
        }
    }
};

module.exports = controller1a1;