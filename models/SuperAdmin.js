
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
    }, {
      timestamps: true,
    });
  
    return Superadmin;
  };