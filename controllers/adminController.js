const  db  = require("../models");
const Admin = db.Admin;
const Residency = db.Residency;
const Block = db.Block;
const Flat = db.Flat;
const Resident= db.Resident
const Maintenance = db.Maintenance
exports.getResidencyByAdmin = async (req, res) => {
  try {
    const adminId = req.userId;

    // Find the admin and include the associated residency
    const admin = await Admin.findOne({
      where: { id: adminId },
      include: {
        model: Residency,
        as: "residency", // Use the alias defined in the association
      },
    });

    if (!admin || !admin.residency) {
      return res.status(404).json({ message: "Residency not found for this admin" });
    }

    res.status(200).json(admin.residency);
  } catch (error) {
    console.error("Error fetching residency:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAdminResidentsByResidencyId = async (req, res) => {
  const { residency_id } = req.params; // Get the residency_id from request params
  console.log(residency_id, "Received residency_id");

  try {
    // Step 1: Fetch all residents with their associated flat and block in one query
    const residents = await Resident.findAll({
      include: [
        {
          model: Flat,
          as: "flat",
          include: [
            {
              model: Block,
              as: "block",
              where: { residency_id }, // Filter by residency_id at block level
            }
          ]
        }
      ]
    });

    console.log(residents, "Fetched residents");

    // Step 2: If no residents are found, return 404
    if (!residents || residents.length === 0) {
      return res.status(404).json({
        message: "No residents found for the specified residency."
      });
    }

    // Step 3: Return the residents
    return res.status(200).json({
      message: "Residents fetched successfully",
      residents
    });

  } catch (error) {
    console.error("Error fetching residents:", error);
    return res.status(500).json({
      message: "Error fetching residents",
      error: error.message
    });
  }
};


// Get resident by flat ID
exports.getResidentByFlatId = async (req, res) => {
  try {
    const { flatId } = req.params;

    if (!flatId) {
      return res.status(400).json({ message: "Flat ID is required" });
    }

    // Find the resident by flat_id and include the Flat details
    const resident = await Resident.findAll({
      where: { flat_id: flatId },
      include: [{ model: Flat, as: "flat" }] // Ensures Flat data is populated
    });

    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    res.status(200).json(resident);
  } catch (error) {
    console.error("Error fetching resident:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addMaintenance = async (req, res) => {
  try {
    const { block_id, flat_id, resident_id, year, month } = req.body;

    // Validate required fields
    if (!block_id || !flat_id || !resident_id || !year || !month) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Fetch block details (to get residency_id)
    const block = await Block.findOne({ where: { id: block_id } });
    if (!block) {
      return res.status(404).json({ message: "Block not found." });
    }

    // Fetch residency details (to get maintenance rate)
    const residency = await Residency.findOne({ where: { id: block.residency_id } });
    if (!residency) {
      return res.status(404).json({ message: "Residency not found." });
    }

    const maintenanceRate = residency.maintenance_rate; // Get default maintenance rate

    // Check if maintenance already exists for the same resident, month, and year
    const existingRecord = await Maintenance.findOne({
      where: { resident_id, year, month },
    });

    if (existingRecord) {
      return res.status(400).json({
        message: "Maintenance record already exists for this resident in the selected month and year.",
      });
    }

    // Create new maintenance record
    const newMaintenance = await Maintenance.create({
      block_id,
      flat_id,
      resident_id,
      residency_id: block.residency_id, // Auto-fetch from block data
      year,
      month,
      amount: maintenanceRate, // Use default rate from residency
    });

    return res.status(201).json({
      message: "Maintenance record added successfully.",
      maintenance: newMaintenance,
    });
  } catch (error) {
    console.error("Error adding maintenance record:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};


// const { Maintenance, Resident } = require("../models");


const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

exports.getMaintenanceByResidencyId = async (req, res) => {
  try {
    // const { residency_id } = req.params;

    // if (!residency_id) {
    //   return res.status(400).json({ message: "Residency ID is required." });
    // }

    // // Fetch all maintenance records for the given residency
    // const maintenanceRecords = await Maintenance.findAll({
    //   where: { residency_id },
    //   include: [
    //     {
    //       model: Resident, // Ensure that `Resident` is correctly associated
    //       required: false, // Allow fetching even if no resident is found
    //       attributes: ["id", "name", "email", "phone"],
    //     },
    //   ],
    //   order: [["year", "DESC"]], // Sort by year descending
    // });

    // if (!maintenanceRecords.length) {
    //   return res.status(404).json({ message: "No maintenance records found." });
    // }

    // // Group maintenance data by resident
    // const groupedData = maintenanceRecords.reduce((acc, record) => {
    //   if (!record.resident) return acc; // Skip records without residents

    //   const residentId = record.resident.id;

    //   if (!acc[residentId]) {
    //     acc[residentId] = {
    //       resident: {
    //         id: record.resident.id,
    //         name: record.resident.name,
    //         email: record.resident.email,
    //         phone: record.resident.phone,
    //       },
    //       maintenance: MONTHS.map((month) => ({
    //         month,
    //         amount: 0, // Default amount is 0
    //       })),
    //     };
    //   }

    //   // Update the correct month with actual amount
    //   const monthIndex = acc[residentId].maintenance.findIndex(
    //     (m) => m.month === record.month
    //   );
    //   if (monthIndex !== -1) {
    //     acc[residentId].maintenance[monthIndex].amount = record.amount;
    //   }

    //   return acc;
    // }, {});

    // // Convert the object into an array
    // const result = Object.values(groupedData);

    const result = await Maintenance.findOne({
      where: { residency_id: 1 },
      include: [{ model: Resident, as: "resident" }],
    });
    console.log(test);
    
    return res.status(200).json({
      message: "Maintenance records retrieved successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

