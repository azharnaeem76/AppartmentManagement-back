          const bcrypt = require('bcrypt')

          module.exports = (sequelize, Sequelize, schema) => {
            const Resident = sequelize.define(
              "resident",
              {
                name: {
                  type: Sequelize.STRING,
                  allowNull: false,
                },
                email: {
                  type: Sequelize.STRING,
                  allowNull: false,
                  unique: true,
                },
                password: {
                  type: Sequelize.STRING,
                  allowNull: false,
                  comment: "Password for resident login."
                },
                house_id: {
                  type: Sequelize.INTEGER,
                  allowNull: true,
                  references: {
                    model: "houses", // References the House table
                    key: "id",
                  },
                  comment: "ID of the house this resident lives in.",
                },
                flat_id: {
                  type: Sequelize.INTEGER,
                  allowNull: true,
                  references: {
                    model: "flats", // References the Flat table
                    key: "id",
                  },
                  comment: "ID of the flat this resident lives in.",
                },
                defaulter: {
                  type: Sequelize.BOOLEAN,
                  allowNull: false,
                  defaultValue: false,
                  comment: "Indicates if the resident is a defaulter (true or false)."
                },
                deletedAt:{
                  type:Sequelize.DATE,
                  default:null
                }
              },
              { schema } // Adds the schema to the model
            );

            
            Resident.beforeCreate(async (Resident, options) => {
              if (Resident.password) {
                const salt = await bcrypt.genSalt(10);
                Resident.password = await bcrypt.hash(Resident.password, salt);
              }
            });
            Resident.associate = (models) => {
              // One-to-Many: Resident -> House
              Resident.belongsTo(models.House, { foreignKey: "house_id", as: "house" });

              // One-to-Many: Resident -> Flat
              Resident.belongsTo(models.Flat, { foreignKey: "flat_id", as: "flat" });
            };

            return Resident;
          };
