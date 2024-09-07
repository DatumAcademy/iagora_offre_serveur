const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

router.post('/', adminController.createAdmin);
router.get('/search', adminController.getAdmins);
router.get('/:id', adminController.getAdminById);
router.put('/:id', adminController.updateAdmin);
router.delete('/:id', adminController.deleteAdmin);

module.exports = router;
