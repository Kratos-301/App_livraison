// === controllers/deliveryController.js ===


const model = require('../models/deliveryModel');
const db = require('../config/db');

let io;

exports.setSocketIo = function(socketIoInstance) {
  io = socketIoInstance;
};



// Les Reacts


exports.creerDelivery = (req, res) => {
     console.log("👉 Reçu dans creerDelivery:", req.body);
const {
  client_id, livreur_id, commande_id,
  choix, prix, confirm_client,
  confirm_livreur, confirmation, actif
} = req.body;

if (!client_id || !livreur_id || !commande_id || !choix || !prix || !confirm_client || !confirm_livreur || !confirmation || !actif ) {
  return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
}

      const data = [
        client_id,
        livreur_id,
        commande_id,
        choix || null,
        prix || null,
        confirm_client || null,
        confirm_livreur || null,
        confirmation || null,
        actif !== undefined ? actif : 0
      ];

      model.insertDelivery(data, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erreur lors de l’enregistrement deliveryLi1' });

        const cmdId = result.insertId;

        io.emit('deliveryCreated', { id: cmdId, client_id, livreur_id });
        io.emit('occupe', { livreurId: livreur_id });

        return res.json({ success: true, message: 'Commande envoyée avec succès', id: cmdId });
      });
};


exports.DeliveryClient = (req, res) => {
  const client = req.session.client;
  if (!client || !client.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  model.getDeliveryLivreur(client.id, (err, result) => {
     if (err) {
       console.error('Erreur BDD :', err);
       return res.status(500).json({ success: false, message: 'Erreur base de données' });
     }
 
     const deliverys = result.length > 0 ? result[0] : null;
 
     return res.json({
       success: true,
       client,
       deliverys,
       timestamp: Date.now()
     });
   });
 };

exports.DeliveryLivreur = (req, res) => {
  const livreur = req.session.livreur;
  if (!livreur || !livreur.id) {
    return res.status(401).json({ success: false, message: 'Non authentifié' });
  }

  model.getDeliveryLivreur(livreur.id, (err, result) => {
     if (err) {
       console.error('Erreur BDD :', err);
       return res.status(500).json({ success: false, message: 'Erreur base de données' });
     }
 
     const delivery = result.length > 0 ? result[0] : null;
 
     return res.json({
       success: true,
       livreur,
       delivery,
       timestamp: Date.now()
     });
   });
 };



exports.DeliLivreur = (req, res) => {
  const id = req.params.id;
  const data = req.body; 

  model.DeliLivreurUpdade(id, data, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur facturation' });

    model.getDeliveryById(id, (err5, delivery) => {
      if (!err5 && delivery) {
        io.emit('occupe', { livreurId: delivery.livreur_id });
        io.to(`cmd_${id}`).emit('DeliveryValider', { id, type: 'DeliveryValider' });
        io.emit('DeliveryValider', {
          id,
          client_id: delivery.client_id,
          livreur_id: delivery.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Facturation enregistrée' });
  });
};


exports.DeliLivreurTerminer = (req, res) => {
  const id = req.params.id;
  const data = req.body; 

  model.DeliLivreurUpdadeTerminer(id, data, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur facturation' });

    model.getDeliveryById(id, (err5, delivery) => {
      if (!err5 && delivery) {
        io.emit('occupe', { livreurId: delivery.livreur_id });
        io.to(`cmd_${id}`).emit('DeliveryValider', { id, type: 'DeliveryValider' });
        io.emit('DeliveryValider', {
          id,
          client_id: delivery.client_id,
          livreur_id: delivery.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Facturation enregistrée' });
  });
};


exports.DeliClient = (req, res) => {
    console.log("📥 Requête reçue :", req.params.id, req.body);
  const id = req.params.id;
  const data = req.body;

  console.log("Reçu dans le body :", data);


  model.DeliClientUpdade(id, data, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur facturation' });


    model.getDeliveryById(id, (err5, delivery) => {
      if (!err5 && delivery) {
        io.emit('occupe', { livreurId: delivery.livreur_id });
        io.to(`cmd_${id}`).emit('DeliveryValider', { id, type: 'DeliveryValider' });
        io.emit('DeliveryValider', {
          id,
          client_id: delivery.client_id,
          livreur_id: delivery.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'Facturation enregistrée' });
  });
};




exports.AnnulationDeliveryLivreur = (req, res) => {
  const id = req.params.id;

  model.annulerDeliveryL(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getDeliveryById(id, (err2, delivery) => {
      if (!err2 && delivery) {
        const livreurId = delivery.livreur_id;

        // 🟢 Notifier tous les clients que le livreur est libre
        io.emit('livreurStatusChange', {
          id: livreurId,
          status: 'disponible'  // ou "disponible"
        });

        // 🔁 Notifier la room spécifique
        io.to(`cmd_${id}`).emit('commandeAnnulee', {
          id,
          type: 'annulation'
        });

        // 🔔 Notifier tout le monde
        io.emit('commandeAnnulee', {
          id,
          client_id: delivery.client_id,
          livreur_id: livreurId,
          message: "Votre delivery a été annulée"
        });
      }
    });
  });
};



exports.AnnulationDeliveryClient = (req, res) => {
  const id = req.params.id;
  model.annulerDeliveryC(id, (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Erreur annulation' });

    model.getDeliveryById(id, (err2, delivery) => {
      if (!err2 && delivery) {
        io.emit('livreurLibre', { livreurId: delivery.livreur_id });
        io.to(`cmd_${id}`).emit('update', { id, type: 'annulation' });
        io.emit('commandeAnnulee', {
          id,
          client_id: delivery.client_id,
          livreur_id: delivery.livreur_id
        });
      }
    });

    return res.json({ success: true, message: 'delivery annulée' });
  });
};
