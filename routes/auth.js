
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  return res.json({what: 1})
})


module.exports = router;
