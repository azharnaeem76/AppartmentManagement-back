module.exports = (sequelize, Sequelize, schema) => {
    const Comment = sequelize.define(
      "comment",
      {
        text: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        complaint_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "complaints",
            key: "id",
          },
        },
        resident_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "residents",
            key: "id",
          },
        },              
      },
      { schema }
    );
  
    Comment.associate = (models) => {
      Comment.belongsTo(models.Complaint, {
        foreignKey: "complaint_id",
        as: "complaint",
        onDelete: "CASCADE",
      });
  
      Comment.belongsTo(models.Resident, {
        foreignKey: "resident_id",
        as: "resident",
        onDelete: "CASCADE",
      });
    };
  
    return Comment;
  };
  