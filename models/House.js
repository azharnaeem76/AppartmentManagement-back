module.exports = (sequelize, Sequelize, schema) => {
  const House = sequelize.define(
    "house",
    {
      house_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      occupancy_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "vacant",
      },
      number_of_rooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Number of rooms in the house",
      },
      number_of_floors: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Number of floors in the house",
      },
      area: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Area of the house in square meters",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Optional description for the house",
      },
    },
    { schema }
  );

  House.associate = (models) => {
    // Many-to-One: House -> Residency
    House.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE",
    });

    // One-to-One: House -> Resident
    House.hasOne(models.Resident, {
      foreignKey: "house_id",
      as: "resident",
      onDelete: "CASCADE",
    });
  };

  return House;
};
