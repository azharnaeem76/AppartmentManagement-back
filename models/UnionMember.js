module.exports = (sequelize, Sequelize, schema) => {
    const UnionMember = sequelize.define(
      "unionMember",
      {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        designation: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        join_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW, // Default to the current timestamp
        },
        flat_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        house_number: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        residency_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "residencies", // Link to the Residency table
            key: "id",
          },
        },
      },
      { schema }
    );
  
    UnionMember.associate = (models) => {
      // One-to-Many relationship: Residency -> UnionMember
      UnionMember.belongsTo(models.Residency, {
        foreignKey: "residency_id",
        as: "residency",
        onDelete: "CASCADE", // If a residency is deleted, delete related union members
      });
  
      // Optionally, you can add associations to Employee, Admin, or Announcement models 
      // if union members can also perform those actions. For now, we keep it residency-based.
    };
  
    return UnionMember;
  };
  