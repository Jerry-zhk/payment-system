
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

router.get('/add-value', function (req, res, next){

  var user_id = 2;
  var cc_number = '4463915235847879';
  var cvv = 779;
  var expiration_date = '11/2023';
  var cardholder = 'puisama';
  var amount = 50;

  con = getConnection();

  con.query(`SELECT credit_limit FROM creditcard WHERE cc_number = '${cc_number}' AND cvv = ${cvv} AND expiration_date = '${expiration_date}' AND card_holder = '${cardholder}';`, function (err, result) {
    if (err) throw err;

    if (result.length === 0){
      res.json({message: 'Credit card information invalid. Add-value process not complete!'})
    } else if (result[0].credit_limit < amount) {
      res.json({message: 'Amount exceeds credit limit. Add-value process not complete!'})
    } else {
      // NOT YET RECORD

      //update credit card limit
      con.query(`UPDATE creditcard SET credit_limit = credit_limit - ${amount} WHERE cc_number = '${cc_number}';`, function (err, result) {
        if (err) throw err;
      })

      // update user account
      con.query(`UPDATE account SET balance = balance + ${amount} WHERE user_id = '${user_id}';`, function (err, result) {
        if (err) throw err;
      })
      res.json({message: 'Add-value process completed!'})
    }
  })
})

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
      con.query(`UPDATE account SET balance = balance - ${amount} WHERE user_id = '${user_id}';`, function (err, result){
        if (err) throw err;
      })

      con.query(`UPDATE account SET balance = balance + ${amount} WHERE user_id = '${to}';`, function (err, result){
        if (err) throw err;
      })
    }
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
