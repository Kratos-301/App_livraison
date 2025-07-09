const db = require('../config/db');

module.exports = {
  findByEmail: (email, cb) => {
    db.query('SELECT * FROM admin WHERE email = ?', [email], cb);
  },

  registerAdmin: (adminData, cb) => {
    const { nom, prenom, email, motdepasse, code } = adminData;
    db.query(
      'INSERT INTO admin (nom, prenom, email, motdepasse, code) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, email, motdepasse, code],
      cb
    );
  }
};
