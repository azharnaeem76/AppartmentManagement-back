const bcrypt = require('bcrypt')

module.exports = (sequelize, Sequelize, schema) => {
  const Admin = sequelize.define(
    "admin",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies", // references the Residency model
          key: "id",
        },
        onDelete: "CASCADE", // Delete the admin if the residency is deleted
      },
    },
    {
      schema: schema,
      timestamps: true,
    }
  );

  
  Admin.beforeCreate(async (Admin, options) => {
    if (Admin.password) {
      const salt = await bcrypt.genSalt(10);
      Admin.password = await bcrypt.hash(Admin.password, salt);
    }
  });
  Admin.associate = (models) => {
    // Admin belongs to a Residency
    Admin.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency", // Alias for the relationship
      onDelete: "CASCADE", // Automatically delete admin if residency is deleted
    });
  };

  return Admin;
};
