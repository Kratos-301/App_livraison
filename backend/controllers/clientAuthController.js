const db = require('../config/db');
const bcrypt = require('bcrypt');


// 🟩 Formulaire d’inscription (GET)
exports.registerForm = (req, res) => {
  res.json({ success: true });
};

// 🟩 Formulaire de login (GET)
exports.loginForm = (req, res) => {
  res.json({ success: true });
};




// 🟩 Traitement de connexion ancient client
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





// 🟩 Traitement d’inscription (Nouveau client)

exports.register = async (req, res) => {
  const { nom, email, telephone, motdepasse, confirmation } = req.body;

  if (!nom || !email || !telephone || !motdepasse || !confirmation) {
    return res.send('Veuillez remplir tous les champs');
  }

  if (motdepasse !== confirmation) {
    return res.send('Les mots de passe ne correspondent pas');
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    db.query('SELECT * FROM clientuser WHERE telephone = ?', [telephone], async (err, results) => {
      if (err) {
        console.error('Erreur MySQL :', err);
        return res.send('Erreur serveur');
      }

      if (results.length > 0) {
        return res.send('Ce numéro est déjà utilisé');
      }

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(motdepasse, 10);

      // Insertion en BDD
      db.query(
        'INSERT INTO clientuser (nom, email, telephone, motdepasse) VALUES (?, ?, ?, ?)',
        [nom, email, telephone, hashedPassword],
        (err, result) => {
          if (err) {
            console.error('Erreur MySQL :', err);
            return res.send("Erreur lors de l'inscription");
          }

          const userId = result.insertId;

          // Initialiser la session comme dans login
          req.session.client = {
            id: userId,
            telephone: telephone,
            nom: nom
          };
          req.session.isAuthenticated = true;

          res.json({ success: true });
        }
      );
    });
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    res.send('Erreur serveur');
  }
};

