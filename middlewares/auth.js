const db = require('../db_connect');

const isAuthenticated = async (req, res, next) => {
  const { session_id } = req.cookies;
  if (!session_id) return res.status(200).json({ no_credentials: true });

  try {
    // const conn = await db.getConnection();
    const session = await db.query(`SELECT user_id FROM session WHERE session_id = ?`, session_id);
    if (session.length === 0) {
      res.clearCookie('session_id');
      return res.status(200).json({ error: 'Expired or Invalid session' });
    }
    req.user_id = session[0].user_id;
    next();
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: error });
  }
}

const verifyCsrfToken = async (req, res, next) => {
  const user_id = req.user_id;
  const csrf_token = req.body.csrf_token;
  try{
    const token = await db.query(`SELECT user_id FROM session WHERE user_id = ? AND csrf_token = ?`, [user_id, csrf_token]);
    if (token.length === 0) {
      return res.status(200).json({ error: 'Invalid CSRF token' });
    }
    let newBody = {};
    for (key in req.body) {
      if (req.body.hasOwnProperty(key) && key !== 'csrf_token') {
        newBody[key] = req.body[key];
      }
    }
    req.body = newBody;
    next();
  }catch (error) {
    console.log(error)
    return res.status(500).json({ error: error });
  }
}

module.exports = {
  isAuthenticated,
  verifyCsrfToken
}