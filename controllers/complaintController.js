const db = require("../models");

const Complaint = db.Complaint;
const Resident = db.Resident;
const Residency = db.Residency;
const complaintController = {
    // Add a new complaint
    async addComplaint(req, res) {
        const { title, description, resident_id, residency_id } = req.body;
        try {
            const complaint = await Complaint.create({
                title,
                description,
                resident_id,
                residency_id
            });
            res.status(201).json(complaint);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get all complaints
    async getAllComplaints(req, res) {
        try {
            const complaints = await Complaint.findAll({
                include: [
                    {
                        model: Resident,
                        as: 'resident',
                        attributes: ['name', 'email']
                    },
                    {
                        model: Residency,
                        as: 'residency',
                        attributes: ['name']
                    }
                ]
            });
            res.status(200).json(complaints);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getUserComplaints(req, res) {
        try {
            const userId = req.userId;

            const complaints = await Complaint.findAll({
                where: { resident_id: userId }, // Filter complaints by userId
                include: [
                    {
                        model: Resident,
                        as: 'resident',
                        attributes: ['name', 'email']
                    },
                    {
                        model: Residency,
                        as: 'residency',
                        attributes: ['name']
                    }
                ]
            });

            // If no complaints found, return a message
            if (!complaints.length) {
                return res.status(404).json({ message: "No complaints found for this user." });
            }

            res.status(200).json(complaints);
        } catch (error) {
            console.error("Error fetching complaints:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    },

    // Update a complaint
    async updateComplaint(req, res) {
        const { id } = req.params;
        const { title, description, status } = req.body;
        try {
            const complaint = await Complaint.findByPk(id);
            if (!complaint) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            complaint.title = title || complaint.title;
            complaint.description = description || complaint.description;
            complaint.status = status || complaint.status;
            await complaint.save();
            res.status(200).json(complaint);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Delete a complaint
    async deleteComplaint(req, res) {
        const { id } = req.params;
        try {
            const complaint = await Complaint.findByPk(id);
            if (!complaint) {
                return res.status(404).json({ error: 'Complaint not found.' });
            }
            await complaint.destroy();
            res.status(204).json({ message: 'Complaint deleted successfully.' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Mark complaint as resolved
    async markAsResolved(req, res) {
        const { id } = req.params;
        try {
            const complaint = await Complaint.findByPk(id);
            if (!complaint) {
                return res.status(404).json({ error: "Complaint not found." });
            }

            complaint.status = "Resolved";
            await complaint.save();

            res.status(200).json({ message: "Complaint marked as resolved.", complaint });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = complaintController;
