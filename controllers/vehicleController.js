// controllers/vehicleController.js
const db = require("../models");

const Vehicle = db.Vehicle

const vehicleController = {
    // Create a new vehicle
    addVehicle: async (req, res) => {
        const { title, type, number, residentId } = req.body;
        try {
            const vehicle = await Vehicle.create({
                title,
                type,
                number,
                residentId
            });
            res.status(201).json(vehicle);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get all vehicles for a specific resident
    getVehiclesByResident: async (req, res) => {
        const { residentId } = req.params;
        try {
            const vehicles = await Vehicle.findAll({
                where: { residentId }
            });
            res.status(200).json(vehicles);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Update a vehicle
    updateVehicle: async (req, res) => {
        const { vehicleId } = req.params;
        const { title, type, number } = req.body;
        try {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (vehicle) {
                await vehicle.update({ title, type, number });
                res.status(200).json(vehicle);
            } else {
                res.status(404).json({ message: "Vehicle not found" });
            }
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete a vehicle
    deleteVehicle: async (req, res) => {
        const { vehicleId } = req.params;
        try {
            const vehicle = await Vehicle.findByPk(vehicleId);
            if (vehicle) {
                await vehicle.destroy();
                res.status(204).send(); // No content to send back
            } else {
                res.status(404).json({ message: "Vehicle not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = vehicleController;
