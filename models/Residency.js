module.exports = (sequelize, Sequelize) => {
    const Residency = sequelize.define("residency", {
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Full address of the residency or society.",
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Optional specific location or landmark.",
      },
      total_units: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "List of amenities like park, gym, pool, etc.",
      },
      established_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      maintenance_rate: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: "Monthly maintenance rate for the residency/society.",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Additional details or description about the society.",
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The ID of the super admin who created this residency.",
      },
      funds: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0, // Default value for funds is 0
        comment: "Total funds available for the residency/society.",
      },
    });
  
    Residency.associate = (models) => {
      // Residency belongs to a SuperAdmin
      Residency.belongsTo(models.Superadmin, {
        foreignKey: "created_by", // Link to the Superadmin's ID
        as: "creator", // Alias for the relationship
        onDelete: "CASCADE", // Automatically delete residencies if the SuperAdmin is deleted
      });
  
      // One-to-Many: Residency -> Admin
      Residency.hasMany(models.Admin, {
        foreignKey: "residency_id",
        as: "admins", // Alias for the relationship
        onDelete: "CASCADE", // Automatically delete related admins when residency is deleted
      });
  
      // One-to-Many: Residency -> Block
      Residency.hasMany(models.Block, {
        foreignKey: "residency_id",
        as: "blocks",
        onDelete: "CASCADE",
      });
  
      // One-to-Many: Residency -> House
      Residency.hasMany(models.House, {
        foreignKey: "residency_id",
        as: "houses",
        onDelete: "CASCADE",
      });
  
      // One-to-Many: Residency -> Employee
      Residency.hasMany(models.Employee, {
        foreignKey: "residency_id",
        as: "employees",
        onDelete: "CASCADE",
      });
  
      // One-to-Many: Residency -> Announcement
      Residency.hasMany(models.Announcement, {
        foreignKey: "residency_id",
        as: "announcements",
        onDelete: "CASCADE",
      });
  
      // One-to-Many: Residency -> Complaint
      Residency.hasMany(models.Complaint, {
        foreignKey: "residency_id",
        as: "complaints",
        onDelete: "CASCADE",
      });

      Residency.hasMany(models.UnionMember, {
        foreignKey: "residency_id",
        as: "unionMembers",
        onDelete: "CASCADE",
      });
      
    };
  
    return Residency;
  };
  