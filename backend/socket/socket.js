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

      // Mettre le livreur en ligne
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

      // 1. Mettre hors ligne
      db.query("UPDATE livreuruser SET isOnline = 0 WHERE id = ?", [livreurId], (err) => {
        if (err) {
          console.error("❌ Erreur mise à jour offline :", err);
        } else {
          console.log("🔴 Livreur hors ligne :", livreurId);
          io.emit('livreurStatusChange', { id: livreurId, status: 'offline' });
        }
      });

      // 2. Trouver une commande en cours
      const sqlFind = `
        SELECT id FROM commande
        WHERE livreur_id = ? AND statut = 1 AND statut_2 = 1 AND statut_3 = 0
        LIMIT 1
      `;
      db.query(sqlFind, [livreurId], (err, results) => {
        if (err) {
          console.error("❌ Erreur recherche commande :", err);
          return;
        }

        if (results.length > 0) {
          const commandeId = results[0].id;

          // 3. Annuler la commande
          const sqlUpdate = "UPDATE commande SET statut_2 = 1 AND statut_3 = 1 WHERE id = ?";
          db.query(sqlUpdate, [commandeId], (err) => {
            if (err) {
              console.error("❌ Erreur annulation commande :", err);
              return;
            }

            console.log(`🚫 Commande ${commandeId} annulée car livreur déconnecté`);

            // 4. Notifier le client dans la room
            io.to(`cmd_${commandeId}`).emit("commande_annulee", {
              message: "Le livreur s'est déconnecté. Commande annulée.",
              commandeId,
            });
          });
        }
      });
    });
  });
}

module.exports = handleSocket;
