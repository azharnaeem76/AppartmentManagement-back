const express = require('express');
const { SuperAdminlogin, adminLogin, login } = require('../controllers/authController'); // Import the login function from authController
const router = express.Router();

// Login route for Superadmin
router.post('/SuperAdminlogin', SuperAdminlogin);
router.post("/admin/login", adminLogin);
router.post("/login", login);
module.exports = router;
