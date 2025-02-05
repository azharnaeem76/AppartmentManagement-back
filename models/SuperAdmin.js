const bcrypt = require('bcrypt')

module.exports = (sequelize, Sequelize) => {
  const Superadmin = sequelize.define("superAdmin", {
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
  });

  Superadmin.beforeCreate(async (superAdmin, options) => {
    if (superAdmin.password) {
      const salt = await bcrypt.genSalt(10);
      superAdmin.password = await bcrypt.hash(superAdmin.password, salt);
    }
  });
  // Superadmin.associate = (models) => {
  //   // Ensure Residency model is correctly loaded before using it in associations
  //   Superadmin.hasMany(models.Residency, {
  //     foreignKey: "created_by",
  //   });
  // };

  return Superadmin;
};
