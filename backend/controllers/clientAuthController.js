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
// exports.login = (req, res) => {
//   const { telephone, motdepasse } = req.body;

//   if (!telephone || !motdepasse) {
//     return res.send('Veuillez remplir tous les champs');
//   }

//   db.query('SELECT * FROM clientuser WHERE telephone = ?', [telephone], async (err, results) => {
//     if (err) {
//       console.error('Erreur MySQL :', err);
//       return res.send('Erreur serveur');
//     }

//     if (results.length === 0) {
//       return res.send('Téléphone incorrect');
//     }

//     const client = results[0];

//     try {
//       const match = await bcrypt.compare(motdepasse, client.motdepasse);
//       if (!match) {
//         return res.send('Mot de passe incorrect');
//       }

//       req.session.client = {
//         id: client.id,
//         telephone: client.telephone,
//         nom: client.nom
//       };
//       req.session.isAuthenticated = true;

//       res.json({ success: true });
//     } catch (err) {
//       console.error('Erreur bcrypt :', err);
//       return res.send('Erreur lors de la vérification du mot de passe');
//     }
//   });
// };

exports.login = (req, res) => {
  const { telephone, motdepasse } = req.body;

  if (!telephone || !motdepasse) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
  }

  db.query('SELECT * FROM clientuser WHERE telephone = ?', [telephone], async (err, results) => {
    if (err) {
      console.error('Erreur MySQL :', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Téléphone incorrect' });
    }

    const client = results[0];

    try {
      const match = await bcrypt.compare(motdepasse, client.motdepasse);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
      }

      req.session.client = {
        id: client.id,
        telephone: client.telephone,
        nom: client.nom,
        longi: client.longitude,
        lati: client.latitude
      };
      req.session.isAuthenticated = true;

      return res.json({ 
        success: true,
        message: 'Connexion réussie',
        longi: client.longitude,
        lati: client.latitude
         });
    } catch (err) {
      console.error('Erreur bcrypt :', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la vérification du mot de passe' });
    }
  });
};




// 🟩 Traitement d’inscription (Nouveau client)

exports.register = async (req, res) => {
  let { nom, email, telephone, motdepasse, confirmation } = req.body;

  // Suppression des espaces avant/après
  nom = nom?.trim();
  email = email?.trim();
  telephone = telephone?.trim();
  motdepasse = motdepasse?.trim();
  confirmation = confirmation?.trim();

  // Vérification des champs obligatoires
  if (!nom  || !telephone || !motdepasse || !confirmation) {
    return res.status(400).json({ success: false, message: "Veuillez remplir tous les champs" });
  }

  // Vérification email obligatoire + format valide
  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // if (!emailRegex.test(email)) {
  //   return res.status(401).json({ success: false, message: "L'email est invalide" });
  // }

  // Vérification mot de passe
  if (motdepasse !== confirmation) {
    return res.status(402).json({ success: false, message: "Les mots de passe sont différents" });
  }

  // Vérification format téléphone : commence par 0, 10 chiffres exacts
  const telRegex = /^0\d{9}$/;
  if (!telRegex.test(telephone)) {
    return res.status(403).json({ success: false, message: "Le téléphone doit commencer par 0 et contenir exactement 10 chiffres" });
  }

  try {
    // Vérifier si l'utilisateur existe déjà par téléphone
    db.query('SELECT * FROM clientuser WHERE telephone = ?', [telephone], async (err, results) => {
      if (err) {
        console.error('Erreur MySQL :', err);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
      }

      if (results.length > 0) {
        return res.status(404).json({ success: false, message: "Ce numéro est déjà lié à un compte" });
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
            return res.status(405).json({ success: false, message: "Erreur lors de l'inscription" });
          }

          const userId = result.insertId;

          // Initialisation de la session
          req.session.client = {
            id: userId,
            telephone,
            nom
          };
          req.session.isAuthenticated = true;

          res.json({ success: true });
        }
      );
    });
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


