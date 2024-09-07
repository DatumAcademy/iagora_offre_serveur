var { Admin } = require("../models/Admin");
var configuration = require('../configuration/SECRET');
const mongoose = require('mongoose');
var ObjectID = require("mongoose").Types.ObjectId;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.createAdmin = async (adminData) => {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;
    const admin = new Admin(adminData);
    return await admin.save();
};

exports.getAdmins = async (filters, page = 0, pageSize = 10) => {
    const pageNum = Number(page) || 0;
    const pageSizeNum = Number(pageSize) || 10;
    const match = {
        ...(filters.first_name && { first_name: { $regex: filters.first_name, $options: 'i' } }),
        ...(filters.last_name && { last_name: { $regex: filters.last_name, $options: 'i' } }),
        ...(filters.email && { email: { $regex: filters.email, $options: 'i' } })
    };
    const totalResults = await Admin.countDocuments(match);

    let totalPages = Math.floor(totalResults / pageSizeNum);
    if (totalResults % pageSizeNum !== 0) {
        totalPages += 1;
    }

    const admins = await Admin.find(match)
        .skip(pageNum * pageSizeNum)
        .limit(pageSizeNum);

    return {
        totalPages,
        currentPage: pageNum,
        pageSize: pageSizeNum,
        totalResults,
        admins,
    };
};

exports.getAdminById = async (id) => {
    return await Admin.findById(id);
};

exports.updateAdmin = async (id, adminData) => {
    return await Admin.findByIdAndUpdate(id, adminData, { new: true });
};

exports.deleteAdmin = async (id) => {
    return await Admin.findByIdAndDelete(id);
};

exports.loginAdmin = async (email, password) => {
    const admin = await Admin.findOne({ email: email });
    if (!admin) {
        throw new Error('Admin non trouvé');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
        throw new Error('Mot de passe incorrect');
    }

    const token = jwt.sign(
        { id: admin._id, email: admin.email }, 
        configuration.secret,
        { expiresIn: configuration.time }
    );

    return {
        message: 'Authentification réussie',
        token: token,
        admin: {
            id: admin._id,
            first_name: admin.first_name,
            last_name: admin.last_name,
            email: admin.email
        }
    };
};