module.exports = (sequelize, Sequelize) => {
    const Residency = sequelize.define("residency", {
        residency_id: {
            type: Sequelize.STRING, // Unique residency code
            primaryKey: true,
            allowNull: false,
            unique: true,
            comment: "Unique code assigned to each residency or society.",
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        country: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        state: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: false,
            comment: "Full address of the residency or society.",
        },
        location: {
            type: Sequelize.STRING,
            allowNull: true,
            comment: "Optional specific location or landmark.",
        },
        total_units: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        amenities: {
            type: Sequelize.JSON,
            allowNull: true,
            comment: "List of amenities like park, gym, pool, etc.",
        },
        established_date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        maintenance_rate: {
            type: Sequelize.FLOAT,
            allowNull: true,
            comment: "Monthly maintenance rate for the residency/society.",
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: "Additional details or description about the society.",
        },
        created_by: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: "The ID of the super admin who created this residency.",
        },
    });

    return Residency;
};
