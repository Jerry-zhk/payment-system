const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ssl = require('./middlewares/ssl-like');
const clientRoutes = require('./routes/client');
const APIRoutes = require('./routes/api');
const eShopRoutes = require('./routes/eshop');

app.use(bodyParser.json());
app.use(cookieParser());


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

  res.header('Access-Control-Allow-Credentials', true);
  next();
});

const clientMiddlewares = [
  ssl.setup,
  ssl.decryptRequestBody,
  ssl.encryptResponseJSON
]

app.use('/api',  APIRoutes);
app.use('/eshop',  eShopRoutes);
app.use('/client', clientMiddlewares, clientRoutes);

module.exports = app;