const mysql = require("mysql");

const getConnection = () => {
  const con =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'securepay'
  });
  
  con.connect(function(err){
    if (err) throw err;
    console.log("Connected to database");
  });
  return con;  
}

module.exports = getConnection;