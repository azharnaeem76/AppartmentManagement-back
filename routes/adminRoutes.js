const express = require("express");
const { authorizeRoute } = require("../middlewares/Authentication"); // Import the auth middleware
const { getResidencyByAdmin, getAdminResidentsByResidencyId, getResidentByFlatId, getMaintenanceByResidencyId, addMaintenance, getMaintenanceByResidencyIdAndFlatId, getMaintenanceByBlockAndFlat, getMaintenanceByBlock, getDefaultersByResidencyId, getExpensesByResidencyId, getExpensesByBlockAndResidencyId, addExpense, addBill, addFundsToResidency, getFundsForResidency, addEmployee, getEmployeesByResidency, getResidencyByAdminArray } = require("../controllers/adminController");
const { getFlatsByResidency, getHouses, getBlocks, createAnnouncement, getAnnouncementsByResidencyId } = require("../controllers/superadmincontroller");

const router = express.Router();

// Protect all superadmin routes with authorization middleware
// The "admin" role is required to access these routes
router.use(authorizeRoute("admin"));


router.get("/residency", getResidencyByAdmin)
router.get("/residencyArray", getResidencyByAdminArray)
router.get("/residents/:residency_id", getAdminResidentsByResidencyId)
router.get("/flatsByResidency/:residencyId/flats", getFlatsByResidency); 
router.get("/residency/:residencyId/houses", getHouses);
router.get("/residency/:residencyId/blocks", getBlocks);
router.get("/flat/residents/:flatId",getResidentByFlatId);
router.post("/maintenance",addMaintenance);
router.get("/maintenance/:residency_id",getMaintenanceByResidencyId);
router.get("/maintenanceFlat/:residency_id/:flat_id", getMaintenanceByResidencyIdAndFlatId);
router.get('/maintenance/flat/:residency_id&:block_id&:flat_id', getMaintenanceByBlockAndFlat);
router.get('/maintenance/block/:residency_id&:block_id', getMaintenanceByBlock);
router.get('/defaulters/:residency_id', getDefaultersByResidencyId);
router.post("/createAnnouncement",createAnnouncement)
router.get("/announcement/:residency_id",getAnnouncementsByResidencyId)
router.get("/expenses/:residency_id",getExpensesByResidencyId);
router.get('/expenses/block/:block_id/residency/:residency_id', getExpensesByBlockAndResidencyId);
router.post("/createExpense",addExpense)
router.post("/createBill",addBill)
router.post("/addFunds",addFundsToResidency)
router.get("/getFunds/:residency_id",getFundsForResidency);
router.get("/getEmp/:residency_id", getEmployeesByResidency)
router.post("/addEmp", addEmployee)

// get residecy by admin id
// Get Resdency , Residents , Add ,update delete
// router.get("/residency",getResidencyById)


module.exports = router;
