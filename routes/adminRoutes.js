const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication"); // Import the auth middleware

const router = express.Router();

// Protect all superadmin routes with authorization middleware
// The "admin" role is required to access these routes
router.use(authorizeRoute("admin"));


// get residecy by admin id
// Get Resdency , Residents , Add ,update delete
// router.get("/residency",getResidencyById)