const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication"); // Import the auth middleware
const { getResidencyByAdmin, getAdminResidentsByResidencyId, getResidentByFlatId, getMaintenanceByResidencyId, addMaintenance } = require("../controllers/adminController");
const { getFlatsByResidency, getHouses, getBlocks } = require("../controllers/superadmincontroller");

const router = express.Router();

// Protect all superadmin routes with authorization middleware
// The "admin" role is required to access these routes
router.use(authorizeRoute("admin"));


router.get("/residency", getResidencyByAdmin)
router.get("/residents/:residency_id", getAdminResidentsByResidencyId)
router.get("/flatsByResidency/:residencyId/flats", getFlatsByResidency); 
router.get("/residency/:residencyId/houses", getHouses);
router.get("/residency/:residencyId/blocks", getBlocks);
router.get("/flat/residents/:flatId",getResidentByFlatId)
router.post("/maintenance",addMaintenance)
router.get("/maintenance/:residency_id",getMaintenanceByResidencyId)
// get residecy by admin id
// Get Resdency , Residents , Add ,update delete
// router.get("/residency",getResidencyById)


module.exports = router;
