const { Sequelize } = require("sequelize");
const config = require("../config/index");

const sequelize = new Sequelize(config.db.database, config.db.db_username, config.db.db_password, {
  host: config.db.db_host,
  port: config.db.db_port,
  dialect: config.db.dialect || "postgres",
  dialectModule: require('pg'),
  dialectOptions:{
    ssl:{
      require:true,
      rejectUnauthorized: false,
    }
  },
  pool: {
    max: 0,
    min: 150,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

const db = {};

// Load all models without schema assignment
db.Superadmin = require("./SuperAdmin")(sequelize, Sequelize);
db.Residency = require("./Residency")(sequelize, Sequelize);
db.Admin = require("./Admin")(sequelize, Sequelize);
db.Block = require("./Blocks")(sequelize, Sequelize);
db.House = require("./House")(sequelize, Sequelize);
db.Flat = require("./Flats")(sequelize, Sequelize);
db.Resident = require("./Residents")(sequelize, Sequelize);
db.Employee = require("./Employees")(sequelize, Sequelize);
db.Announcement = require("./Announcements")(sequelize, Sequelize);
db.Complaint = require("./Complaints")(sequelize, Sequelize);
db.Maintenance = require("./Mantainence")(sequelize, Sequelize);
db.UnionMember = require("./UnionMember")(sequelize, Sequelize);

// Set up associations without schema for now
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Method to dynamically set schema for a residency
db.setSchema = (model, schemaName) => {
  model.schema = schemaName; // Assign schema dynamically
};

module.exports = db;
