module.exports = (sequelize, Sequelize, schema) => {
  const Flat = sequelize.define(
    "flat",
    {
      flat_number: {
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
        comment: "Number of rooms in the flat",
      },
      floor_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Floor number where the flat is located",
      },
      area: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Area of the flat in square meters",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Optional description for the flat",
      },
      referral_code: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: "Referral code for tracking promotions or referrals",
      },
    },
    {
      schema,
      // hooks: {
      //   beforeCreate: (flat, options) => {
      //     flat.referral_code = `FL-${flat.floor_number}-${flat.flat_number}`.replace(/ /g, '');
      //   },
      // }
    }
  );

  Flat.associate = (models) => {
    // Many-to-One: Flat -> Block
    Flat.belongsTo(models.Block, {
      foreignKey: "block_id",
      as: "block",
      onDelete: "CASCADE",
    });

    // One-to-One: Flat -> Resident
    Flat.hasOne(models.Resident, {
      foreignKey: "flat_id",
      as: "resident",
      onDelete: "CASCADE",
    });
    Flat.hasMany(models.Maintenance, {
      foreignKey: "flat_id",
      as: "maintenances",
    });
  };
  

  return Flat;
};
  