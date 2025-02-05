const bcrypt = require('bcryptjs');
const db = require('../models');
const Superadmin = db.Superadmin;
const Admin = db.Admin;
const Resident = db.Resident
const { generateToken } = require('../middlewares/Authentication'); // Import the generateToken function

// Login controller for Superadmin
exports.SuperAdminlogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the superadmin exists in the database
    const superadmin = await Superadmin.findOne({ where: { email } });

    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found!" });
    }

    // Compare password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, superadmin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }
    
    // Generate a JWT token using the generateToken function
    const token = generateToken({id:superadmin.id, role:'superAdmin'});

    // Send the response with the token
    return res.status(200).json({
      message: "Login successful",
      token, // Send the JWT token to the client
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the admin exists
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = generateToken({ id: admin.id, role: "admin" });

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

/**
 * Unified login function for Superadmin, Admin, and Resident
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Determine the role and model based on the email
    let model, role;

    const superadmin = await Superadmin.findOne({ where: { email } });
    if (superadmin) {
      model = Superadmin;
      role = "superAdmin";
    } else {
      const admin = await Admin.findOne({ where: { email } });
      if (admin) {
        model = Admin;
        role = "admin";
      } else {
        const resident = await Resident.findOne({ where: { email } });
        if (resident) {
          model = Resident;
          role = "resident";
        }
      }
    }

    if (!model) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Find the user by email
    const user = await model.findOne({ where: { email } });

    // Compare password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Generate a JWT token
    const token = generateToken({ id: user.id, role });

    // Send the response with the token
    return res.status(200).json({
      message: "Login successful",
      token,
      role,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
