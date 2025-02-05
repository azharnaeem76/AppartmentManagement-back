const db = require("../models");
const Residency = db.Residency;
const Superadmin = db.Superadmin;
const Admin = db.Admin;
const House = db.House;
const Resident = db.Resident;
const Block = db.Block;
const Flat = db.Flat;
const bcrypt = require("bcryptjs");

// Create a new Residency
exports.createResidency = async (req, res) => {
  try {
    const { name, country, state, address, location, total_units, amenities, established_date, maintenance_rate, description } = req.body;

    console.log(req.user)
    // Get the Superadmin ID from the request (you might pass this in a JWT or session)
    const createdBy = req.userId; // Assuming user is authenticated and Superadmin info is in `req.user`

    // Create a new residency
    const residency = await Residency.create({
      name,
      country,
      state,
      address,
      location,
      total_units,
      amenities,
      established_date,
      maintenance_rate,
      description,
      created_by: createdBy,
    });

    return res.status(201).json({ message: "Residency created successfully", residency });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating residency", error: error.message });
  }
};

// Get all Residencies for the Superadmin
exports.getAllResidencies = async (req, res) => {
  try {
    const residencies = await Residency.findAll({
      where: { created_by: req.userId }, // Ensure only superadmin's residencies are shown
      include: [{ model: db.Admin, as: 'admins' }, { model: db.Block, as: 'blocks' }, { model: db.House, as: 'houses' }],
    });

    return res.status(200).json(residencies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching residencies", error: error.message });
  }
};

// Get a single Residency by ID
exports.getResidencyById = async (req, res) => {
  const { residencyId } = req.params;

  try {
    const residency = await Residency.findOne({
      where: { id: residencyId, created_by: req.userId }, // Only superadmin's residency
      include: [
        { model: db.Admin, as: 'admins' },
        { model: db.Block, as: 'blocks' },
        { model: db.House, as: 'houses' },
        { model: db.House, as: 'houses' },
      ],
    });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    return res.status(200).json(residency);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching residency", error: error.message });
  }
};


// Get residents by Residency ID
exports.getResidentsByResidencyId = async (req, res) => {
  const { residencyId } = req.params;

  try {
    // Fetch residents with associated house and flat details
    const residents = await db.Resident.findAll({
      include: [
        {
          model: db.House,
          as: 'house',
          where: { residency_id: residencyId }, // Match residents in houses within the residency
          required: false, // Allow residents not associated with a house
        },
        {
          model: db.Flat,
          as: 'flat',
          include: [
            {
              model: db.Block,
              as: 'block',
              where: { residency_id: residencyId }, // Match flats within blocks belonging to the residency
              required: true,
            },
          ],
          required: false, // Allow residents not associated with a flat
        },
      ],
    });

    // Check if any residents were found
    if (!residents || residents.length === 0) {
      return res.status(404).json({ message: "No residents found for this residency." });
    }

    // Return the list of residents
    return res.status(200).json(residents);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching residents", error: error.message });
  }
};

// exports.getResidencyById = async (req, res) => {
//   const { residencyId } = req.params;

//   try {
//     // Fetch residency details with related models (excluding residents here)
//     const residency = await Residency.findOne({
//       where: { id: residencyId, created_by: req.userId },
//       include: [
//         { model: db.Admin, as: 'admins' },
//         { model: db.Block, as: 'blocks' },
//         { model: db.House, as: 'houses' },
//         { model: db.UnionMember, as: 'unionMembers' },
//       ],
//     });

//     if (!residency) {
//       return res.status(404).json({ message: "Residency not found" });
//     }

//     // Fetch residents separately with associated house/block details
//     const residents = await db.Resident.findAll({
//       include: [
//         {
//           model: db.House,
//           as: 'house',
//           where: { residency_id: residencyId }, // Only include houses from this residency
//           required: false,
//         },
//         {
//           model: db.Flat,
//           as: 'flat',
//           include: [
//             {
//               model: db.Block,
//               as: 'block',
//               where: { residency_id: residencyId }, // Ensure the flat's block belongs to the residency
//               required: true,
//             },
//           ],
//           required: false,
//         },
//       ],
//     });

//     // Attach residents to the residency object
//     residency.dataValues.residents = residents;

//     // Return the updated residency object
//     return res.status(200).json(residency);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Error fetching residency", error: error.message });
//   }
// };


// Update a Residency by ID
exports.updateResidency = async (req, res) => {
  const { residencyId } = req.params;
  const { name, country, state, address, location, total_units, amenities, established_date, maintenance_rate, description } = req.body;

  try {
    const residency = await Residency.findOne({ where: { id: residencyId, created_by: req.userId } });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    // Update residency data
    residency.name = name || residency.name;
    residency.country = country || residency.country;
    residency.state = state || residency.state;
    residency.address = address || residency.address;
    residency.location = location || residency.location;
    residency.total_units = total_units || residency.total_units;
    residency.amenities = amenities || residency.amenities;
    residency.established_date = established_date || residency.established_date;
    residency.maintenance_rate = maintenance_rate || residency.maintenance_rate;
    residency.description = description || residency.description;

    await residency.save();

    return res.status(200).json({ message: "Residency updated successfully", residency });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating residency", error: error.message });
  }
};

// Delete a Residency by ID
exports.deleteResidency = async (req, res) => {
  const { residencyId } = req.params;

  try {
    const residency = await Residency.findOne({ where: { id: residencyId, created_by: req.userId } });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    // Delete residency
    await residency.destroy();

    return res.status(200).json({ message: "Residency deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting residency", error: error.message });
  }
};

// Add an Admin to a Residency
exports.addAdminToResidency = async (req, res) => {
  try {
    const { residencyId } = req.params; // Residency ID from the route parameter
    const { name, email, password } = req.body; // Admin details from the request body

    // Ensure the residency exists and was created by the authenticated Superadmin
    const residency = await Residency.findOne({
      where: { id: residencyId, created_by: req.userId },
    });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found or not authorized" });
    }

    // Check if an admin with the provided email already exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin with this email already exists" });
    }

    // Create the new admin
    // const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing
    const admin = await Admin.create({
      name,
      email,
      password: password,
      residency_id: residency.id,
    });

    return res.status(201).json({ message: "Admin added successfully", admin });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding admin to residency", error: error.message });
  }
};
exports.removeAdminFromResidency = async (req, res) => {
  try {
    const { residencyId, adminId } = req.params; // Residency ID and Admin ID from the route parameters

    // Ensure the residency exists and was created by the authenticated Superadmin
    const residency = await Residency.findOne({
      where: { id: residencyId, created_by: req.userId },
    });

    if (!residency) {
      return res.status(404).json({ message: "Residency not found or not authorized" });
    }

    // Check if the admin exists and is linked to the specified residency
    const admin = await Admin.findOne({
      where: { id: adminId, residency_id: residency.id },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found in this residency" });
    }

    // Delete the admin
    await admin.destroy();

    return res.status(200).json({ message: "Admin removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error removing admin from residency", error: error.message });
  }
};

exports.removeAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await db.Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await admin.destroy();
    return res.status(200).json({ message: "Admin removed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error removing admin", error: error.message });
  }
};


