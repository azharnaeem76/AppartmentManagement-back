module.exports = (sequelize, Sequelize, schema) => {
  const Announcement = sequelize.define(
    "announcement",
    {
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies",
          key: "id",
        },
        comment: "The ID of the residency to which the announcement belongs.",
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The ID of the creator (Admin, Superadmin, Employee, or UnionMember).",
      },
      created_by_type: {
        type: Sequelize.ENUM("Superadmin", "Employee", "UnionMember", "Admin"),
        allowNull: false,
        comment: "Specifies the user type who created the announcement.",
      },
    },
    { schema }
  );

  Announcement.associate = (models) => {
    Announcement.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency",
      onDelete: "CASCADE",
    });

  };

  return Announcement;
};
