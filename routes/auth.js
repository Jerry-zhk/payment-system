
const express = require('express');
const router = express.Router();
const getConnection = require('./db_connect');

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function makeid(length) {
  var text = "";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateThenInsertSessionId(callback){
// const generateThenInsertSessionId = (callback) => {
  const con = getConnection();
  var session_id = makeid(30);
  con.query(`SELECT * FROM session WHERE session_id = '${session_id}';`, function (err, result, fields) {
    if (err) throw err;
    if (result.length === 0) {
      callback(session_id);
    } else {
      generateThenInsertSessionId(callback);
    }
  });
}

router.post('/login', function (req, res, next) {
  console.log(req.body)
  // //getting login credentials
  const { username, pw } = req.body;

  //connect to database
  const con = getConnection();

  //compare login credentials
  con.query(`SELECT user_id, username FROM account WHERE username = '${username}' AND  password = '${pw}';`, function (err, result, fields) {
    if (err) throw err;

    if (result.length === 0) {
      res.json({ message: 'Incorrect user/password' });
    } else {
      const user_id = result[0].user_id;
      //generate unique session id
      generateThenInsertSessionId(function (session_id){
        con.query(`INSERT INTO session () values ('${user_id}', '${session_id}');`, function (err, result) {
          if (err) throw err;

          res.json({ message: 'Success', user_id: user_id });
        });
      })
      //
    }
  })
});

router.post('/ac-transaction', function (req, res, next){

  //const { to, amount } = req.body;
  var user_id = 1;
  var to = 2;
  var amount = 10;


  const con = getConnection();

  con.query(`SELECT balance FROM account WHERE user_id = '${user_id}';`, function (err, result, fields) {
    if (err) throw err;

    if (result[0].balance < amount){
      res.json({message: 'User has insufficient balance. Transaction not complete!'})
    } else {

      //record transaction
      con.query(`INSERT INTO ac_transaction (\`from\`, \`to\`, \`amount\`) values ('${user_id}', '${to}', '${amount}');`, function (err, result) {
        if (err) throw err;
        res.json({ message: 'Transaction complete', 'from': user_id, 'to': to, 'amount': amount});
      })
      
      //modify user balance
      con.query(`UPDATE account SET balance = balance - '${amount}' WHERE user_id = '${user_id}';`, function (err, result){
        if (err) throw err;
      })

      con.query(`UPDATE account SET balance = balance + '${amount}' WHERE user_id = '${to}';`, function (err, result){
        if (err) throw err;
      })
    }
  })
})

router.post('/logout', function (req, res, next){
  var user_id = 2;

  //logout and remove session id
  const con = getConnection();
  con.query(`DELETE FROM session WHERE user_id = '${user_id}';`, function (err, result) {
    if (err) throw err;
    res.json({ message: 'User has logged out', 'user_id': user_id });
  })
});


module.exports = router;
