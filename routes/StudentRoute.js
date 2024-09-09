const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');
const authenticateJWT = require('../middleware/authMiddleware');

router.post('/authentication-v1', studentController.authenticateV1);
router.put('/complete-registration/:numETU/:email', studentController.completeRegistration);
router.post('/login', studentController.loginStudent);

module.exports = router;
