const Model3a3 = require('../../models/upps/3a3_pengembangan_dtpr');
const ExcelJS = require('exceljs');

const controller3a3 = {
    // Menampilkan data aktif & Stats
    index: async (req, res) => {
        try {
            const id_tahun = parseInt(req.query.id_tahun);
            const data = await Model3a3.findAllRange(id_tahun);
            const stats = await Model3a3.getStats(id_tahun);
            res.status(200).json({ success: true, data, stats });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // Menampilkan isi "Tempat Sampah"
    trash: async (req, res) => {
        try {
            const { id_tahun } = req.query;
            const data = await Model3a3.findAllDeleted(id_tahun);
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    store: async (req, res) => {
        try {
            await Model3a3.create({ ...req.body, created_by: req.user.id_user });
            res.status(201).json({ success: true, message: "Data pengembangan berhasil dicatat" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    update: async (req, res) => {
        try {
            await Model3a3.update(req.params.id, { ...req.body, updated_by: req.user.id_user });
            res.status(200).json({ success: true, message: "Data berhasil diperbarui" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    destroy: async (req, res) => {
        try {
            await Model3a3.softDelete(req.params.id, req.user.id_user);
            res.status(200).json({ success: true, message: "Data dipindahkan ke sampah" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    restore: async (req, res) => {
        try {
            await Model3a3.restore(req.params.id);
            res.status(200).json({ success: true, message: "Data berhasil dipulihkan" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    hardDestroy: async (req, res) => {
        try {
            await Model3a3.hardDelete(req.params.id);
            res.status(200).json({ success: true, message: "Data dihapus permanen dari database" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    exportExcel: async (req, res) => {
        try {
            const targetTS = parseInt(req.query.id_tahun);
            const data = await Model3a3.findAllRange(targetTS);
            const stats = await Model3a3.getStats(targetTS);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('3.A.3');

            // Set Lebar Kolom
            worksheet.columns = [
                { width: 30 }, { width: 25 }, { width: 15 }, // A, B, C (Jenis, Nama DTPR)
                { width: 10 }, { width: 10 }, { width: 10 }, // D, E, F (TS-2, TS-1, TS)
                { width: 30 }                               // G (Link Bukti)
            ];

            // 1. JUDUL UTAMA
            worksheet.mergeCells('A1:G1');
            worksheet.getCell('A1').value = 'Tabel 3.A.3 Pengembangan DTPR di Bidang Penelitian';
            worksheet.getCell('A1').font = { bold: true, size: 12 };
            worksheet.getCell('A1').alignment = { horizontal: 'center' };

            // 2. BARIS HEADER TAHUN (Row 2)
            worksheet.mergeCells('A2:C2');
            worksheet.getCell('A2').value = 'Tahun Akademik';
            worksheet.getCell('D2').value = 'TS-2';
            worksheet.getCell('E2').value = 'TS-1';
            worksheet.getCell('F2').value = 'TS';
            
            // Link Bukti Merged Vertikal
            worksheet.mergeCells('G2:G4');
            worksheet.getCell('G2').value = 'Link Bukti';

            // 3. BARIS JUMLAH DOSEN DTPR (Row 3)
            worksheet.mergeCells('A3:C3');
            worksheet.getCell('A3').value = 'Jumlah Dosen DTPR';
            const statMap = {}; stats.forEach(s => statMap[s.id_tahun] = s.jumlah_dosen);
            worksheet.getCell('D3').value = statMap[targetTS - 2] || 0;
            worksheet.getCell('E3').value = statMap[targetTS - 1] || 0;
            worksheet.getCell('F3').value = statMap[targetTS] || 0;

            // 4. BARIS JUDUL KOLOM (Row 4)
            worksheet.getCell('A4').value = 'Jenis Pengembangan DTPR';
            worksheet.mergeCells('B4:C4');
            worksheet.getCell('B4').value = 'Nama DTPR';
            worksheet.mergeCells('D4:F4');
            worksheet.getCell('D4').value = 'Jumlah';

            // Styling Header (Grey + Borders)
            for (let r = 2; r <= 4; r++) {
                worksheet.getRow(r).eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BFBFBF' } };
                    cell.font = { bold: true };
                    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });
            }

            // 5. ISI DATA (Row 5+)
            data.forEach((item, index) => {
                const currRow = 5 + index;
                
                // Tentukan letak angka 1 berdasarkan id_tahun record
                let ts2 = '', ts1 = '', ts = '';
                if (item.id_tahun == targetTS) ts = 1;
                else if (item.id_tahun == targetTS - 1) ts1 = 1;
                else if (item.id_tahun == targetTS - 2) ts2 = 1;

                worksheet.getRow(currRow).values = [
                    item.jenis_pengembangan, 
                    item.nama_dtpr, 
                    '', // C kosong karena B-C di-merge
                    ts2, ts1, ts, 
                    item.link_bukti
                ];
                
                worksheet.mergeCells(`B${currRow}:C${currRow}`);

                worksheet.getRow(currRow).eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
                    cell.border = { top:{style:'thin'}, left:{style:'thin'}, bottom:{style:'thin'}, right:{style:'thin'} };
                    cell.alignment = { horizontal: 'center' };
                });
            });

            // 6. Keterangan
            const lastRow = 5 + data.length + 1;
            worksheet.mergeCells(`A${lastRow}:G${lastRow}`);
            worksheet.getCell(`A${lastRow}`).value = 'Keterangan: Pengisian data tidak berulang, jika dosen dikirim tugas belajar di tahun TS-3, maka tidak lagi dihitung di TS-2.';
            worksheet.getCell(`A${lastRow}`).font = { italic: true, size: 9 };

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=LKPS_3A3_Fixed.xlsx`);
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) { res.status(500).send(error.message); }
    }
};

module.exports = controller3a3;