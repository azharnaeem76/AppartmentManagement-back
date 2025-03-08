// routes/vehicleRoutes.js
const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const { authorizeRoute } = require("../middlewares/Authentication");

const router = express.Router();

// Middleware to ensure all vehicle routes are accessed by authenticated and authorized users
router.use(authorizeRoute("resident"));

// Vehicle routes
router.post('/', vehicleController.addVehicle);
router.get('/:residentId', vehicleController.getVehiclesByResident);
router.put('/:vehicleId', vehicleController.updateVehicle);
router.delete('/:vehicleId', vehicleController.deleteVehicle);

module.exports = router;
