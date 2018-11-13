const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('./crypto');

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

var sessions = {};

// Secured connection setup
app.use((req, res, next) => {
  const { session_id } = req.body;
  if (session_id) {
    if (sessions.hasOwnProperty(session_id)) next();
    else return res.status(400).json({ code: 1235 });
  } else {
    const { type } = req.body;
    switch (type) {
      case 'handshake':
        const publicKey = crypto.getPublicKey();
        return res.status(200).json({ code: 0, publicKey });
      case 'diffie-hellman':
        const clientKey = crypto.decryptWithRSA(req.body.clientKey);
        const keys = crypto.generateSessionKeys(clientKey);
        const session_id = Date.now() + Math.floor(Math.random() * 1000);
        sessions[session_id] = crypto.sha256(keys.sessionKey);
        return res.status(200).json({ code: 1, session_id: session_id, serverKey: keys.serverKey.toString('hex') });
    }
    return res.status(400).json({ code: 1235 });
  }
});

// Decrypt data
app.use((req, res, next) => {
  const { session_id, data } = req.body;
  if (data) {
    const { ciphertext, iv } = data;
    const key = sessions[session_id];
    const plaintext = crypto.decryptWithAES256CBC(key, iv, ciphertext);
    req.body = JSON.parse(plaintext);
    req.session_key = key;
  }
  next();
});

app.post('/pay', function (req, res, next) {
  
  const data = {
    code : 0,
    req_body: JSON.stringify(req.body)
  }

  const { session_key } = req;
  const ciphertext = crypto.encryptWithAES256CBC(session_key, JSON.stringify(data));
  return res.status(200).json({data: ciphertext});
});

module.exports = app;