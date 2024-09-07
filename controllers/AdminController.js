const adminService = require('../services/AdminRepository');

exports.createAdmin = async (req, res) => {
    try {
        const admin = await adminService.createAdmin(req.body);
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAdmins = async (req, res) => {
    try {
        const { page, pageSize, first_name, last_name, email } = req.query;
        const filters = { first_name, last_name, email };
        const result = await adminService.getAdmins(filters, page, pageSize);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAdminById = async (req, res) => {
    try {
        const admin = await adminService.getAdminById(req.params.id);
        if (!admin) {
            res.status(404).json({ message: 'Administrateur non trouvé!' });
        } else {
            res.status(200).json(admin);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const updatedAdmin = await adminService.updateAdmin(req.params.id, req.body);
        if (!updatedAdmin) {
            res.status(404).json({ message: 'Administrateur non trouvé!' });
        } else {
            res.status(200).json(updatedAdmin);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        const deletedAdmin = await adminService.deleteAdmin(req.params.id);
        if (!deletedAdmin) {
            res.status(404).json({ message: 'Administrateur non trouvé!' });
        } else {
            res.status(200).json({ message: 'Administrateur supprimé avec succés!' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