// Blocks
exports.addBlock = async (req, res) => {
  try {
    const { residencyId } = req.params;
    const { name, title, total_units, number_of_floors, number_of_flats_per_floor, total_area, amenities, description } = req.body;

    const residency = await Residency.findByPk(residencyId);

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    const block = await Block.create({
      name,
      title,
      total_units,
      number_of_floors,
      number_of_flats_per_floor,
      total_area,
      amenities,
      description,
      residency_id: residency.id,
    });

    res.status(201).json({ message: "Block added successfully", block });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding block", error: error.message });
  }
};

exports.getBlocks = async (req, res) => {
  const { residencyId } = req.params;

  try {
    const blocks = await Block.findAll({
      where: { residency_id: residencyId },
      include: [{ model: Flat }],
    });

    res.status(200).json(blocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching blocks", error: error.message });
  }
};

exports.deleteBlock = async (req, res) => {
  const { blockId } = req.params;

  try {
    const block = await Block.findByPk(blockId);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    await block.destroy();
    res.status(200).json({ message: "Block deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting block", error: error.message });
  }
};

// Flats
exports.addFlat = async (req, res) => {
  try {
    const { blockId } = req.params;
    const { flat_number, occupancy_status, number_of_rooms, size, amenities } = req.body;

    const block = await Block.findByPk(blockId);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    const flat = await Flat.create({
      flat_number,
      occupancy_status,
      number_of_rooms,
      size,
      amenities,
      block_id: block.id,
    });

    res.status(201).json({ message: "Flat added successfully", flat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding flat", error: error.message });
  }
};

exports.getFlats = async (req, res) => {
  const { blockId } = req.params;

  try {
    const flats = await Flat.findAll({
      where: { block_id: blockId },
      include: [{ model: Resident }],
    });

    res.status(200).json(flats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching flats", error: error.message });
  }
};

exports.deleteFlat = async (req, res) => {
  const { flatId } = req.params;

  try {
    const flat = await Flat.findByPk(flatId);

    if (!flat) {
      return res.status(404).json({ message: "Flat not found" });
    }

    await flat.destroy();
    res.status(200).json({ message: "Flat deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting flat", error: error.message });
  }
};


// House
exports.addHouse = async (req, res) => {
  try {
    const { residencyId } = req.params;
    const { house_number, occupancy_status, number_of_floors, number_of_rooms, size, amenities } = req.body;

    const residency = await Residency.findByPk(residencyId);

    if (!residency) {
      return res.status(404).json({ message: "Residency not found" });
    }

    const house = await House.create({
      house_number,
      occupancy_status,
      number_of_floors,
      number_of_rooms,
      size,
      amenities,
      residency_id: residency.id,
    });

    res.status(201).json({ message: "House added successfully", house });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding house", error: error.message });
  }
};

exports.getHouses = async (req, res) => {
  const { residencyId } = req.params;

  try {
    const houses = await db.House.findAll({
      where: { residency_id: residencyId },
      include: [{ model: Resident }],
    });

    res.status(200).json(houses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching houses", error: error.message });
  }
};

exports.deleteHouse = async (req, res) => {
  const { houseId } = req.params;

  try {
    const house = await House.findByPk(houseId);

    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    await house.destroy();
    res.status(200).json({ message: "House deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting house", error: error.message });
  }
};
