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
    let user, role;

    const superadmin = await Superadmin.findOne({ where: { email } });
    if (superadmin) {
      user = superadmin;
      role = "superAdmin";
    } else {
      const admin = await Admin.findOne({ where: { email } });
      if (admin) {
        user = admin;
        role = "admin";
      } else {
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
          user = resident;
          role = "resident";
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

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
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };

    if (role === "resident" && user.flat) {
      // Extend the response with detailed information if the user is a resident
      response.user.flat = {
        flat_number: user.flat.flat_number,
        number_of_rooms: user.flat.number_of_rooms,
        floor_number: user.flat.floor_number,
        area: user.flat.area,
        description: user.flat.description,
        occupancy_status: user.flat.occupancy_status
      };

      if (user.flat.block) {
        response.user.flat.block = {
          name: user.flat.block.name,
          title: user.flat.block.title,
          total_units: user.flat.block.total_units
        };

        if (user.flat.block.residency) {
          response.user.flat.block.residency = {
            name: user.flat.block.residency.name,
            country: user.flat.block.residency.country,
            state: user.flat.block.residency.state,
            address: user.flat.block.residency.address,
            location: user.flat.block.residency.location,
            total_units: user.flat.block.residency.total_units,
            amenities: user.flat.block.residency.amenities,
            established_date: user.flat.block.residency.established_date,
            maintenance_rate: user.flat.block.residency.maintenance_rate,
            description: user.flat.block.residency.description
          };
        }
      }
    }

    // Send the response with the token
    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
