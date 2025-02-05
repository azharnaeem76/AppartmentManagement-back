module.exports = (sequelize, Sequelize, schema) => {
  const Block = sequelize.define(
    "block",
    {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_units: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    { schema }
  );

  Block.associate = (models) => {
    // One-to-Many: Block -> Flat
    Block.hasMany(models.Flat, {
      foreignKey: "block_id",
      as: "flats",
      onDelete: "CASCADE",
    });

    // Many-to-One: Block -> Residency
    Block.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE",
    });
  };

  return Block;
};
