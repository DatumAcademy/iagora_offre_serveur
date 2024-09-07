var { Admin } = require("../models/Admin");
var configuraation = require('../configuration/SECRET');
const mongoose = require('mongoose');
var ObjectID = require("mongoose").Types.ObjectId;

exports.createAdmin = async (adminData) => {
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