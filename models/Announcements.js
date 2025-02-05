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
      residency_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "residencies", // References the Residency table
          key: "id",
        },
        comment: "The ID of the residency to which the announcement belongs.",
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The ID of the employee, super admin, union member, or admin who created the announcement.",
      },
    },
    { schema } // This sets the schema for the model
  );

  Announcement.associate = (models) => {
    // One-to-Many relationship: Residency -> Announcement
    Announcement.belongsTo(models.Residency, {
      foreignKey: "residency_id",
      as: "residency", // Alias for the relationship
      onDelete: "CASCADE", // If a residency is deleted, delete related announcements
    });

    // Linking created_by to Superadmin, Employee, UnionMember, and Admin
    Announcement.belongsTo(models.Superadmin, {
      foreignKey: "created_by", // Links to Superadmin table
      as: "superAdmin",
      onDelete: "SET NULL", // If the super admin is deleted, set created_by to null
    });

    Announcement.belongsTo(models.Employee, {
      foreignKey: "created_by", // Links to Employee table
      as: "employee",
      onDelete: "SET NULL", // If the employee is deleted, set created_by to null
    });

    Announcement.belongsTo(models.UnionMember, {
      foreignKey: "created_by", // Links to UnionMember table
      as: "unionMember",
      onDelete: "SET NULL", // If the union member is deleted, set created_by to null
    });

    Announcement.belongsTo(models.Admin, {
      foreignKey: "created_by", // Links to Admin table
      as: "admin",
      onDelete: "SET NULL", // If the admin is deleted, set created_by to null
    });
  };

  return Announcement;
};
