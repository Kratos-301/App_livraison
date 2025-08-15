const db = require('../config/db');

const connectedLivreurs = new Map(); // { livreurId: { socketId, timeout } }

function handleSocket(io) {
  io.on('connection', (socket) => {
    console.log("🔗 Client connecté:", socket.id);

    // Joindre une room spécifique (client)
    socket.on('joinRoom', (cmdId) => {
      socket.join(`cmd_${cmdId}`);
      console.log(`Client ${socket.id} a rejoint la room cmd_${cmdId}`);
    });

    // Enregistrement du livreur
    socket.on('registerLivreur', (livreurId) => {
      socket.livreurId = livreurId;

      const existing = connectedLivreurs.get(livreurId);
      const isReconnect = existing && existing.timeout;

      // Si le livreur avait un timeout (déconnexion), on l'annule
      if (isReconnect) {
        clearTimeout(existing.timeout);
        console.log(`⏳ Timeout annulé pour livreur ${livreurId}`);
      }

      connectedLivreurs.set(livreurId, { socketId: socket.id });

      // Mettre à jour le statut uniquement si c'est un nouveau enregistrement (pas un simple refresh)
      if (!isReconnect) {
        db.query("UPDATE livreuruser SET isOnline = 1 WHERE id = ?", [livreurId], (err) => {
          if (err) {
            console.error("❌ Erreur mise à jour online :", err);
          } else {
            console.log("🟢 Livreur en ligne :", livreurId);
            io.emit('livreurStatusChange', { id: livreurId, status: 'online' });
          }
        });
      }
    });

    // Déconnexion
    socket.on('disconnect', () => {
      const livreurId = socket.livreurId;
      if (!livreurId) return;

      console.log("❌ Socket déconnectée :", socket.id);

      const timeout = setTimeout(() => {
        const stored = connectedLivreurs.get(livreurId);
        if (!stored || stored.socketId === socket.id) {
          connectedLivreurs.delete(livreurId);

          // 1. Mettre à jour offline
          db.query("UPDATE livreuruser SET isOnline = 0 WHERE id = ?", [livreurId], (err) => {
            if (err) {
              console.error("❌ Erreur mise à jour offline :", err);
            } else {
              console.log("🔴 Livreur hors ligne :", livreurId);
              io.emit('livreurStatusChange', { id: livreurId, status: 'offline' });
            }
          });

          // 2. Vérifier commande en cours
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
              const sqlUpdate = "UPDATE commande SET statut_2 = 1, statut_3 = 1, disponibilite = 1 , passation = 'PasEncore' WHERE id = ?";
              db.query(sqlUpdate, [commandeId], (err) => {
                if (err) {
                  console.error("❌ Erreur annulation commande :", err);
                  return;
                }

                console.log(`🚫 Commande ${commandeId} annulée car livreur déconnecté`);

                // 4. Notifier la room du client
                io.to(`cmd_${commandeId}`).emit("commandeAnnulee", {
                  message: "Le livreur s'est déconnecté. Commande annulée.",
                  commandeId,
                });
              });
            }
          });
        }
      }, 5000); // délai de grâce de 5 secondes

      connectedLivreurs.set(livreurId, { socketId: socket.id, timeout });
    });
  });
}

module.exports = handleSocket;
