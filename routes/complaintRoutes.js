const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication");
const complaintController = require("../controllers/complaintController");

const router = express.Router();

// Protect all routes with authorization middleware
// Assuming the "resident" role is required to access these routes
router.use(authorizeRoute(["resident","admin"]));

// Route to get all complaints
router.get("/", complaintController.getAllComplaints);

router.get("/me", complaintController.getUserComplaints)
// Route to add a new complaint
router.post("/", complaintController.addComplaint);

// Route to update an existing complaint
router.put("/:id", complaintController.updateComplaint);

// Route to delete an existing complaint
router.delete("/:id", complaintController.deleteComplaint);

// Route to mark a complaint as resolved
router.put("/:id/resolve", complaintController.markAsResolved);




module.exports = router;
