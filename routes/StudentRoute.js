const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');

router.post('/authentication-v1', studentController.authenticateV1);
router.put('/complete-registration/:numETU/:email', studentController.completeRegistration);

module.exports = router;
