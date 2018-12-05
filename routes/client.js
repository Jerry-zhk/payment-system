
const express = require('express');
const router = express.Router();

const db = require('../db_connect');
const AuthMWs = require('../middlewares/auth');
const crypto = require('../crypto');
const Joi = require('joi');
const schemas = require('../schemas');


// const con = getConnection();

const cookieOptions = {
  maxAge: 1000 * 60 * 60 * 8, // would expire after 8 hours
  httpOnly: true, // The cookie only accessible by the web server
}

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function makeid(length) {
  var text = "";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.post('/login', async (req, res, next) => {

  //getting login credentials
  const { error, value } = Joi.validate(req.body, {
    username: schemas.username,
    password: schemas.password
  });

  if (error) {
    var errorDetails = error.details[0];
    var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
    return res.status(200).json({ error: msg });
  }
  const { username, password } = value;
  try {
    // const conn = await db.getConnection();
    let user = await db.query('SELECT user_id, username, display_name, balance, salt, password FROM account WHERE username = ?;', username);
    if (user.length === 0) return res.json({ error: { username: 'Account does not exist...' } });
    const user_id = user[0].user_id;

    const hashed_password = crypto.scrypt(password, user[0].salt);
    if (hashed_password !== user[0].password) return res.json({ error: { password: 'Incorrect password' } });
    console.log('logging in user ' + user_id);
    let deleteSession = await db.query('DELETE FROM session WHERE user_id = ?;', user_id);
    let unique = false;
    let session_id;
    do {
      session_id = makeid(126);
      let session = await db.query('SELECT * FROM session WHERE session_id = ?;', [session_id]);
      if (session.length === 0) unique = true;
    } while (!unique);

    // Insert session 
    const csrf_token = makeid(128);
    const result = await db.query('INSERT INTO session (user_id, session_id, csrf_token) values (?, ?, ?);', [user_id, session_id, csrf_token]);

    res.cookie('session_id', session_id, cookieOptions);
    let userObj = user[0];
    userObj.csrf_token = csrf_token;
    res.json({ user: userObj });

  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }
});

router.post('/register', async (req, res) => {

  const { error, value }  = Joi.validate(req.body, {
    username: schemas.username,
    display_name: schemas.display_name,
    password: schemas.password
  });
  if (error) {
    var errorDetails = error.details[0];
    var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
    return res.status(200).json({ error: msg });
  }
  const { username, display_name, password } = value;
  try {
    // const conn = await db.getConnection();
    let user = await db.query('SELECT user_id, username FROM account WHERE username = ?;', username);
    if (user.length > 0) return res.json({ error: { username: 'Username has been used.' } });

    let uniqueSalt = false;
    let salt;
    do {
      salt = makeid(64);
      let existingSalt = await db.query('SELECT salt FROM account WHERE salt = ?;', [salt]);
      if (existingSalt.length === 0) uniqueSalt = true;
    } while (!uniqueSalt);


    const hashed_password = crypto.scrypt(password, salt);
    console.log(hashed_password);

    const access_key = crypto.randomBytes(16)
    const secret_key = crypto.randomBytes(32)
    const insertNewUser = await db.query('INSERT INTO account (username, display_name, password, salt, access_key, secret_key) values (?, ?, ?, ?, ? ,?);', [username, display_name, hashed_password, salt, access_key, secret_key]);

    // let insertUser = await db.query('INSERT INTO account (user)')
    const user_id = insertNewUser.insertId;
    let uniqueSessionId = false;
    let session_id;
    do {
      session_id = makeid(128);
      let session = await db.query('SELECT * FROM session WHERE session_id = ?;', [session_id]);
      if (session.length === 0) uniqueSessionId = true;
    } while (!uniqueSessionId);

    // Insert session 
    const csrf_token = makeid(128);
    const result = await db.query('INSERT INTO session (user_id, session_id, csrf_token) values (?, ?, ?);', [user_id, session_id, csrf_token]);

    res.cookie('session_id', session_id, cookieOptions);
    res.json({ user: { user_id: user_id, username: username, display_name: display_name, balance: 0, csrf_token: csrf_token } });

  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }

});

// router.get('/add-value', function (req, res, next) {

//   var user_id = 2;
//   var cc_number = '4463915235847879';
//   var cvv = 779;
//   var expiration_date = '11/2023';
//   var cardholder = 'puisama';
//   var amount = 50;

//   con = getConnection();

//   con.query(`SELECT credit_limit FROM creditcard WHERE cc_number = '${cc_number}' AND cvv = ${cvv} AND expiration_date = '${expiration_date}' AND card_holder = '${cardholder}';`, function (err, result) {
//     if (err) throw err;

//     if (result.length === 0) {
//       res.json({ message: 'Credit card information invalid. Add-value process not complete!' })
//     } else if (result[0].credit_limit < amount) {
//       res.json({ message: 'Amount exceeds credit limit. Add-value process not complete!' })
//     } else {
//       // NOT YET RECORD

//       //update credit card limit
//       con.query(`UPDATE creditcard SET credit_limit = credit_limit - ${amount} WHERE cc_number = '${cc_number}';`, function (err, result) {
//         if (err) throw err;
//       })

//       // update user account
//       con.query(`UPDATE account SET balance = balance + ${amount} WHERE user_id = '${user_id}';`, function (err, result) {
//         if (err) throw err;
//       })
//       res.json({ message: 'Add-value process completed!' })
//     }
//   })
// })

// router.post('/ac-transaction', function (req, res, next) {

//   //const { to, amount } = req.body;
//   var user_id = 1;
//   var to = 2;
//   var amount = 10;


//   const con = getConnection();

//   con.query(`SELECT balance FROM account WHERE user_id = '${user_id}';`, function (err, result, fields) {
//     if (err) throw err;

//     if (result[0].balance < amount) {
//       res.json({ message: 'User has insufficient balance. Transaction not complete!' })
//     } else {

//       //record transaction
//       con.query(`INSERT INTO ac_transaction (\`from\`, \`to\`, \`amount\`) values ('${user_id}', '${to}', '${amount}');`, function (err, result) {
//         if (err) throw err;
//         res.json({ message: 'Transaction complete', 'from': user_id, 'to': to, 'amount': amount });
//       })

//       //modify user balance
//       con.query(`UPDATE account SET balance = balance - ${amount} WHERE user_id = '${user_id}';`, function (err, result) {
//         if (err) throw err;
//       })

//       con.query(`UPDATE account SET balance = balance + ${amount} WHERE user_id = '${to}';`, function (err, result) {
//         if (err) throw err;
//       })
//     }
//   })
// })


router.post('/payment-info', async (req, res) => {
  
  try {
    
    const {error, value} = Joi.validate(req.body, {
      requestId: schemas.requestId
    })
    if (error) {
      var errorDetails = error.details[0];
      var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
      return res.status(200).json({ error: msg });
    }
    const { requestId } = value;
    // const conn = await db.getConnection();
    let request = await db.query('\
      SELECT pr.*, a.display_name, t.transaction_count \
      FROM payment_request AS pr,account AS a, \
      (SELECT count(*) AS transaction_count FROM transactions WHERE payment_request_id = ?) AS t \
      WHERE pr.recipient = a.user_id AND pr.request_id = ? AND pr.expired_at > CURRENT_TIMESTAMP;', [requestId, requestId]);
    if (request.length !== 1) return res.json({ error: 'Payment request is not found or expired.' });
    if (request[0].transaction_count > 0) return res.json({ error: 'Payment has already been completed.' });
    res.json({ request: request[0] });
  } catch (error) {
    return res.status(200).json({ error: error });
  }
});

router.post('/pay-with-account-balance', [AuthMWs.isAuthenticated, AuthMWs.verifyCsrfToken], async (req, res) => {
  try {
    const {error, value} = Joi.validate(req.body, {
      requestId: schemas.requestId
    })
    if (error) {
      var errorDetails = error.details[0];
      var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
      return res.status(200).json({ error: msg });
    }
    const { requestId } = value;
    // const conn = await db.getConnection();
    let request = await db.query('\
      SELECT pr.*, t.transaction_count \
      FROM payment_request AS pr, \
      (SELECT count(*) AS transaction_count FROM transactions WHERE payment_request_id = ?) AS t \
      WHERE pr.request_id = ? AND pr.expired_at > CURRENT_TIMESTAMP;', [requestId, requestId]);
    if (request.length !== 1) return res.json({ error: 'Payment failed, due to the invalid payment request.' });
    if (request[0].transaction_count > 0) return res.json({ error: 'Payment failed, because it has already been paid.' });

    let user = await db.query('SELECT user_id, balance FROM account WHERE user_id = ?;', req.user_id);

    if (user.length !== 1)
      return res.json({ error: 'Payment failed, due to the invalid payer.' });
    if (user[0].balance < request[0].amount)
      return res.json({ error: 'Payment failed, due to the insufficient balance.' });
    let insertTransaction = await db.query('INSERT INTO transactions (payment_request_id, paid_by) values (?,?)', [requestId, req.user_id]);
    let updatePayerBalance = await db.query('UPDATE account SET balance = balance - ? WHERE user_id = ?;', [request[0].amount, req.user_id]);
    let updateRecipientBalance = await db.query('UPDATE account SET balance = balance + ? WHERE user_id = ?;', [request[0].amount, request[0].recipient]);
    res.json({ transaction_id: insertTransaction.insertId });
  } catch (error) {
    return res.status(200).json({ error: error });
  }
});

router.post('/logout', [AuthMWs.isAuthenticated, AuthMWs.verifyCsrfToken], async (req, res, next) => {
  try {
    // const conn = await db.getConnection();
    let logout = await db.query('DELETE FROM session WHERE user_id = ?;', req.user_id);
    if (logout.length === 0) return res.status(200).json({ error: 'Unauthorized' });
    res.clearCookie('session_id');
    res.json({ message: 'User has logged out' });
  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }

});


router.post('/my-profile', AuthMWs.isAuthenticated, async (req, res, next) => {
  try {
    // const conn = await db.getConnection();
    let user = await db.query('SELECT a.user_id, a.username, a.display_name, a.balance, s.csrf_token \
      FROM account AS a LEFT JOIN session AS s  ON  a.user_id = s.user_id WHERE a.user_id = ?', req.user_id);
    if (user.length === 0) return res.json({ error: 'Unauthorized' });
    res.json({ user: user[0] });
  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }
})


router.post('/transactions', AuthMWs.isAuthenticated, async (req, res) => {
  try {
    let transactions = await db.query('\
      SELECT t.transaction_id, t.paid_at, pr.amount, pr.description, a.display_name as recipient_name \
      FROM transactions AS t, payment_request AS pr, account as a  \
      WHERE t.payment_request_id = pr.request_id AND pr.recipient = a.user_id AND t.paid_by = ? ORDER BY t.paid_at DESC;', req.user_id);
    res.json({ transactions: transactions });
  } catch (error) {
    return res.status(200).json({ error: error });
  }
})

router.post('/create-request', [AuthMWs.isAuthenticated, AuthMWs.verifyCsrfToken], async (req, res) => {
  try {
    const {error, value} = Joi.validate(req.body, {
      amount: schemas.amount,
      description: schemas.description,
      lifetime: schemas.lifetime
    });
    if (error) {
      var errorDetails = error.details[0];
      var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
      return res.status(200).json({ error: msg });
    }

    const { amount, description } = value;
    let lifetime = value.lifetime;

    if (lifetime) {
      lifetime = parseInt(lifetime);
    } else {
      lifetime = 1
    }

    var EXPIRED_AT = { toSqlString: function () { return `NOW() + INTERVAL ${lifetime} HOUR`; } };

    // Insert request row
    const insertRequest = await db.query('INSERT INTO payment_request (recipient, amount, description, expired_at) values (?, ?, ?, ?);', [req.user_id, amount, description, EXPIRED_AT]);
    let request = await db.query('SELECT * FROM payment_request WHERE request_id = ? LIMIT 1;', insertRequest.insertId);
    if (request.length === 0) return res.json({ error: 'Database error' });
    res.json({ request: request[0] });
  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }
})


router.post('/payment-requests', AuthMWs.isAuthenticated, async (req, res) => {
  try {
    let requests = await db.query('\
      SELECT pr.*, IFNULL(t.transaction_count , 0) AS transaction_count, (expired_at < CURRENT_TIMESTAMP) AS expired \
      FROM payment_request AS pr \
      LEFT JOIN (SELECT payment_request_id, count(DISTINCT payment_request_id) AS transaction_count FROM transactions GROUP BY payment_request_id) AS t \
      ON t.payment_request_id = pr.request_id \
      WHERE pr.recipient = ? ORDER BY pr.created_at DESC;', req.user_id);
    res.json({ requests: requests });
  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }
})

router.post('/add-value', [AuthMWs.isAuthenticated, AuthMWs.verifyCsrfToken], async (req, res) => {
  try {
    const {error, value} = Joi.validate(req.body, {
      amount: schemas.amount,
      code: schemas.gift_card_code
    });
    if (error) {
      var errorDetails = error.details[0];
      var msg = `${errorDetails.path.join('.')}: ${errorDetails.message}`;
      return res.status(200).json({ error: msg });
    }

    const {amount, code} = value;
    const gift_card = await db.query('SELECT * FROM gift_card WHERE code = ? AND amount = ? AND expired_at > CURRENT_TIMESTAMP', [code, amount]);
    if (gift_card.length === 0) return res.json({ error: 'Invalid gift card' });
    await db.query('UPDATE account SET balance = balance + ? WHERE user_id = ?', [amount, req.user_id]);
    await db.query('DELETE FROM gift_card WHERE card_id = ?', gift_card[0].card_id);
    res.json({success: true});

  } catch (error) {
    console.log(error)
    return res.status(200).json({ error: error });
  }
})


module.exports = router;
