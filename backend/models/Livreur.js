const db = require('../config/db');

module.exports = {
  getConnectes: (cb) => {
    db.query('SELECT id, nom, marque_moto FROM livreuruser WHERE connecte = 1', cb);
  }
};
