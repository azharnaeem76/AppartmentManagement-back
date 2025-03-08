const { Sequelize } = require("sequelize");
const config = require("../config/index");

const sequelize = new Sequelize("apptx", "default", "uG3zdt1YMWlq", {
  host: "ep-long-fire-a4hv9rew.us-east-1.aws.neon.tech",
  port: 5432,
  dialect: "postgres",
  dialectModule: require('pg'),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  },
  pool: {
    max:  10,
    min:  0,
    acquire: 30000,
    idle:  10000,
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
db.Vehicle = require("./Vehicle")(sequelize, Sequelize);
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
