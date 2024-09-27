const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');

router.get('/generatePDF/CV/:numETU/:email', studentController.generateAndDownloadCV);
router.get('/download/CV/:filename', studentController.telechargerCV);

module.exports = router;
