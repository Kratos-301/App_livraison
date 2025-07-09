const db = require('../config/db');
const bcrypt = require('bcrypt');

// 🟩 Formulaire de login (GET)
exports.loginForm = (req, res) => {
  res.json({ success: true });
};

// 🟩 Traitement login (POST)
exports.login = (req, res) => {
  const { telephone, motdepasse } = req.body;

  if (!telephone || !motdepasse) {
    return res.send('Veuillez remplir tous les champs');
  }

  db.query('SELECT * FROM clientuser WHERE telephone = ?', [telephone], async (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.send('Erreur serveur');
    }

    if (results.length === 0) {
      return res.send('Téléphone incorrect');
    }

    const client = results[0];

    try {
      const match = await bcrypt.compare(motdepasse, client.motdepasse);
      if (!match) {
        return res.send('Mot de passe incorrect');
      }

      req.session.client = {
        id: client.id,
        telephone: client.telephone,
        nom: client.nom
      };
      req.session.isAuthenticated = true;

      res.json({ success: true });
    } catch (err) {
      console.error('Erreur bcrypt :', err);
      return res.send('Erreur lors de la vérification du mot de passe');
    }
  });
};

// 🟩 Formulaire d’inscription (GET)
exports.registerForm = (req, res) => {
  res.json({ success: true });
};

// 🟩 Traitement d’inscription (POST)
exports.register = async (req, res) => {
  const { nom, email, telephone, motdepasse, confirmation } = req.body;

  if (!nom || !email || !telephone || !motdepasse || !confirmation) {
    return res.render('html/auth/registerUser', { erreur: 'Veuillez remplir tous les champs' });
  }

  if (motdepasse !== confirmation) {
    return res.render('html/auth/registerUser', { erreur: 'Les mots de passe ne correspondent pas' });
  }

  try {
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    db.query(
      'INSERT INTO clientuser (nom, email, telephone, motdepasse) VALUES (?, ?, ?, ?)',
      [nom, email, telephone, hashedPassword],
      (err) => {
        if (err) {
          console.error('Erreur MySQL :', err);
          return res.render('html/auth/registerUser', { erreur: 'Erreur lors de l\'inscription' });
        }

        res.json({ success: true });      }
    );
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    res.json({ success: true });
  }
};
