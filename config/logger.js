const winston = require("winston");
const fs = require("fs");
const path = require("path");

const logDir = "/tmp/logs";

// Ensure the logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
  http: "magenta",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.align(),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: path.join(logDir, "error.log"),
    level: "error",
  }),
  new winston.transports.File({
    filename: path.join(logDir, "combined.log"),
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format: format,
  transports: transports,
});

module.exports = logger;
