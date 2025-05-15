module.exports = (sequelize, Sequelize, schema) => {
    const Fund = sequelize.define(
      "fund",
      {
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        amount: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        residency_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "residencies", // Make sure this matches your table name
            key: "id",
          },
          onDelete: "CASCADE",
        },
      },
      {
        schema,
      }
    );
  
    Fund.associate = (models) => {
      Fund.belongsTo(models.Residency, {
        foreignKey: "residency_id",
        as: "residency",
        onDelete: "CASCADE",
      });
    };
  
    return Fund;
  };
  