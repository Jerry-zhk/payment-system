const mysql = require("mysql");

const getConnection = () => {
  const con =  mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'securepay'
  });
  
  con.connect(function(err){
    if (err) throw err;
    console.log("Connected");
  });
  return con;  
}

module.exports = getConnection;