const express = require('express');
const { SuperAdminlogin, adminLogin, login } = require('../controllers/authController'); // Import the login function from authController
const residentController = require('../controllers/residentController');
const router = express.Router();

// Login route for Superadmin
router.post('/SuperAdminlogin', SuperAdminlogin);
router.post("/admin/login", adminLogin);

router.post("/resident/login", residentController.login)
router.post("/resident/register", residentController.register)
router.post("/resident/forgotPassword", residentController.forgotPassword)
router.post("/resident/register", residentController.forgotPassword);
router.post('/change-password', residentController.changePassword);
router.post('/deleteAccount', residentController.deleteAccount);

router.post("/login", login);

module.exports = router;
