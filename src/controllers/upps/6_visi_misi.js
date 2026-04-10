const Model6 = require('../../models/upps/6_visi_misi');
const ExcelJS = require('exceljs');

const controller6 = {
    // Menampilkan data aktif per prodi
    index: async (req, res) => {
        try {
            const { id_prodi } = req.query;
            const data = await Model6.findAll(id_prodi);
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Menampilkan data di tempat sampah
    trash: async (req, res) => {
        try {
            const { id_prodi } = req.query;
            const data = await Model6.findTrash(id_prodi);
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Simpan data baru
    store: async (req, res) => {
        try {
            await Model6.create({ ...req.body, created_by: req.user.id_user });
            res.status(201).json({ success: true, message: "Visi & Misi berhasil disimpan" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Update data
    update: async (req, res) => {
        try {
            await Model6.update(req.params.id, { ...req.body, updated_by: req.user.id_user });
            res.status(200).json({ success: true, message: "Visi & Misi berhasil diperbarui" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Hapus sementara (Soft Delete)
    destroy: async (req, res) => {
        try {
            await Model6.softDelete(req.params.id, req.user.id_user);
            res.status(200).json({ success: true, message: "Data dipindahkan ke tempat sampah" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Pulihkan data
    restore: async (req, res) => {
        try {
            await Model6.restore(req.params.id);
            res.status(200).json({ success: true, message: "Data berhasil dipulihkan" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Hapus permanen
    hardDestroy: async (req, res) => {
        try {
            await Model6.hardDelete(req.params.id);
            res.status(200).json({ success: true, message: "Data dihapus permanen dari database" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    /**
     * EKSPOR EXCEL: Format Stacked (Visi di atas Misi)
     * Sesuai Gambar LKPS yang dilampirkan
     */
    exportExcel: async (req, res) => {
        try {
            const { id_prodi } = req.query;
            const data = await Model6.findAll(id_prodi);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Tabel 6');

            // Set Lebar Kolom agar proporsional
            worksheet.columns = [{ width: 45 }, { width: 45 }, { width: 45 }];

            // 1. Judul Tabel
            worksheet.mergeCells('A1:C1');
            const title = worksheet.getCell('A1');
            title.value = 'Tabel 6. Kesesuaian Visi, Misi';
            title.font = { bold: true, size: 12 };
            title.alignment = { horizontal: 'center' };

            let currentRow = 2;

            data.forEach(item => {
                // --- BARIS VISI ---
                // Header Visi
                const rowHeaderVisi = worksheet.getRow(currentRow);
                rowHeaderVisi.values = ['Visi PT', 'Visi UPPS', 'Visi Keilmuan PS'];
                rowHeaderVisi.eachCell(c => {
                    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
                    c.font = { bold: true };
                    c.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    c.alignment = { horizontal: 'center' };
                });

                // Data Visi (Warna Kuning)
                currentRow++;
                const rowDataVisi = worksheet.getRow(currentRow);
                rowDataVisi.values = [item.visi_pt, item.visi_upps, item.visi_keilmuan_ps];
                rowDataVisi.eachCell(c => {
                    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
                    c.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    c.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                });

                // --- BARIS MISI ---
                // Header Misi
                currentRow++;
                const rowHeaderMisi = worksheet.getRow(currentRow);
                rowHeaderMisi.values = ['Misi PT', 'Misi UPPS', '']; // Kolom 3 kosong di header misi sesuai gambar
                rowHeaderMisi.eachCell(c => {
                    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
                    c.font = { bold: true };
                    c.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    c.alignment = { horizontal: 'center' };
                });

                // Data Misi (Warna Kuning)
                currentRow++;
                const rowDataMisi = worksheet.getRow(currentRow);
                rowDataMisi.values = [item.misi_pt, item.misi_upps, '']; // Misi UPPS sekarang sudah ada nilainya
                rowDataMisi.eachCell(c => {
                    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
                    c.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    c.alignment = { wrapText: true, vertical: 'top', horizontal: 'left' };
                });

                currentRow += 2; // Memberi jarak antar entitas visi-misi jika lebih dari satu
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Tabel_6_Visi_Misi.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) { res.status(500).send(error.message); }
    }
};

module.exports = controller6;