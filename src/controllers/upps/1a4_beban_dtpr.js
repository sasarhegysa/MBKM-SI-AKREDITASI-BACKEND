const Model1a4 = require('../../models/upps/1a4_beban_dtpr');
const ExcelJS = require('exceljs');

/**
 * Controller Tabel 1.A.4 Rata-rata Beban DTPR (EWMP)
 * Memenuhi IKU: Engine Kalkulasi Server-Side
 */
const controller1a4 = {
    // 1. INDEX: Ambil Data & Summary (Jumlah/Rata-rata)
    index: async (req, res) => {
        try {
            const { id_tahun } = req.query; // Filter berdasarkan Tahun Semester (TS)
            if (!id_tahun) return res.status(400).json({ success: false, message: "id_tahun diperlukan" });

            const data = await Model1a4.findAll(id_tahun);
            const summary = await Model1a4.getSummary(id_tahun);

            res.status(200).json({
                success: true,
                message: "Data Beban DTPR Berhasil Diambil",
                data: data,
                summary: summary
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 2. STORE: Tambah Data Beban Kerja
    store: async (req, res) => {
        try {
            const dataToSave = {
                ...req.body,
                created_by: req.user.id_user
            };
            await Model1a4.create(dataToSave);
            res.status(201).json({ success: true, message: "Beban kerja berhasil dicatat" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 3. DESTROY: Soft Delete
    destroy: async (req, res) => {
        try {
            const { id } = req.params;
            await Model1a4.softDelete(id, req.user.id_user);
            res.status(200).json({ success: true, message: "Data berhasil dihapus" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    hardDestroy: async (req, res) => {
        try {
            const { id } = req.params;
            await Model1a4.hardDelete(id);
            res.status(200).json({ success: true, message: "Data beban kerja terhapus dari akar-akarnya!" });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // 4. EXPORT EXCEL: Desain Kompleks dengan Merge & Summary
    exportExcel: async (req, res) => {
        try {
            const { id_tahun } = req.query;
            const data = await Model1a4.findAll(id_tahun);
            const summary = await Model1a4.getSummary(id_tahun);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Tabel 1.A.4');

            // --- A. JUDUL ---
            worksheet.mergeCells('A1:K1');
            worksheet.getCell('A1').value = 'Tabel 1.A.4 Rata-rata Beban DTPR per semester (EWMP) pada TS';
            worksheet.getCell('A1').font = { bold: true, size: 12 };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };

            // --- B. HEADER KOMPLEKS (Baris 2 & 3) ---
            worksheet.mergeCells('A2:A3'); worksheet.getCell('A2').value = 'No.';
            worksheet.mergeCells('B2:B3'); worksheet.getCell('B2').value = 'Nama DTPR';
            worksheet.mergeCells('C2:E2'); worksheet.getCell('C2').value = 'SKS Pengajaran pada';
            worksheet.getCell('C3').value = 'PS Sendiri';
            worksheet.getCell('D3').value = 'PS Lain, PT Sendiri';
            worksheet.getCell('E3').value = 'PT Lain';
            worksheet.mergeCells('F2:F3'); worksheet.getCell('F2').value = 'SKS Penelitian';
            worksheet.mergeCells('G2:G3'); worksheet.getCell('G2').value = 'SKS PKM';
            worksheet.mergeCells('H2:I2'); worksheet.getCell('H2').value = 'SKS Manajemen';
            worksheet.getCell('H3').value = 'PT Sendiri';
            worksheet.getCell('I3').value = 'PT Lain';
            worksheet.mergeCells('J2:J3'); worksheet.getCell('J2').value = 'Total SKS';

            // --- C. ISI DATA ---
            data.forEach((item, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    item.nama_dtpr,
                    item.sks_ps_sendiri,
                    item.sks_ps_lain,
                    item.sks_pt_lain,
                    item.sks_penelitian,
                    item.sks_pkm,
                    item.sks_manajemen_pt_sendiri,
                    item.sks_manajemen_pt_lain,
                    item.total_sks
                ]);
                
                // Style Baris Data (Kuning)
                row.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                });
            });

            // --- D. BARIS JUMLAH & RATA-RATA ---
            const sumRow = worksheet.addRow(['', 'Jumlah *', summary.sum_ps_sendiri, summary.sum_ps_lain, summary.sum_pt_lain, summary.sum_penelitian, summary.sum_pkm, summary.sum_manajemen_sendiri, summary.sum_manajemen_lain, summary.sum_total]);
            const avgRow = worksheet.addRow(['', 'Rata-rata **', summary.avg_ps_sendiri, summary.avg_ps_lain, summary.avg_pt_lain, summary.avg_penelitian, summary.avg_pkm, summary.avg_manajemen_sendiri, summary.avg_manajemen_lain, summary.avg_total]);

            [sumRow, avgRow].forEach(row => {
                row.eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
                    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                });
            });

            // --- E. STYLING HEADER ---
            ['A2','B2','C2','C3','D3','E3','F2','G2','H2','H3','I3','J2'].forEach(ref => {
                const cell = worksheet.getCell(ref);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
                cell.font = { bold: true };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
            });

            // Set Width
            worksheet.getColumn(2).width = 30; // Nama DTPR
            worksheet.getColumn(10).width = 15; // Total

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=Tabel_1A4_EWMP.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = controller1a4;