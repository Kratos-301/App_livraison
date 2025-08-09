// === controllers/commandeController.js ===


const model = require('../models/commandeModel');
const db = require('../config/db');

let io;

exports.setSocketIo = function(socketIoInstance) {
  io = socketIoInstance;
};



// Les Reacts



exports.apiAccueilClient = (req, res) => {
  const client = req.session.client;
  if (!client || !client.id) {
    console.log("⛔ Pas d'utilisateur en session");
    return res.status(401).json({ error: 'Non autorisé' });
  }

  console.log("✅ Utilisateur trouvé :", client);

  model.getCommandesClient(client.id, (err, commandes) => {
    if (err) {
      console.error("❌ Erreur getCommandesClient :", err);
      return res.status(500).json({ error: 'Erreur commandes' });
    }

    model.getLivreurs((err2, livreurs) => {
      if (err2) {
        console.error("❌ Erreur getLivreurs :", err2);
        return res.status(500).json({ error: 'Erreur livreurs' });
      }

      const disponibles = [];
      const occupes = [];

      livreurs.forEach(l => l.est_occupe ? occupes.push(l) : disponibles.push(l));
      const livreursTries = [...disponibles, ...occupes];

      model.getNbCommandesAnnulees(client.id, (err3, result) => {
        if (err3) {
          console.error("❌ Erreur getNbCommandesAnnulees :", err3);
          return res.status(500).json({ error: 'Erreur annulations' });
        }

        const nbAnnulees = result[0]?.nbAnnulees || 0;
        console.log("✅ Données prêtes à envoyer à React");

        return res.json({
          client,
          commandes,
          livreurs: livreursTries,
          nbAnnulees
        });
      });
    });
  });
};


exports.apiAccueilLivreur = (req, res) => {
  const livreur = req.session.livreur;
  if (!livreur || !livreur.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  model.getCommandesLivreur(livreur.id, (err, result) => {
    if (err) {
      console.error('Erreur BDD :', err);
      return res.status(500).json({ success: false, message: 'Erreur base de données' });
    }

    const commande = result.length > 0 ? result[0] : null;

    return res.json({
      success: true,
      livreur,
      commande,
      timestamp: Date.now()
    });
  });
};

exports.creerCommande = (req, res) => {
  const {
    client_id, livreur_id, livreur_nom, livreur_marque_moto,
    client_num, client_nom, statut, statut_2, statut_3, disponibilite,
    latitude, longitude
  } = req.body;

  if (!client_id || !livreur_id || !livreur_nom || !livreur_marque_moto || !statut || !statut_2 || !statut_3 || !disponibilite || !client_num || !client_nom || !latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
  }

  model.checkDerniereCommande(client_id, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur serveur' });

    if (result.length > 0) {
      const last = result[0];
      if (last.statut === 1 && last.statut_3 === 0 && last.disponibilite === 0) {
        return res.status(409).json({ success: false, message: 'Commande déjà en cours ou en attente.' });
      }
    }

    model.checkDerniereCommandeLivreur(livreur_id, (err, commandesLivreur) => {
      if (err) return res.status(500).json({ success: false, message: 'Erreur serveur (livreur)' });

      const enCours = commandesLivreur.find(cmd => cmd.statut === 1 && cmd.statut_3 === 0 && cmd.disponibilite === 0);
      if (enCours) {
        return res.status(409).json({ success: false, message: 'Le livreur est déjà occupé avec une autre commande.' });
      }

      const data = [
        client_id, client_nom, client_num,
        livreur_id, livreur_marque_moto, livreur_nom,
        longitude, latitude,
        statut, statut_2, statut_3, disponibilite
      ];
      
      model.insertCommande(data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erreur lors de l’enregistrement' });

        const cmdId = result.insertId;

        io.emit('commandeCreated', { id: cmdId, client_id, livreur_id });
        io.emit('occupe', { livreurId: livreur_id });

        return res.json({ success: true, message: 'Commande envoyée avec succès', id: cmdId });
      });
    });
  });
};

exports.annulerClient = (req, res) => {
  const id = req.params.id;

  model.annulerCommande(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getCommandeById(id, (err2, commande) => {
      if (!err2 && commande) {
        const livreurId = commande.livreur_id;

        // 🟢 Notifier tous les clients que le livreur est libre
        io.emit('livreurStatusChange', {
          id: livreurId,
          status: 'online'  // ou "disponible"
        });

        // 🔁 Notifier la room spécifique
        io.to(`cmd_${id}`).emit('commandeAnnulee', {
          id,
          type: 'annulation'
        });

        // 🔔 Notifier tout le monde
        io.emit('commandeAnnulee', {
          id,
          client_id: commande.client_id,
          livreur_id: livreurId,
          message: "Votre commande a été annulée"
        });
      }
    });
  });
};



