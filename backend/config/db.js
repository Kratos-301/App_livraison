const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'synughetsgsj' // le nom de ta base
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connexion à MySQL réussie');
});

module.exports = db;
