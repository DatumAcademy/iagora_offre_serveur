const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');

router.post('/authentication-v1', studentController.authenticateV1);

module.exports = router;
