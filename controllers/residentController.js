const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../models");
const { generateToken } = require('../middlewares/Authentication');
const Resident = db.Resident;
const Flat = db.Flat;


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
  }
};

module.exports = residentController;
