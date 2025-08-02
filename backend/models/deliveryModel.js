const db = require('../config/db');


exports.insertDelivery = (data, callback) => {
    //  console.log("📥 Insertion delivery avec les données :", data);
  const sql = `
    INSERT INTO delivery (
  client_id, livreur_id, commande_id,
  choix, prix, confirm_client,
  confirm_livreur, confirmation, actif
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    // console.log("📌 Requête SQL delivery :", sql);

  db.query(sql, data, callback);
};


exports.getDeliveryClient = (client_id, callback) => {
  db.query(
    `SELECT * FROM delivery WHERE client_id = ? ORDER BY creation DESC LIMIT 1`,
    [client_id], callback
  );
};

exports.getDeliveryLivreur = (livreur_id, callback) => {
  db.query(
    `SELECT * FROM delivery WHERE livreur_id = ? ORDER BY creation DESC LIMIT 1`,
    [livreur_id], callback
  );
};


exports.DeliLivreurUpdade = (id, data, callback) => {
  const { choix, prix } = data;

  db.query(
    `UPDATE delivery SET choix = ?, prix = ?, confirm_livreur = 'Valider' WHERE id = ?`,
    [choix, prix, id],
    callback
  );
};

exports.DeliLivreurUpdadeTerminer = (id, data, callback) => {
  const { confirmation, actif } = data;

  db.query(
    `UPDATE delivery SET confirmation = ?, actif = ? WHERE id = ?`,
    [confirmation, actif, id],
    callback
  );
};



exports.DeliClientUpdade = (id, data, callback) => {
  const {confirm_client} = data;

  db.query(
    `UPDATE delivery SET confirm_client = ? WHERE id = ? `, 
    [confirm_client, id], 
    callback);
};


exports.getDeliveryById = (id, callback) => {
  db.query('SELECT * FROM delivery WHERE id = ?', [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
};


exports.annulerDeliveryC = (id, callback) => {
  db.query(`UPDATE delivery SET  confirm_client = 'Annuler', confirm_livreur = 'Victime', confirmation = 'Annuler' , actif = 0 WHERE id = ? `, [id], callback);
};


exports.annulerDeliveryL = (id, callback) => {
  db.query(`UPDATE delivery SET  confirm_client = 'Victime', confirm_livreur = 'Annuler', confirmation = 'Annuler' , actif = 0 WHERE id = ? `, [id], callback);
};
