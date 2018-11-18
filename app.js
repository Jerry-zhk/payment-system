const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ssl = require('./ssl-like');
const AuthRoutes = require('./routes/auth');


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

// app.use(ssl.setup);
// app.use(ssl.decryptRequestBody);
// app.use(ssl.encryptResponseJSON);

app.use('/auth', AuthRoutes);

module.exports = app;