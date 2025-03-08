const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication");
const complaintController = require("../controllers/complaintController");



const router = express.Router();

// Protect all superadmin routes with authorization middleware
// The "superAdmin" role is required to access these routes
router.use(authorizeRoute("resident"));


router.get("/allComplaints", complaintController.getAllComplaints)




module.exports = router;