const crypto = require('../crypto');
const mung = require('express-mung');

var sessions = {};

// Secured connection setup
const setup = (req, res, next) => {
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
        console.log('diffie-hellman')
        // Diffie hellman keys for cipher
        const cipher_clientKey = crypto.decryptWithRSA(req.body.cipher_clientKey);
        const cipher_keys = crypto.generateSessionKeys(cipher_clientKey);

        // Diffie hellman keys for hmac
        const hmac_clientKey = crypto.decryptWithRSA(req.body.hmac_clientKey);
        const hmac_keys = crypto.generateSessionKeys(hmac_clientKey);
        const session_id = Date.now() + Math.floor(Math.random() * 1000);
        const keys = {
          cipherKey: crypto.sha256(cipher_keys.sessionKey),
          hmacKey: crypto.sha256(hmac_keys.sessionKey),
        };
        sessions[session_id] = keys;

        return res.status(200).json({ 
          code: 1,
          session_id: session_id,
          cipherKey: cipher_keys.serverKey.toString('hex'),
          hmacKey: hmac_keys.serverKey.toString('hex'),
         });
    }
    return res.status(400).json({ code: 1235 });
  }
};

// Decrypt data
const decryptRequestBody = (req, res, next) => {
  const { session_id, data } = req.body;
  const keys = sessions[session_id];
  req.session_keys = keys;
  if (data) {
    const { ciphertext, iv } = data;
    const plaintext = crypto.decryptWithAES256CBC(keys.cipherKey, iv, ciphertext);
    const dataWithHMAC = JSON.parse(plaintext);
    const hmacComputed = crypto.hmac(keys.hmacKey, dataWithHMAC.data)
    if(dataWithHMAC.hmac !== hmacComputed){
      // HMAC verification failed, data was changed
      return res.status(400).json({ code: 1222 });
    }
    req.body = JSON.parse(dataWithHMAC.data);
  }
  next();
}


// Encrypt the responses
const encryptResponseJSON = mung.json((body, req, res) => {
  const { cipherKey, hmacKey } = req.session_keys;
  const dataString = JSON.stringify(body);
  const hmac = crypto.hmac(hmacKey, dataString);
  const dataWithHMAC = JSON.stringify({data: dataString, hmac: hmac});
  return { data: crypto.encryptWithAES256CBC(cipherKey, dataWithHMAC) };
});


module.exports = {
  setup,
  decryptRequestBody,
  encryptResponseJSON
}