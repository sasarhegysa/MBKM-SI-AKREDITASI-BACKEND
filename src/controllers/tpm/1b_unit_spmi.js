const Model1b = require('../../models/tpm/1b_unit_spmi');

const controller1b = {
    index: async (req, res) => {
        try {
            const { id_tahun } = req.query;
            const data = await Model1b.findAll(id_tahun);
            res.status(200).json({ success: true, data });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    store: async (req, res) => {
        try {
            await Model1b.create({ ...req.body, created_by: req.user.id_user });
            res.status(201).json({ success: true, message: "Data SPMI berhasil disimpan" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    update: async (req, res) => {
        try {
            await Model1b.update(req.params.id, { ...req.body, updated_by: req.user.id_user });
            res.status(200).json({ success: true, message: "Data SPMI berhasil diperbarui" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    destroy: async (req, res) => {
        try {
            await Model1b.softDelete(req.params.id, req.user.id_user);
            res.status(200).json({ success: true, message: "Data dipindahkan ke sampah" });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    }
};

module.exports = controller1b;