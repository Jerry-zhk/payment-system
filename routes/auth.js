
const express = require('express');
const router = express.Router();
const getConnection = require('../db_connect');
const AuthMWs = require('../middlewares/auth');


const con = getConnection();

const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 8, // would expire after 8 hours
  // httpOnly: true, // The cookie only accessible by the web server
}



const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function makeid(length) {
  var text = "";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function generateThenInsertSessionId(callback){
// const generateThenInsertSessionId = (callback) => {
  var session_id = makeid(30);
  con.query(`SELECT * FROM session WHERE session_id = '${session_id}';`, function (err, result, fields) {
    if (err) return res.status(500).json({message:err});
    if (result.length === 0) {
      callback(session_id);
    } else {
      generateThenInsertSessionId(callback);
    }
  });
}


router.post('/login', function (req, res, next) {

  //getting login credentials
  const { username, pw } = req.body;

  //compare login credentials
  con.query(`SELECT user_id, username FROM account WHERE username = '${username}' AND  password = '${pw}';`, function (err, result, fields) {
    if (err) return res.status(500).json({message:err});

    if (result.length === 0) {
      res.json({ message: 'Incorrect user/password' });
    } else {
      const user_id = result[0].user_id;
      //generate unique session id
      generateThenInsertSessionId(function (session_id){
        con.query(`INSERT INTO session () values ('${user_id}', '${session_id}');`, function (err, result) {
          if (err) return res.status(500).json({message:err});
          console.log(session_id);
          res.cookie('session_id', session_id, cookieOptions);
          res.json({ message: 'Success', 'user_id': user_id, 'session_id': session_id });
        });
      })
    }
  })
});

router.post('/transaction-complete', function (req, res, next){
  var user_id = 2;
  var transaction_id = 12345;
  var from = 'AAA';
  var to = 'BBB';
  var amount = 20;
  var method = 'balance';
  con.query(`INSERT INTO transaction (\`user_id\`, \`from\`, \`to\`, \`amount\`, \`method\`) values ('${user_id}', '${from}', '${to}', '${amount}', '${method}');`, function (err, result) {
    if (err) return res.status(500).json({message:err});
    res.json({ message: 'Transaction complete', 'user_id': user_id, 'from': from, 'to': to, 'amount': amount, 'method': method});
  })
})

router.post('/logout', AuthMWs.isAuthenticated, function (req, res, next){
  //logout and remove session id
  con.query(`DELETE FROM session WHERE user_id = '${req.user_id}';`, function (err, result) {
    if (err) return res.status(500).json({message:err});
    if(result.length === 0) return res.status(401).json({message: 'Not logged in'});
    res.clearCookie('session_id');
    res.json({ message: 'User has logged out' });
  })
});


router.post('/my-profile', AuthMWs.isAuthenticated, function(req, res, next){
  res.status(200).json({ 'user_id': req.user_id });
})


module.exports = router;
