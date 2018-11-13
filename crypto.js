const crypto = require('crypto');
const fs = require('fs');
const assert = require('assert');

const passphrase = 'AKSenejfkwnEjDniw';

// generate RSA keys, require node >= v10.12.0
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: passphrase
    }
  });
  // fs.writeFile('publicKey.pem', publicKey, () => {console.log('Wrote publicKey.pem.')})
  // fs.writeFile('privateKey.pem', privateKey, () => {console.log('Wrote privateKey.pem.')})
  console.log(publicKey);
  console.log(privateKey);
}

// generateKeyPair();

const algorithm = 'aes-256-cbc';

// return { ciphertext, iv }
const encryptWithAES256CBC = (key, plaintext) => {
  let iv = Buffer.alloc(16);
  iv = Buffer.from(Array.prototype.map.call(iv, () => { return Math.floor(Math.random() * 256) }));
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  return { ciphertext, iv: iv.toString('hex') };
}

const decryptWithAES256CBC = (key, hexIV, ciphertext) => {
  let iv = Buffer.from(hexIV, 'hex')
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}


// Diffie Hellman
const generateSessionKeys = (clientKey) => {
  const dh = crypto.getDiffieHellman('modp5');
  const serverKey = dh.generateKeys();
  const sessionKey = dh.computeSecret(clientKey);
  return { serverKey, sessionKey };
}


// const hmacAlgorithm = 'sha256';
// const hmac = crypto.createHmac(hmacAlgorithm, 'a secret');

// hmac.update('some data to hash');
// let digest = hmac.digest('hex');
// console.log(digest);

function getPublicKey() {
  return fs.readFileSync('publicKey.pem', 'utf8');
}

const privateKey = fs.readFileSync('privateKey.pem', 'utf8');
const decryptWithRSA = function (hexCiphertext) {
  var buffer = Buffer.from(hexCiphertext, 'hex');
  var plaintext = crypto.privateDecrypt({
    key: privateKey,
    passphrase: passphrase,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
  }, buffer);
  return plaintext;
};

const sha256 = function (data) {
  const hash = crypto.createHash('sha256');
  hash.update(data);
  return hash.digest();
}

module.exports = {
  // RSA
  getPublicKey,
  decryptWithRSA,

  // Diffie Hellman
  generateSessionKeys,

  // hash
  sha256,

  // AES-256-CBC
  encryptWithAES256CBC,
  decryptWithAES256CBC,
}
