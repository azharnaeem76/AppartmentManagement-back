const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../models");
const { generateToken } = require('../middlewares/Authentication');
const Resident = db.Resident;
const Residency = db.Residency;
const Block = db.Block;
const Flat = db.Flat;
const Expense = db.Expense;
const UnionMember = db.UnionMember;

const residentController = {
  async register(req, res) {
    const { name, email, password, referral_code } = req.body;
    try {
      // Check if a referral code is provided and find the corresponding flat
      let flat = null;
      if (referral_code) {
        flat = await Flat.findOne({ where: { referral_code } });
        if (!flat) {
          return res.status(404).json({ error: 'Referral code is invalid.' });
        }
      }

      const resident = await Resident.create({
        name,
        email,
        password,
        flat_id: flat ? flat.id : null  // Set flat_id if the flat was found
      });

      res.status(201).json({
        id: resident.id,
        name: resident.name,
        email: resident.email,
        flat: flat
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Email already exists.' });
      } else {
        res.status(500).json({ error: 'Server error.' });
      }
    }
  },

  async login(req, res) {
    const { email, password } = req.body;
    try {
      // Include the flat and its associated block and residency in the query
      const resident = await Resident.findOne({
        where: { email },
        include: [{
          model: Flat,
          as: 'flat',
          include: [{
            model: Block,
            as: 'block',
            include: [{
              model: Residency,
              as: 'residency'
            }]
          }]
        }]
      });

      if (!resident) {
        return res.status(404).json({ error: 'User not found.' });
      }

      console.log(password, 'the password resident password');
      console.log(resident.password, 'the resident password');

      const match = await bcrypt.compare(password, resident.password);
      if (match) {
        const token = generateToken({ id: resident.id, role: 'resident' });  // Assuming role is 'resident', adjust as necessary

        // Include related flat, block, and residency data in the response
        const response = {
          message: 'Login successful',
          token,
          resident: {
            id: resident.id,
            email: resident.email,
            flat: resident.flat ? {
              flat_number: resident.flat.flat_number,
              block: resident.flat.block ? {
                block_name: resident.flat.block.block_name,
                residency: resident.flat.block.residency ? {
                  residency_name: resident.flat.block.residency.residency_name
                } : null
              } : null
            } : null
          }
        };

        res.json(response);
      } else {
        res.status(401).json({ error: 'Invalid password.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong.' });
    }
  },

  async forgotPassword(req, res) {
    res.json({ message: 'If the email is registered, a reset link will be sent.' });
  },

  async changePassword(req, res) {
    const { id, oldPassword, newPassword } = req.body;
    try {
      const resident = await Resident.findByPk(id);
      if (!resident) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const match = await bcrypt.compare(oldPassword, resident.password);
      if (match) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        resident.password = hashedPassword;
        await resident.save();
        res.json({ message: 'Password changed successfully.' });
      } else {
        res.status(401).json({ error: 'Old password is incorrect.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong.' });
    }
  },

  async deleteAccount(req, res) {
    const { id } = req.body;
    console.log("hello")
    try {
      const resident = await Resident.findByPk(id);
      if (!resident) {
        return res.status(404).json({ error: 'User not found.' });
      }

      resident.deletedAt = new Date(); // Assuming your Resident model supports soft deletes
      await resident.save();
      res.json({ message: 'Account deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Something went wrong.' });
    }
  },

  async getMarqueeText(req, res) {
    try {
      const userId = req.userId;
      console.log("User ID:", userId);

      // Step 1: Fetch Resident
      const resident = await Resident.findOne({
        where: { id: userId }
      });

      if (!resident) {
        return res.status(404).json({ error: "User not found." });
      }

      // Step 2: Fetch Flat separately
      let flat = null;
      if (resident.flat_id) {
        flat = await Flat.findOne({
          where: { id: resident.flat_id }
        });
      }

      // Step 3: Fetch Block separately
      let block = null;
      if (flat && flat.block_id) {
        block = await Block.findOne({
          where: { id: flat.block_id }
        });
      }

      // Step 4: Fetch Residency separately
      let residency = null;
      if (block && block.residency_id) {
        residency = await Residency.findOne({
          where: { id: block.residency_id }
        });
      }
      console.log(residency)
      const marqueeText = await db.Announcement.findOne({ where: { residency_id: residency.id, type: "marquee" } });

      // Structuring response
      res.status(200).json({
        marqueeText
      });

    } catch (error) {
      console.error("Error fetching resident:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },
  async getUserBills(req, res) {
    try {
      const userId = req.userId;

      // Step 1: Get the user's residency
      const resident = await db.Resident.findOne({
        where: { id: userId },
        include: {
          model: db.Flat,
          as: "flat",
          include: {
            model: db.Block,
            as: "block",
            include: {
              model: db.Residency,
              as: "residency",
              attributes: ["id", "name"],
            },
          },
        },
      });

      if (!resident || !resident.flat || !resident.flat.block || !resident.flat.block.residency) {
        return res.status(404).json({ error: "User's residency not found." });
      }

      const residencyId = resident.flat.block.residency.id;

      // Step 2: Fetch all bills for the residency
      const bills = await db.Bill.findAll({
        where: { residency_id: residencyId },
        include: {
          model: db.Residency,
          as: "residency",
          attributes: ["name"],
        },
      });

      res.status(200).json({
        message: "User bills retrieved successfully",
        bills,
      });
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  async getUserExpenses(req, res) {
    try {
      const userId = req.userId; // Get user ID from the request
      const { type } = req.body; // Get expense type from request body

      // Validate type
      if (!type || !["finance", "union"].includes(type)) {
        return res.status(400).json({ error: "Invalid expense type. Must be 'finance' or 'union'." });
      }

      // Find the resident (user) with their associated flat and block
      const resident = await Resident.findOne({
        where: { id: userId },
        include: {
          model: Flat,
          as: "flat",
          include: {
            model: Block,
            as: "block",
          },
        },
      });

      // Check if resident exists and has a flat & block
      if (!resident || !resident.flat || !resident.flat.block) {
        return res.status(404).json({ error: "Resident, flat, or block not found." });
      }

      const blockId = resident.flat.block.id; // Get block ID

      // Fetch expenses for the block with the requested type
      const expenses = await Expense.findAll({
        where: { block_id: blockId, type: type },
      });

      return res.status(200).json({
        message: "Expenses retrieved successfully.",
        expenses,
      });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  async getDefaulters(req, res) {
    try {
      const defaulters = await Resident.findAll({
        where: { defaulter: true }, // Fetch only residents marked as defaulters
        include: [
          {
            model: Flat,
            as: "flat",
            attributes: ["flat_number", "floor_number"],
            include: [
              {
                model: Block,
                as: "block",
                attributes: ["name"]
              }
            ]
          }
        ],
        attributes: ["id", "name", "email", "defaulter"], // Resident details
      });

      if (!defaulters.length) {
        return res.status(404).json({ message: "No defaulters found." });
      }

      const result = defaulters.map(defaulter => ({
        ...defaulter.toJSON(),
        dues: 2050
      }));

      res.status(200).json({ message: "Defaulters retrieved successfully", result: result });
    } catch (error) {
      console.error("Error fetching defaulters:", error);
      res.status(500).json({ error: error.message });
    }
  },

  async getUnionContacts(req, res) {
    try {
        const userId = req.userId; // Get user ID from request
        const resident = await Resident.findOne({
            where: { id: userId },
            include: [
                {
                    model: Flat,
                    as: "flat",
                    include: [
                        {
                            model: Block,
                            as: "block",
                            attributes: ["id", "name", "residency_id"]
                        }
                    ]
                }
            ]
        });

        if (!resident || !resident.flat || !resident.flat.block) {
            return res.status(404).json({ message: "User or block not found." });
        }

        const { residency_id } = resident.flat.block;

        const unionContacts = await UnionMember.findAll({
            where: { residency_id },
            attributes: ["name", "designation", "phone", "email"]
        });

        if (!unionContacts.length) {
            return res.status(404).json({ message: "No union contacts found for this block." });
        }

        res.status(200).json({ message: "Union contacts retrieved successfully", result: unionContacts });
    } catch (error) {
        console.error("Error fetching union contacts:", error);
        res.status(500).json({ error: error.message });
    }
}

};

module.exports = residentController;
