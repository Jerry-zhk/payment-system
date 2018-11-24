const mysql = require("promise-mysql");

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'securepay',
  connectionLimit: 15
});


module.exports = pool;