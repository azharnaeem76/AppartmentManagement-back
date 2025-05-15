const express = require("express");
const router = express.Router();
const commentController = require("../controllers/CommentController");
const { authorizeRoute } = require("../middlewares/Authentication");

router.use(authorizeRoute(["resident", "admin"]));

// POST comment
router.post("/", commentController.addComment);

// GET all comments for a complaint
router.get("/:complaintId", commentController.getCommentsByComplaint);

module.exports = router;
