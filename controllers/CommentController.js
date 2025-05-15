const db = require("../models");
const Comment = db.Comments;
const Complaint = db.Complaint;
const Resident = db.Resident;

const commentController = {
  async addComment(req, res) {
    const { complaint_id, text , resident_id} = req.body;
    // const resident_id = req.userId;
    

    try {
      const complaint = await Complaint.findByPk(complaint_id);
      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      const comment = await Comment.create({
        text,
        complaint_id,
        resident_id: resident_id ?? null,
      });

      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCommentsByComplaint(req, res) {
    const { complaintId } = req.params;
    try {
      const comments = await Comment.findAll({
        where: { complaint_id: complaintId },
        include: [{ model: Resident, as: "resident", attributes: ["name"] }],
      });

      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = commentController;
