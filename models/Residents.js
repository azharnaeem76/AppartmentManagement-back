const bcrypt = require('bcrypt');

module.exports = (sequelize, Sequelize, schema) => {
  const Resident = sequelize.define(
    "resident",
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
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Password for resident login."
      },
      house_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "houses", // References the House table
          key: "id",
        },
        comment: "ID of the house this resident lives in.",
      },
      flat_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "flats", // References the Flat table
          key: "id",
        },
        comment: "ID of the flat this resident lives in.",
      },
      defaulter: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indicates if the resident is a defaulter (true or false)."
      },
      assigned_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Sets the default value to the current timestamp
        comment: "The date when the resident was assigned."
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null,
      }
    },
    { schema } // Adds the schema to the model
  );

  // Password hashing before resident creation
  Resident.beforeCreate(async (resident, options) => {
    if (resident.password) {
      const salt = await bcrypt.genSalt(10);
      resident.password = await bcrypt.hash(resident.password, salt);
    }
    
    // Automatically set the assigned_date if not provided
    if (!resident.assigned_date) {
      resident.assigned_date = new Date();
    }
  });

  // Associations
  
  Resident.associate = (models) => {
    Resident.hasMany(models.Maintenance, { foreignKey: 'resident_id', as: 'maintenance' });
    // One-to-Many: Resident -> House
    Resident.belongsTo(models.House, { foreignKey: "house_id", as: "house" });

    // One-to-Many: Resident -> Flat
    Resident.belongsTo(models.Flat, { foreignKey: "flat_id", as: "flat" });

    // Additional associations can be added here
  };

  return Resident;
};
