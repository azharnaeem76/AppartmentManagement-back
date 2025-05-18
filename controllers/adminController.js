const  db  = require("../models");
const Admin = db.Admin;
const Residency = db.Residency;
const Block = db.Block;
const Flat = db.Flat;
const Resident= db.Resident
const Maintenance = db.Maintenance
const Expense =db.Expense;
const Bill = db.Bill;
const Employee = db.Employee;
const Fund = db.Funds;
exports.getResidencyByAdmin = async (req, res) => {
  try {
    const adminId = req.userId;

    // Find the admin and include the associated residency
    const admin = await Admin.findOne({
      where: { id: adminId },
      include: {
        model: Residency,
        as: "residency",
      },
    });

    if (!admin || !admin.residency) {
      return res.status(200).json([]); // Return empty array instead of 404
    }

    res.status(200).json([admin.residency]); // Wrap in array
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
          required: true, 
          include: [
            {
              model: Block,
              as: "block",
              required: true, 
              where: { residency_id },
            }
          ]
        }
      ]
    });
    

    console.log(residents, "Fetched residents");

    // Step 2: If no residents are found, return 404
    if (!residents || residents.length === 0) {
      return res.status(200).json({
        message: "No residents found for the specified residency.",
        residents
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
    const residency_id = req.params.residency_id;

    if (!residency_id) {
      return res.status(400).json({ message: "Residency ID is required." });
    }

    const maintenanceRecords = await Maintenance.findAll({
      where: { residency_id },
      include: [
        {
          model: Block,
          as: "block",
          attributes: ["id", "name"]
        },
        {
          model: Flat,
          as: "flat",
          attributes: ["id", "flat_number"]
        },
        {
          model: Resident,
          as: "resident",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["year", "DESC"], ["month", "DESC"]]
    });
    


    return res.status(200).json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};


exports.getMaintenanceByResidencyIdAndFlatId = async (req, res) => {
  try {
    const { residency_id, flat_id } = req.params;

    // Check if both residency_id and flat_id are provided
    if (!residency_id || !flat_id) {
      return res.status(400).json({ message: "Residency ID and Flat ID are required." });
    }

    // Query maintenance records where both residency_id and flat_id match
    const maintenanceRecords = await Maintenance.findAll({
      where: {
        residency_id,
        flat_id 
      },
      include: [
        {
          model: Block,
          as: "block",
          attributes: ["id", "name"]
        },
        {
          model: Flat,
          as: "flat",
          attributes: ["id", "flat_number"]
        },
        {
          model: Resident,
          as: "resident",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["year", "DESC"], ["month", "DESC"]]
    });

    // If no records are found
    if (maintenanceRecords.length === 0) {
      return res.status(404).json({ message: "No maintenance records found for the specified residency and flat." });
    }

    // Return the maintenance records
    return res.status(200).json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

exports.getMaintenanceByBlockAndFlat = async (req, res) => {
  try {
    const { residency_id, block_id, flat_id } = req.params;

    if (!residency_id || !block_id || !flat_id) {
      return res.status(400).json({ message: "Residency ID, Block ID, and Flat ID are required." });
    }

    // Fetch maintenance records for the specific residency, block, and flat
    const maintenanceRecords = await Maintenance.findAll({
      where: { 
        residency_id,
        block_id,
        flat_id
      },
      include: [
        {
          model: Block,
          as: "block",
          attributes: ["id", "name"]
        },
        {
          model: Flat,
          as: "flat",
          attributes: ["id", "flat_number"]
        },
        {
          model: Resident,
          as: "resident",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["year", "DESC"], ["month", "DESC"]] // Sorting records by year and month
    });

    if (maintenanceRecords.length === 0) {
      return res.status(404).json({ message: "No maintenance records found for the specified block and flat." });
    }

    return res.status(200).json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};

exports.getMaintenanceByBlock = async (req, res) => {
  try {
    const { residency_id, block_id } = req.params;

    if (!residency_id || !block_id) {
      return res.status(400).json({ message: "Residency ID and Block ID are required." });
    }

    // Fetch maintenance records for the specific residency and block
    const maintenanceRecords = await Maintenance.findAll({
      where: { 
        residency_id,
        block_id
      },
      include: [
        {
          model: Block,
          as: "block",
          attributes: ["id", "name"]
        },
        {
          model: Flat,
          as: "flat",
          attributes: ["id", "flat_number"]
        },
        {
          model: Resident,
          as: "resident",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["year", "DESC"], ["month", "DESC"]] // Sorting records by year and month
    });

    if (maintenanceRecords.length === 0) {
      return res.status(404).json({ message: "No maintenance records found for the specified block." });
    }

    return res.status(200).json({ maintenance: maintenanceRecords });
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return res.status(500).json({ message: "Internal server error.", error });
  }
};




exports.getDefaultersByResidencyId = async (req, res) => {
  const { residency_id } = req.params;

  try {
    // Step 1: Fetch all residents for the given residency_id
    const residents = await Resident.findAll({
      include: [
        {
          model: Flat,
          as: "flat",
          attributes: ["id", "flat_number"], // Include flat_id and flat_number
          include: [
            {
              model: Block,
              as: "block",
              attributes: ["id", "name"], // Include block_id and name
              include: [
                {
                  model: Residency,
                  as: "residency",
                  where: { id: residency_id },
                  attributes: ["id", "maintenance_rate"],
                },
              ],
            },
          ],
        },
        {
          model: Maintenance,
          as: "maintenance", // Include all maintenance records
        },
      ],
    });

    if (!residents || residents.length === 0) {
      return res.status(404).json({
        message: "No residents found for the specified residency.",
      });
    }

    // Step 2: Process each resident to determine defaulters
    const defaulters = [];
    const maintenanceRate = residents[0]?.flat?.block?.residency?.maintenance_rate;

    // Check if maintenance_rate exists
    if (!maintenanceRate) {
      return res.status(500).json({
        message: "Maintenance rate not found for the specified residency.",
      });
    }

    for (const resident of residents) {
      const assignedDate = new Date(resident.assigned_date);
      const currentDate = new Date(); // Use current date as the end point

      // Generate list of months from assigned_date to current date
      const months = [];
      let date = new Date(assignedDate.getFullYear(), assignedDate.getMonth(), 1);
      while (date <= currentDate) {
        months.push(new Date(date));
        date.setMonth(date.getMonth() + 1);
      }

      // Fetch maintenance records for this resident
      const maintenanceRecords = resident.maintenance || [];
      const maintenanceMonths = maintenanceRecords.map((record) =>
        new Date(record.createdAt || record.date).getFullYear() * 12 + new Date(record.createdAt || record.date).getMonth()
      ); // Convert to a comparable number (year * 12 + month)

      // Check for missing maintenance records
      let missingMonths = 0;
      for (const month of months) {
        const monthKey = month.getFullYear() * 12 + month.getMonth();
        if (!maintenanceMonths.includes(monthKey)) {
          missingMonths++;
        }
      }

      // If there are missing months, mark as defaulter and include flat/block details
      if (missingMonths > 0) {
        const totalDues = missingMonths * maintenanceRate;
        defaulters.push({
          residentId: resident.id,
          email: resident.email,
          name: resident.name || "Unknown", // Adjust based on your Resident model fields
          assignedDate: resident.assigned_date,
          flatId: resident.flat?.id,
          flatNumber: resident.flat?.flat_number,
          blockId: resident.flat?.block?.id,
          blockName: resident.flat?.block?.name,
          missingMonths,
          totalDues,
        });
      }
    }

    if (defaulters.length === 0) {
      return res.status(200).json({
        message: "No defaulters found for the specified residency.",
      });
    }

    return res.status(200).json({
      message: "Defaulters fetched successfully.",
      defaulters,
    });
  } catch (error) {
    console.error("Error fetching defaulters:", error);
    return res.status(500).json({
      message: "Error fetching defaulters",
      error: error.message,
    });
  }
};






// Get all expenses from both Expense and Bill models
exports.getExpenses = async (req, res) => {
  const { type, status, startDate, endDate, blockId, residencyId } = req.query;

  try {
    // Filters for querying expenses
    const expenseFilters = {
      where: {},
      include: [],
    };

    if (type) {
      expenseFilters.where.type = type;
    }

    if (status) {
      expenseFilters.where.status = status;
    }

    if (startDate && endDate) {
      expenseFilters.where.due_date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (blockId) {
      expenseFilters.where.block_id = blockId;
    }

    if (residencyId) {
      expenseFilters.include.push({
        model: Residency,
        where: { id: residencyId },
        attributes: [],
      });
    }

    // Fetch expenses from both Expense and Bill models
    const expenses = await Promise.all([
      Expense.findAll(expenseFilters),
      Bill.findAll(expenseFilters),
    ]);

    const combinedExpenses = [...expenses[0], ...expenses[1]];

    if (combinedExpenses.length === 0) {
      return res.status(404).json({
        message: "No expenses found matching the provided criteria.",
      });
    }

    return res.status(200).json({
      message: "Expenses fetched successfully.",
      data: combinedExpenses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching expenses.",
      error: error.message,
    });
  }
};
// Admin Controller for managing Expenses


exports.getExpensesByBlockAndResidencyId = async (req, res) => {
  const { block_id, residency_id } = req.params;

  try {
    // Step 1: Fetch expenses from the Expense table by Block ID and Residency ID
    const expensesFromExpenseTable = await Expense.findAll({
      where: {
        block_id,           // The expense's block_id
        residency_id,       // The expense's residency_id
      },
    });

    // Step 2: Fetch bills from the Bill table by Residency ID
    const expensesFromBillTable = await Bill.findAll({
      where: {
        residency_id,       // The bill's residency_id
      },
    });

    // Step 3: Combine results from both Expense and Bill tables
    const combinedExpenses = [
      ...expensesFromExpenseTable,
      ...expensesFromBillTable,
    ];

    // Step 4: Check if any expenses or bills were found
    if (combinedExpenses.length === 0) {
      return res.status(404).json({
        message: `No expenses found for Block ID ${block_id} and Residency ID ${residency_id}.`,
      });
    }

    // Step 5: Return the combined expenses (both Expenses and Bills)
    return res.status(200).json({
      message: "Expenses fetched successfully for Block ID and Residency ID.",
      data: combinedExpenses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching expenses by Block ID and Residency ID.",
      error: error.message,
    });
  }
};


exports.getExpensesByResidencyId = async (req, res) => {
  const { residency_id } = req.params;

  try {
    // Fetch blocks related to the residency
    const blocks = await Block.findAll({
      where: { residency_id }
    });

    if (!blocks || blocks.length === 0) {
      return res.status(404).json({
        message: `No blocks found for residency ID ${residency_id}.`,
      });
    }

    const blockIds = blocks.map(block => block.id);

    // Fetch expenses from Expense table
    const expensesFromExpenseTable = await Expense.findAll({
      where: { block_id: blockIds },
    });

    // Fetch expenses from Bill table
    const expensesFromBillTable = await Bill.findAll({
      where: { residency_id },
    });

    // Fetch funds
    const funds = await Fund.findAll({
      where: { residency_id },
    });

    // Fetch employees for salary expense
    const employees = await Employee.findAll({
      where: { residency_id },
    });

    // Normalize all into a common format
    const normalizedExpenses = [
      ...expensesFromExpenseTable.map(exp => ({
        source: "expense",
        id: exp.id,
        title: exp.title,
        description: null,
        amount: exp.amount,
        status: exp.status,
        type: exp.type,
        due_date: exp.due_date,
        invoice_number: exp.invoice_number,
        block_id: exp.block_id,
      })),
      ...expensesFromBillTable.map(bill => ({
        source: "bill",
        id: bill.id,
        title: bill.title,
        description: bill.description || null,
        amount: bill.amount,
        status: bill.status,
        due_date: bill.due_date,
        invoice_number: bill.invoice_number,
        residency_id: bill.residency_id,
      })),
      ...funds.map(fund => ({
        source: "fund",
        id: fund.id,
        title: fund.title,
        description: fund.description || null,
        amount: fund.amount,
        residency_id: fund.residency_id,
      })),
      ...employees.map(emp => ({
        source: "salary",
        id: emp.id,
        title: `Salary - ${emp.name}`,
        description: `Monthly salary for ${emp.role}`,
        amount: emp.salary,
        residency_id: emp.residency_id,
        status:'paid'
      })),
    ];

    if (normalizedExpenses.length === 0) {
      return res.status(404).json({
        message: `No expenses, funds, or salaries found for residency ID ${residency_id}.`,
      });
    }

    return res.status(200).json({
      message: "Expenses, funds, and salaries fetched successfully for Residency ID.",
      data: normalizedExpenses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching expenses and funds by Residency ID.",
      error: error.message,
    });
  }
};




// Get expenses using Block ID (fetching from both Expense and Bill tables)
exports.getExpensesByBlockId = async (req, res) => {
  const { block_id } = req.params;

  try {
    // Fetch all expenses related to the given block_id from Expense table
    const expensesFromExpenseTable = await Expense.findAll({
      where: { block_id },
    });

    // Fetch all bills related to the given block_id from Bill table
    const expensesFromBillTable = await Bill.findAll({
      include: [
        {
          model: Residency,
          where: { block_id }, // Filter bills by block_id from related Residency model
          attributes: [], // No need to fetch attributes from Residency itself
        },
      ],
    });

    const combinedExpenses = [
      ...expensesFromExpenseTable,
      ...expensesFromBillTable,
    ];

    if (combinedExpenses.length === 0) {
      return res.status(404).json({
        message: `No expenses found for block ID ${block_id}.`,
      });
    }

    return res.status(200).json({
      message: "Expenses fetched successfully for Block ID.",
      data: combinedExpenses,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching expenses by Block ID.",
      error: error.message,
    });
  }
};

// Add a new expense (either from Expense or Bill)
exports.addExpense = async (req, res) => {
  const {
    type,
    title,
    invoice_number,
    due_date,
    amount,
    after_due_date_amount,
    payment_method,
    block_id,
    residency_id,
    description,
    notes,
  } = req.body;
  
  try {
    // Validate required fields
    if (!title || !invoice_number || !due_date || !amount || !block_id) {
      return res.status(400).json({
        message: "Missing required fields (title, invoice_number, due_date, amount, block_id).",
      });
    }

    let newExpense;

    // Check type to determine where to add the expense
    if (type === "union" || type === "finance") {
      // Add to Expense table
      newExpense = await Expense.create({
        title,
        invoice_number,
        due_date,
        amount,
        after_due_date_amount: after_due_date_amount,
        status: "pending", // Default status
        type,
        block_id,
      });
    } else {
      // Add to Bill table
      newExpense = await Bill.create({
        title,
        invoice_number,
        issued_on: new Date(),
        due_date,
        amount,
        description,
        payment_method,
        status: "pending", // Default status
        notes,
        residency_id,
      });
    }

    return res.status(201).json({
      message: `${type === "union" || type === "finance" ? "Expense" : "Bill"} added successfully.`,
      data: newExpense,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error adding expense.",
      error: error.message,
    });
  }
};

// Update an existing expense (for both Expense and Bill models)
exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { status, amount, description, notes, type } = req.body;

  try {
    let updatedExpense;

    // Update expense record based on type (Expense or Bill)
    if (type === "union" || type === "finance") {
      updatedExpense = await Expense.update(
        { status, amount },
        { where: { id }, returning: true }
      );
    } else {
      updatedExpense = await Bill.update(
        { status, amount, description, notes },
        { where: { id }, returning: true }
      );
    }

    if (!updatedExpense[0]) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      message: "Expense updated successfully.",
      data: updatedExpense[1][0],
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error updating expense.",
      error: error.message,
    });
  }
};

// Delete an expense (from either Expense or Bill models)
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    let deletedExpense;

    // Check if expense exists in Expense model first
    const expenseRecord = await Expense.findByPk(id);
    if (expenseRecord) {
      deletedExpense = await Expense.destroy({ where: { id } });
    } else {
      // If not in Expense, check Bill model
      deletedExpense = await Bill.destroy({ where: { id } });
    }

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting expense.",
      error: error.message,
    });
  }
};

// Add a new Bill
exports.addBill = async (req, res) => {
  const { title, invoice_number, due_date, amount, description, payment_method, status, notes, residency_id } = req.body;

  try {
    // Step 1: Validate the Residency ID
    const residency = await Residency.findOne({
      where: { id: residency_id },
    });

    if (!residency) {
      return res.status(404).json({
        message: "Residency not found for the given Residency ID.",
      });
    }

    // Step 2: Create the new Bill record
    const newBill = await Bill.create({
      title,
      invoice_number,
      due_date,
      amount,
      description,
      payment_method,
      status,
      notes,
      residency_id, // Associate the bill with the residency_id
    });

    // Step 3: Return success response with the created bill data
    return res.status(201).json({
      message: "Bill created successfully.",
      data: newBill,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating the bill.",
      error: error.message,
    });
  }
};



// Controller function to add funds to a residency
// exports.addFundsToResidency = async (req, res) => {
//   try {
//     const { residency_id, amount } = req.body; // Assuming the request body contains `residency_id` and `amount`

//     // Validate the input
//     if (!residency_id || !amount) {
//       return res.status(400).json({ message: 'Residency ID and amount are required.' });
//     }

//     if (typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({ message: 'Amount must be a positive number.' });
//     }

//     // Find the residency by ID
//     const residency = await Residency.findOne({ where: { id: residency_id } });

//     if (!residency) {
//       return res.status(404).json({ message: 'Residency not found.' });
//     }

//     // Add the funds to the current amount
//     residency.funds += amount;

//     // Save the updated residency record
//     await residency.save();

//     // Send the updated residency details back in the response
//     return res.status(200).json({
//       message: 'Funds added successfully.',
//       residency: {
//         id: residency.id,
//         funds: residency.funds,
//       },
//     });
//   } catch (error) {
//     console.error('Error adding funds:', error);
//     return res.status(500).json({ message: 'An error occurred while adding funds.' });
//   }
// };


exports.addFundsToResidency = async (req, res) => {
  try {
    const { residency_id, amount, title, description } = req.body;

    if (!residency_id || !amount || !title) {
      return res.status(400).json({ message: 'Residency ID, title, and amount are required.' });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const residency = await Residency.findOne({ where: { id: residency_id } });

    if (!residency) {
      return res.status(404).json({ message: 'Residency not found.' });
    }

    residency.funds += amount;
    await residency.save();

    await Fund.create({
      title,
      description,
      amount,
      residency_id,
    });

    return res.status(200).json({
      message: 'Funds added and logged successfully.',
      residency: {
        id: residency.id,
        funds: residency.funds,
      },
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    return res.status(500).json({ message: 'An error occurred while adding funds.' });
  }
};




exports.getFundsForResidency = async (req, res) => {
  try {
    const { residency_id } = req.params; // Get residency_id from the route parameters

    // Validate that residency_id is provided
    if (!residency_id) {
      return res.status(400).json({ message: 'Residency ID is required.' });
    }

    // Find the residency by its ID
    const residency = await Residency.findOne({ where: { id: residency_id } });

    if (!residency) {
      return res.status(404).json({ message: 'Residency not found.' });
    }

    // Return the funds for the residency
    return res.status(200).json({
      message: 'Funds fetched successfully.',
      residency_id: residency.id,
      funds: residency.funds,
    });
  } catch (error) {
    console.error('Error fetching funds:', error);
    return res.status(500).json({ message: 'An error occurred while fetching funds.' });
  }
};

// Function to add a new employee
exports.addEmployee = async (req, res) => {
  try {
    const { name, email, phone_number, role, residency_id, salary } = req.body;

    // Validate the required fields
    if (!name || !email || !role || !residency_id) {
      return res.status(400).json({
        message: "Name, email, role, and residency_id are required fields.",
      });
    }

    // Check if the email already exists
    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee with this email already exists." });
    }

    // Create a new employee
    const newEmployee = await Employee.create({
      name,
      email,
      phone_number,
      role,
      residency_id,
      salary
    });

    // Return the newly created employee
    return res.status(201).json({
      message: "Employee added successfully",
      employee: newEmployee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while adding employee.", error });
  }
};


exports.getEmployeesByResidency = async (req, res) => {
  try {
    const { residency_id } = req.params;

    // Validate residency_id is provided
    if (!residency_id) {
      return res.status(400).json({
        message: "Residency ID is required.",
      });
    }

    // Find all employees belonging to the specified residency_id
    const employees = await Employee.findAll({
      where: { residency_id },
    });

    // If no employees found for the given residency_id
    if (employees.length === 0) {
      return res.status(404).json({
        message: `No employees found for residency with ID: ${residency_id}`,
      });
    }

    // Return the list of employees
    return res.status(200).json({
      message: "Employees retrieved successfully",
      employees,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error while retrieving employees.", error });
  }
};