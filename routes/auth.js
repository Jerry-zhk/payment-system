
const express = require('express');
const router = express.Router();

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


router.get('/login', function (req, res, next) {

  //getting login credentials
  var username = 'nick';
  var pw = 'nicpple';

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
          res.json({ message: 'Success', 'user_id': user_id, 'session_id': session_id });
        });
      })
      //
    }
  })
});

router.get('/transaction-complete', function (req, res, next){
  var user_id = 2;
  var transaction_id = 12345;
  var from = 'AAA';
  var to = 'BBB';
  var amount = 20;
  var method = 'balance';

  const con = getConnection();
  con.query(`INSERT INTO transaction (\`user_id\`, \`from\`, \`to\`, \`amount\`, \`method\`) values ('${user_id}', '${from}', '${to}', '${amount}', '${method}');`, function (err, result) {
    if (err) throw err;
    res.json({ message: 'Transaction complete', 'user_id': user_id, 'from': from, 'to': to, 'amount': amount, 'method': method});
  })
})

router.get('/logout', function (req, res, next){
  var user_id = 2;

  //logout and remove session id
  const con = getConnection();
  con.query(`DELETE FROM session WHERE user_id = '${user_id}';`, function (err, result) {
    if (err) throw err;
    res.json({ message: 'User has logged out', 'user_id': user_id });
  })
});


module.exports = router;
