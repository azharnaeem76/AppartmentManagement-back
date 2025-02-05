const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication"); // Import the auth middleware
const {
  createResidency,
  getAllResidencies,
  getResidencyById,
  updateResidency,
  deleteResidency,
  addAdminToResidency,
  removeAdminFromResidency,
  removeAdmin,
  addBlock,
  getBlocks,
  deleteBlock,
  addFlat,
  getFlats,
  deleteFlat,
  addHouse,
  getHouses,
  deleteHouse,
} = require("../controllers/superadmincontroller"); 
const router = express.Router();

// Protect all superadmin routes with authorization middleware
// The "superAdmin" role is required to access these routes
router.use(authorizeRoute("superAdmin"));

// Residency routes
router.post("/create-residency", createResidency); // Create a new residency
router.get("/all-residencies", getAllResidencies); // Get all residencies
router.get("/residency/:residencyId", getResidencyById); // Get a single residency by ID
router.put("/update-residency/:residencyId", updateResidency); // Update residency by ID
router.delete("/delete-residency/:residencyId", deleteResidency); // Delete residency by ID

// Admin management routes
router.post("/residency/:residencyId/add-admin", addAdminToResidency); // Add admin to residency
router.delete("/residency/:residencyId/remove-admin/:adminId", removeAdminFromResidency); // Remove admin from residency
router.delete("/admin/:adminId", removeAdmin); // Remove admin (general)

// Block management routes
router.post("/residency/:residencyId/add-block", addBlock); // Add block to residency
router.get("/residency/:residencyId/blocks", getBlocks); // Get all blocks in residency
router.delete("/block/:blockId", deleteBlock); // Delete block by ID

// Flat management routes
router.post("/block/:blockId/add-flat", addFlat); // Add flat to block
router.get("/block/:blockId/flats", getFlats); // Get all flats in block
router.delete("/flat/:flatId", deleteFlat); // Delete flat by ID

// House management routes
router.post("/residency/:residencyId/add-house", addHouse); // Add house to residency
router.get("/residency/:residencyId/houses", getHouses); // Get all houses in residency
router.delete("/house/:houseId", deleteHouse); // Delete house by ID

module.exports = router;
