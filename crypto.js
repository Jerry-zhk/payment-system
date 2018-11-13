const crypto = require('crypto');
const fs = require('fs');
const assert = require('assert');

// generate RSA keys, require node >= v10.12.0
function generateKeyPair(){
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
      passphrase: 'AKSenejfkwnEjDniw'
    }
  });
  fs.writeFile('publicKey.pem', publicKey, () => {console.log('Wrote publicKey.pem.')})
  fs.writeFile('privateKey.pem', privateKey, () => {console.log('Wrote privateKey.pem.')})
  console.log(publicKey)
  console.log(privateKey)
}

// generateKeyPair();

// const algorithm = 'aes-256-cbc';
// let key = Buffer.alloc(32); // key should be 32 bytes
// let iv = Buffer.alloc(16); // iv should be 16

// key = Buffer.concat([Buffer.from('password')], key.length);
// iv = Buffer.from(Array.prototype.map.call(iv, () => {return Math.floor(Math.random() * 256)}));

// console.log('key: ', key.toString('hex'));
// console.log('iv: ', iv.toString('hex'));

// let cipher = crypto.createCipheriv(algorithm, key, iv);
// let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
// encrypted += cipher.final('hex');
// console.log('ciphertext: ',encrypted);

// let decipher = crypto.createDecipheriv(algorithm, key, iv);
// let decrypted = decipher.update(encrypted, 'hex', 'utf8');
// decrypted += decipher.final('utf8');
// console.log('plaintext: ',decrypted);


// Diffie Hellman
// const alice = crypto.createDiffieHellman(1024);
// const aliceKey = alice.generateKeys();
// console.log(aliceKey.toString('hex'));

// // Generate Bob's keys...
// const bob = crypto.createDiffieHellman(alice.getPrime(), alice.getGenerator());
// const bobKey = bob.generateKeys();

// // Exchange and generate the secret...
// const aliceSecret = alice.computeSecret(bobKey);
// const bobSecret = bob.computeSecret(aliceKey);
// console.log(aliceSecret)
// console.log(bobSecret)

// // OK
// assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));

// const hmacAlgorithm = 'sha256';
// const hmac = crypto.createHmac(hmacAlgorithm, 'a secret');

// hmac.update('some data to hash');
// let digest = hmac.digest('hex');
// console.log(digest);

function getPublicKey(){
  return fs.readFileSync('publicKey.pem', 'utf8');
}

function getPrivateKey(){
  return fs.readFileSync('privateKey.pem', 'utf8');
}

const publicKey = getPublicKey();
const privateKey = getPrivateKey();
var buffer =  Buffer.from('what');
var ciphertext = crypto.publicEncrypt(publicKey, buffer);
console.log(ciphertext);
var plaintext = crypto.privateDecrypt({
  key: privateKey,
  passphrase: 'AKSenejfkwnEjDniw',
  padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
}, ciphertext);
console.log(plaintext.toString());


// var encryptStringWithRsaPublicKey = function(toEncrypt) {
//   var publicKey = getPublicKey();
//   var buffer = new Buffer(toEncrypt);
//   var encrypted = crypto.publicEncrypt(publicKey, buffer);
//   return encrypted.toString("base64");
// };

// var decryptStringWithRsaPrivateKey = function(toDecrypt) {
//   var privateKey = getPrivateKey();
//   var buffer = new Buffer(toDecrypt, "base64");
//   var decrypted = crypto.privateDecrypt(privateKey, buffer);
//   return decrypted.toString("utf8");
// };

// var msg = 'i like to shit';
// var ciphertext = encryptStringWithRsaPublicKey(msg);
// var plaintext = decryptStringWithRsaPrivateKey(msg);
