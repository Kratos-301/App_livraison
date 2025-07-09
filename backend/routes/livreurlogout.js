
//=========livreurlogout.js= =========

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Déconnexion du livreur
router.get('/logoutLivreur', (req, res) => {
    console.log("🧪 Route /logoutLivreur appelée");
  const userId = req.session?.livreur?.id;

  if (!userId) return res.redirect('/');

  db.query('UPDATE livreuruser SET isOnline = 0 WHERE id = ?', [userId], (err) => {
    if (err) {
      console.error('Erreur mise à jour isOnline livreur :', err);
      return res.redirect('/livreur/pages/Dashboard');
    }
    // 🔐 On détruit uniquement la session livreur
    delete req.session.livreur;
    delete req.session.isLivreurAuthenticated;
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Erreur de session :', err);
        return res.redirect('/livreur/pages/Dashboard');
      }

      res.redirect('/');
    });
  });
});

module.exports = router;
