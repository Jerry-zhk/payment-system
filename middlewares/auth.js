const getConnection = require('../db_connect');

const isAuthenticated = (req, res, next) => {
  const { session_id } = req.cookies;
  if(!session_id) return res.status(200).json({ failure: true });
  const conn = getConnection();
  conn.query(`SELECT user_id FROM session WHERE session_id = '${session_id}'`, (err, result) => {
    if(err) return res.status(401);
    if(result.length === 0) return res.status(401).json({message: 'Invalid session id'});
    req.user_id = result[0].user_id;
    next();
  });
}

module.exports = {
  isAuthenticated
}