module.exports = (sequelize, Sequelize, schema) => {
    const Vehicle = sequelize.define(
      "Vehicle", // Name of the model
      {
        title: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: "Title of the vehicle, e.g., 'Family Car', 'Work Vehicle'"
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
          comment: "Type of the vehicle, e.g., 'Sedan', 'SUV', 'Truck'"
        },
        number: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          comment: "Vehicle registration number"
        },
        residentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Residents', // This should match the table name as defined in Sequelize
            key: 'id'
          },
          onDelete: 'CASCADE',
          comment: "ID of the resident who owns the vehicle"
        }
      },
      {
        schema,
        hooks: {
          beforeCreate: (vehicle, options) => {
            console.log('Creating new vehicle with number:', vehicle.number);
          },
        }
      }
    );
  
    Vehicle.associate = (models) => {
      // Associating Vehicle with Resident
      Vehicle.belongsTo(models.Resident, {
        foreignKey: 'residentId',
        as: 'resident',
        onDelete: 'CASCADE',
      });
    };
  
    return Vehicle;
  };
  