exports.annulerLivreur = (req, res) => {
  const id = req.params.id;
  model.annulerCommande(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getCommandeById(id, (err2, commande) => {
      if (!err2 && commande) {
        io.emit('livreurLibre', { livreurId: commande.livreur_id });
        io.to(`cmd_${id}`).emit('update', { id, type: 'annulation' });
        io.emit('commandeAnnulee', {
          id,
          client_id: commande.client_id,
          livreur_id: commande.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Commande annulée' });
  });
};


exports.terminerCommandeLivreur = (req, res) => {
  const id = req.params.id;
  model.terminerCommande(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getCommandeById(id, (err2, commande) => {
      if (!err2 && commande) {
        io.emit('livreurLibre', { livreurId: commande.livreur_id });
        io.to(`cmd_${id}`).emit('update', { id, type: 'arrive' });
        io.emit('CommandeTerminer', {
          id,
          client_id: commande.client_id,
          livreur_id: commande.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Commande Terminer' });
  });
};


exports.finiCommandeLivreur = (req, res) => {
  const id = req.params.id;
  const { disponibilite, passation, actif } = req.body;

  model.finiCommande(id, disponibilite, passation, actif, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getCommandeById(id, (err2, commande) => {
      if (!err2 && commande) {
        io.emit('livreurLibre', { livreurId: commande.livreur_id });
        io.to(`cmd_${id}`).emit('update', { id, type: 'arrive' });
        io.emit('CommandeTerminer', {
          id,
          client_id: commande.client_id,
          livreur_id: commande.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Commande Terminer' });
  });
};


exports.confirmerCommande = (req, res) => {
  const id = req.params.id;
  const { latitude_li, longitude_li } = req.body;

  model.confirmerCommande(id, latitude_li, longitude_li, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur confirmation' });

    model.getCommandeById(id, (err2, commande) => {
      if (!err2 && commande) {
        io.to(`cmd_${id}`).emit('commandeConfirmed', { id, type: 'Confirmation' });
        io.emit('commandeConfirmed', {
          id,
          client_id: commande.client_id,
          livreur_id: commande.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Commande confirmée' });
  });
};



exports.updatePositionCli = (req, res) => {
  const client = req.session.client;

  if (!client || !client.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { latitude, longitude } = req.body;

  // Mise à jour des coordonnées dans la table clientuser
  const updateClientUserSql = `
    UPDATE clientuser 
    SET latitude = ?, longitude = ? 
    WHERE id = ? AND nom = ?
  `;

  db.query(updateClientUserSql, [latitude, longitude, client.id, client.nom], (err, result) => {
    if (err) {
      console.error("Erreur SQL update clientuser :", err);
      return res.status(500).json({ success: false, message: 'Erreur mise à jour position clientuser' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Client non trouvé dans clientuser' });
    }

    return res.json({ success: true, message: 'Position GPS client mise à jour dans clientuser' });
  });
};


exports.updatePosition = (req, res) => {
  const livreur = req.session.livreur;
  if (!livreur || !livreur.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  const { latitude_li, longitude_li } = req.body;

  // Trouver la commande en cours du livreur
  const findCommandeSql = `
    SELECT id FROM commande 
    WHERE livreur_id = ? AND statut = 1 AND statut_2 = 1 AND statut_3 = 0 
    ORDER BY date_commande DESC LIMIT 1
  `;

  db.query(findCommandeSql, [livreur.id], (err, result) => {
    if (err) {
      console.error("Erreur SQL recherche commande :", err);
      return res.status(500).json({ success: false, message: 'Erreur BDD' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucune commande active trouvée' });
    }

    const commandeId = result[0].id;

    // Mise à jour des coordonnées
    const updateSql = `
      UPDATE commande 
      SET latitude_li = ?, longitude_li = ? 
      WHERE id = ?
    `;

    db.query(updateSql, [latitude_li, longitude_li, commandeId], (err) => {
      if (err) {
        console.error("Erreur SQL update :", err);
        return res.status(500).json({ success: false, message: 'Erreur mise à jour position' });
      }

      return res.json({ success: true, message: 'Position mise à jour' });
    });
  });
};



exports.getLivreurPosition = (req, res) => {
  const livreurId = req.params.id;

  const sql = `
    SELECT latitude_li, longitude_li
    FROM commande
    WHERE livreur_id = ? AND statut = 1 AND statut_2 = 1 AND statut_3 = 0
    ORDER BY date_commande DESC
    LIMIT 1
  `;

  db.query(sql, [livreurId], (err, result) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ message: 'Erreur BDD' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Aucune position trouvée' });
    }

    return res.json(result[0]);
  });
};



