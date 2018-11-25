const mysql = require("promise-mysql");
const dbConfig = require('./database.json')

const pool = mysql.createPool({
  host: dbConfig.dev.host,
  user: dbConfig.dev.user,
  password: dbConfig.dev.password,
  database: dbConfig.dev.database,
  connectionLimit: 15
});


module.exports = pool;