
//=========clientlogout.js= =========

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Déconnexion du client
router.get('/logoutClient', (req, res) => {
    console.log("🧪 Route /logoutClient appelée");
  const userId = req.session?.client?.id;

  if (!userId) return res.redirect('/');

  db.query('UPDATE clientuser SET isOnline = 0 WHERE id = ?', [userId], (err) => {
    if (err) {
      console.error('Erreur mise à jour isOnline client :', err);
      return res.redirect('/commande/html/page/accueil');
    }
    // 🔐 On détruit uniquement la session client
    delete req.session.client;
    delete req.session.isClientAuthenticated;
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur de session :', err);
        return res.redirect('/client/pages/Accueil');
      }

      res.redirect('/');
    });
  });
});

module.exports = router;
