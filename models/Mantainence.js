module.exports = (sequelize, Sequelize, schema) => {
  const Maintenance = sequelize.define(
    "maintenance",
    {
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Year of the maintenance charge.",
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Amount of maintenance for the specified month/year.",
      },
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies", // References the Residency table
          key: "id",
        },
        comment: "The ID of the residency for which the maintenance applies.",
      },
    },
    { schema } // This adds the schema to the model
  );

  Maintenance.associate = (models) => {
    // One-to-Many relationship: Residency -> Maintenance
    Maintenance.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE", // Automatically delete maintenance records if residency is deleted
    });
  };

  return Maintenance;
};
