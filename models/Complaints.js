module.exports = (sequelize, Sequelize, schema) => {
  const Complaint = sequelize.define(
    "complaint",
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "Pending", // Options: Pending, Resolved, In Progress
      },
      resident_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residents", // References the Resident table
          key: "id",
        },
        comment: "The ID of the resident who raised the complaint.",
      },
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies", // References the Residency table
          key: "id",
        },
        comment: "The ID of the residency to which the complaint belongs.",
      },
    },
    { schema } // This adds the schema to the model
  );

  Complaint.associate = (models) => {
    // One-to-Many relationship: Residency -> Complaint
    Complaint.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency", // Alias for the relationship
      onDelete: "CASCADE", // Automatically delete complaints when residency is deleted
    });

    // One-to-Many relationship: Resident -> Complaint
    Complaint.belongsTo(models.Resident, {
      foreignKey: "resident_id",
      as: "resident", // Alias for the relationship
      onDelete: "CASCADE", // Automatically delete complaints when resident is deleted
    });
  };

  return Complaint;
};
