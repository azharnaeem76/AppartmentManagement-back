const express = require("express");
const cors = require("cors");
const xss = require("xss-clean");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require('express-session');
const { requestLogger } = require("./middlewares/logger");

require("dotenv").config();

const app = express();

app.use(function(req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src 'self'");
    return next();
  });


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./app/view"));
app.use(helmet());
app.use(cors());
app.use(xss());

app.use(morgan("combined"));

app.use(requestLogger);


const superAdminAuth = require('./routes/auth.route');
const superAdminRoutes = require('./routes/superAdmin');
const adminRoutes = require('./routes/adminRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const residentRoutes = require('./routes/residentRoutes');
const commentRoutes = require('./routes/CommentRoutes');

app.use('/api/auth/',superAdminAuth)
app.use('/api/superAdmin',superAdminRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/vehicles', vehicleRoutes)
app.use('/api/resident', residentRoutes)
app.use('/api/comments',commentRoutes)

// app.use(session({
//     secret: 'my-secret0here',
//     resave: false,
//     saveUNinitialized: false, // Ensure correct spelling and case
//   }));
  

module.exports = app;
