const db = require('../config/db');

function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log("🔗 Client connecté:", socket.id);

    // Le client rejoint une room spécifique
    socket.on('joinRoom', (cmdId) => {
      socket.join(`cmd_${cmdId}`);
      console.log(`Client ${socket.id} a rejoint la room cmd_${cmdId}`);
    });

    // Lorsqu’un livreur s'enregistre
    socket.on('registerLivreur', (livreurId) => {
      socket.livreurId = livreurId;
      db.query("UPDATE livreuruser SET isOnline = 1 WHERE id = ?", [livreurId], (err) => {
        if (err) {
          console.error("❌ Erreur mise à jour online :", err);
        } else {
          console.log("🟢 Livreur en ligne :", livreurId);
          io.emit('livreurStatusChange', { id: livreurId, status: 'online' });
        }
      });
    });

    // Lorsqu’un livreur se déconnecte
    socket.on('disconnect', () => {
      console.log("❌ Déconnecté :", socket.id);
      const livreurId = socket.livreurId;
      if (!livreurId) return;

      // 1. Marquer le livreur hors ligne
      db.query("UPDATE livreuruser SET isOnline = 0 WHERE id = ?", [livreurId], (err) => {
        if (err) {
          console.error("❌ Erreur mise à jour offline :", err);
        } else {
          console.log("🔴 Livreur hors-ligne :", livreurId);
          io.emit('livreurStatusChange', { id: livreurId, status: 'offline' });
        }
      });

      // 2. Trouver la commande active
      db.query(`
        SELECT id 
        FROM commande 
        WHERE id_livreur = ? AND statut = 1 AND statut_2 = 1 AND statut_3 = 0 
        LIMIT 1
      `, [livreurId], (err, results) => {
        if (err) {
          console.error("❌ Erreur récupération commande :", err);
          return;
        }

        if (results.length > 0) {
          const commandeId = results[0].id;

          // 3. Annuler la commande + remettre dispo + raison annulation
          db.query(`
            UPDATE commande 
            SET statut_3 = 1, disponibilite = 1 
            WHERE id = ?
          `, [commandeId], (err2) => {
            if (err2) {
              console.error("❌ Erreur annulation commande :", err2);
            } else {
              console.log(`🚫 Commande ${commandeId} annulée (déconnexion)`);

              // 4. Notifier la room
              io.to(`cmd_${commandeId}`).emit("commandeAnnulee", {
                message: "Le livreur s'est déconnecté. La commande est annulée.",
                commandeId
              });
            }
          });
        }
      });
    });
  });
}

module.exports = handleSocket;
