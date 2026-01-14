const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // socketPath: '/opt/homebrew/var/mysql/mysql.sock', // optional if Node cannot connect
});

module.exports = db;