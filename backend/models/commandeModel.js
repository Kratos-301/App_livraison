const db = require('../config/db');

exports.checkDerniereCommande = (client_id, callback) => {
  const sql = `
    SELECT id, statut, statut_2, statut_3 FROM commande
    WHERE client_id = ?
    ORDER BY date_commande DESC
    LIMIT 1
  `;
  db.query(sql, [client_id], callback);
};

exports.checkDerniereCommandeLivreur = (livreur_id, callback) => {
  const sql = `SELECT * FROM commande WHERE livreur_id = ? ORDER BY id DESC LIMIT 1`;
  db.query(sql, [livreur_id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};


exports.insertCommande = (data, callback) => {
  const sql = `
    INSERT INTO commande (
    client_id, client_nom, client_num,
    livreur_id, livreur_marque_moto, livreur_nom,
    longitude, latitude,
    statut, statut_2, statut_3, disponibilite
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, data, callback);
};


exports.getCommandesClient = (client_id, callback) => {
  db.query(
    `SELECT * FROM commande WHERE client_id = ? ORDER BY date_commande DESC LIMIT 1`,
    [client_id], callback
  );
};

exports.getLivreurs = (callback) => {
  const sql = `
    SELECT l.id, l.nom, l.marque_moto,
      EXISTS (
        SELECT 1 FROM commande c
        WHERE c.livreur_id = l.id
          AND c.statut = 1 AND c.statut_3 = 0 
      ) AS est_occupe
    FROM livreuruser l
    WHERE l.isOnline = 1
  `;
  db.query(sql, callback);
};


exports.getCommandesLivreur = (livreur_id, callback) => {
  db.query(
    `SELECT * FROM commande WHERE livreur_id = ? ORDER BY date_commande DESC LIMIT 10`,
    [livreur_id], callback
  );
};

exports.getNbCommandesAnnulees = (client_id, callback) => {
  const sql = `
    SELECT COUNT(*) AS nbAnnulees 
    FROM commande 
    WHERE client_id = ? 
      AND statut = 1 
      AND statut_2 = 1 
      AND statut_3 = 1
  `;
  db.query(sql, [client_id], callback);
};


exports.annulerCommande = (id, callback) => {
  db.query(`UPDATE commande SET statut = '1', statut_2 = '1', statut_3 = '1' , disponibilite = '1' WHERE id = ? `, [id], callback);
};

exports.terminerCommande = (id, callback) => {
  console.log("Mise à jour de la commande", id);
  
  db.query(`UPDATE commande SET 
    statut = 2,
    statut_2 = 2,
    statut_3 = 2,
    passation = 'Engager'
    WHERE id = ?`, [id], callback);
};

exports.finiCommande = (id, disponibilite, passation, actif, callback) => {
  console.log("Mise à jour de la commande", id);
  
  db.query(`UPDATE commande SET 
    disponibilite = ?,
    passation = ?,
    actif = ?
    WHERE id = ?`, [disponibilite, passation, actif, id], callback);
};


exports.confirmerCommande = (id, lat, lon, callback) => {
  db.query(`
    UPDATE commande SET
    statut = 1,
    statut_2 = 1,
    statut_3 = 0,
    disponibilite = 0 ,
    passation = 'PasEncore',
    latitude_li = ?, longitude_li = ?
    WHERE id = ?
  `, [lat, lon, id], callback);
};


exports.getCommandeById = (id, callback) => {
  db.query('SELECT * FROM commande WHERE id = ?', [id], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]);
  });
};
