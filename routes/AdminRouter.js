const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/', adminController.createAdmin);
router.get('/search',authenticateJWT, adminController.getAdmins);
router.get('/:id',authenticateJWT, adminController.getAdminById);
router.put('/:id',authenticateJWT, adminController.updateAdmin);
router.delete('/:id',authenticateJWT, adminController.deleteAdmin);
router.post('/login', adminController.loginAdmin);

module.exports = router;
