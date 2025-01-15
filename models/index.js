const config = require('../config/index');

const { Sequelize } = require("sequelize");



console.log(config,'the config here 1 theconfig here')
const sequelize = new Sequelize(config.db.database, config.db.db_username, config.db.db_password, {
  host: config.db.db_host,
  port: config.db.db_port,
  dialect: config.db.dialect,
  operatorsAliases: false,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
  pool: {
    max: parseInt(config.pool.max),
    min:  parseInt(config.pool.min),
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
  // logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;



db.SuperAdmin = require('./SuperAdmin')(sequelize, Sequelize);
db.Residency = require('./Residency')(sequelize, Sequelize);

db.SuperAdmin.hasMany(db.Residency, {
    foreignKey: "created_by", // The foreign key in the Residency table
    as: "residencies", // Alias for accessing the residencies created by a super admin
});

db.Residency.belongsTo(db.SuperAdmin, {
    foreignKey: "created_by", // The foreign key in the Residency table
    as: "creator", // Alias for accessing the super admin who created the residency
});


module.exports= db