
const db = require('../config/db');
const bcrypt = require('bcrypt');


exports.loginForm = (req, res) => {
  res.render('html/auth/loginUser');
};



exports.login = (req, res) => {
  const { email, motdepasse } = req.body;

  if (!email || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
  }

  db.query('SELECT * FROM livreuruser WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Email incorrect' });
    }

    const livreur = results[0];

    try {
      const match = await bcrypt.compare(motdepasse, livreur.motdepasse);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
      }

      // ✅ Met à jour isOnline = 1
      db.query('UPDATE livreuruser SET isOnline = 1 WHERE id = ?', [livreur.id], (updateErr) => {
        if (updateErr) {
          console.error('Erreur mise à jour isOnline :', updateErr);
          return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }

        req.session.livreur = {
          id: livreur.id,
          nom: livreur.nom,
          email: livreur.email
        };
        req.session.isAuthenticated = true;

        // ✅ Envoie réponse JSON au frontend React
        return res.json({
          success: true,
          message: 'Connexion réussie',
          livreur: {
            id: livreur.id,
            nom: livreur.nom,
            email: livreur.email
          }
        });
      });

    } catch (err) {
      console.error('Erreur bcrypt :', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la vérification du mot de passe' });
    }
  });
};


// ⏩ GET - Register form
exports.registerForm = (req, res) => {
  res.render('html/auth/registerUser', { erreur: null });
};



// ⏩ POST - Register logic
exports.register = async (req, res) => {
  const { nom, email, telephone, marque_moto, motdepasse, confirmation } = req.body;

  if (!nom || !email || !telephone || !marque_moto || !motdepasse || !confirmation) {
    return res.render('html/auth/registerUser', { erreur: 'Veuillez remplir tous les champs' });
  }

  if (motdepasse !== confirmation) {
    return res.render('html/auth/registerUser', { erreur: 'Les mots de passe ne correspondent pas' });
  }

  try {
    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    

    db.query(
      'INSERT INTO livreuruser (nom, email, telephone, marque_moto, motdepasse, isOnline) VALUES (?, ?, ?, ?, ?, 1)',
      [nom, email, telephone, marque_moto, hashedPassword],
      (err) => {
        if (err) {
          console.error('Erreur MySQL :', err);
          return res.render('html/auth/registerUser', { erreur: 'Erreur lors de l\'inscription' });
        }

        res.redirect('/commande/html/page/acc-livreur');
      }
    );
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    res.render('html/auth/registerUser', { erreur: 'Erreur serveur' });
  }
};



// ⏩ GET - Page client
exports.accueilClient = (req, res) => {
  const livreur = req.session.livreur;

  if (!livreur || !livreur.id) {
    return res.redirect('/html/auth/loginUser');
  }

  const sql = 'SELECT id, nom, email, telephone, marque_moto FROM livreuruser';
  db.query(sql, (err, livreurs) => {
    if (err) return res.status(500).send('Erreur DB');

    res.render('html/page/accueil', {
      livreur,
      livreurs,
      isAuthenticated: req.session.isAuthenticated
    });
  });
};



// ⏩ GET - Page livreur
exports.accueilLivreur = (req, res) => {
  const livreur = req.session.livreur;

  if (!livreur || !livreur.id) {
    return res.redirect('/html/auth/loginUser');
  }

  const sql = 'SELECT id, nom, email, telephone, marque_moto FROM livreuruser';
  db.query(sql, (err, livreurs) => {
    if (err) return res.status(500).send('Erreur DB');

    res.render('html/page/acc-livreur', {
      livreur,
      livreurs
    });
  });
};
