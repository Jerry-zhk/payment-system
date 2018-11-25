const express = require('express');
const router = express.Router();
const crypto = require('../crypto');
const db = require('../db_connect');
const mysql = require('promise-mysql');

const requestObjectToString = (requestObj) => {
  let items = [];
  for (var key in requestObj) {
    // skip loop if the property is from prototype
    if (!requestObj.hasOwnProperty(key)) continue;

    items.push(key + '=' + requestObj[key]);
  }
  return items.join('&');
}


const dummy_request = {
  access_key: 'b0657685ba0636c53625cf341e6fe220',
  amount: 123,
  description: 'A very cool shirt!'
}

const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function makeid(length) {
  var text = "";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


router.get('/random-password', (req, res, next) => {
  const salt = makeid(64);
  const pwd_hash = crypto.scrypt('123123', salt)
  res.json({salt: salt, pwd: pwd_hash});
})


router.post('/payment-request', async (req, res, next) => {
  const claimed_hmac = req.header('Authorization');
  if(!claimed_hmac) return res.status(400).send('Bad request');
  console.log(claimed_hmac)
  

  try {
    const { access_key, amount, description } = req.body;
    let lifetime = req.body.lifetime;
    // const conn = await db.getConnection();
    let user = await db.query('SELECT user_id, secret_key FROM account WHERE access_key = ?;', access_key);
    if(user.length === 0) return res.status(401).json({ message: 'Unauthorized' });
    const { user_id, secret_key } = user[0];
    const requestString = requestObjectToString(req.body);
  
    const hmac = crypto.hmac(Buffer.from(secret_key, 'hex'), Buffer.from(requestString));
    if(claimed_hmac !== hmac) return res.status(401).json({ message: 'Unauthorized' });

    if(lifetime){
      lifetime = parseInt(lifetime);
    }else{
      lifetime = 1
    }
    var EXPIRED_AT = { toSqlString: function() { return `NOW() + INTERVAL ${lifetime} HOUR`; } };

    // Insert request row
    const insertRequest = await db.query('INSERT INTO payment_request (recipient, amount, description, expired_at) values (?, ?, ?, ?);', [user_id, amount, description, EXPIRED_AT]);
    res.json({ request_id: insertRequest.insertId, url: `http://localhost:3000/pay/${insertRequest.insertId}`})
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error });
  }

});




module.exports = router;