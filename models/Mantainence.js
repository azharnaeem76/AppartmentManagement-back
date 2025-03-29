module.exports = (sequelize, Sequelize, schema) => {
  const Maintenance = sequelize.define(
    "Maintenance",
    {
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Year of the maintenance charge.",
      },
      month: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Month of the maintenance charge.",
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Amount of maintenance for the specified month/year.",
      },
    },
    {
      schema: schema, // Ensures schema is applied to the table
      tableName: "maintenances",
      timestamps: true, // Enables createdAt & updatedAt
    }
  );

  // Define associations inside models/index.js
  Maintenance.associate = (models) => {
    Maintenance.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE",
    });

    Maintenance.belongsTo(models.Block, {
      foreignKey: "block_id",
      as: "block",
      onDelete: "CASCADE",
    });

    Maintenance.belongsTo(models.Flat, {
      foreignKey: "flat_id",
      as: "flat",
      onDelete: "CASCADE",
    });

    Maintenance.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident",
      onDelete: "CASCADE",
    });
  };

  return Maintenance;
};
