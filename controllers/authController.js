const bcrypt = require('bcryptjs');
const db = require('../models');
const Superadmin = db.Superadmin;
const Admin = db.Admin;
const Resident = db.Resident
const Flat = db.Flat
const Block  = db.Block;
const Residency = db.Residency
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
        // Fetch resident along with flat, block, and residency details if they exist
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
        if (resident) {
          model = Resident;
          role = "resident";
        }
      }
    }

    if (!model) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Find the user by email, considering the model could have been fetched already
    const user = model === Resident ? resident : await model.findOne({ where: { email } });

    // Compare password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Generate a JWT token
    const token = generateToken({ id: user.id, role });

    // Prepare the response based on user role
    const response = {
      message: "Login successful",
      token,
      role,
      user: { id: user.id, name: user.name, email: user.email }
    };

    if (role === "resident") {
      // Extend the response with structured resident data if the user is a resident
      response.user.flat = user.flat ? {
        flat_number: user.flat.flat_number,
        block: user.flat.block ? {
          block_name: user.flat.block.block_name,
          residency: user.flat.block.residency ? {
            residency_name: user.flat.block.residency.residency_name
          } : null
        } : null
      } : null;
    }

    // Send the response with the token
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
