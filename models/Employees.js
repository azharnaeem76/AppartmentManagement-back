module.exports = (sequelize, Sequelize, schema) => {
  const Employee = sequelize.define(
    "employee",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Role of the employee within the residency (e.g., manager, caretaker, etc.)",
      },
      salary: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Monthly salary of the employee",
        defaultValue: 0,
      },
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies", // References the Residency table
          key: "id",
        },
        comment: "The ID of the residency to which the employee belongs.",
      },
    },
    { schema } // This adds the schema to the model
  );

  Employee.associate = (models) => {
    // One-to-Many relationship: Residency -> Employee
    Employee.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE", // Automatically delete employees when residency is deleted
    });
  };

  return Employee;
};
