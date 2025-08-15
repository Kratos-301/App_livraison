const db = require('../config/db');
const bcrypt = require('bcrypt');


exports.registerForm = (req, res) => {
  res.render('html/auth/registerUser', { erreur: null });
};


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
          email: livreur.email,
          marque_moto : livreur.marque_moto,
          telephone : livreur.telephone,
          lat : livreur.latitude_li,
          long : livreur.longitude_li,
          photo: livreur.pp,
          cni: livreur.num_cni,
          disponibilite: livreur.disponibilite,
          cerfic: livreur.certifyand
        };
        
        req.session.isAuthenticated = true;

        // ✅ Envoie réponse JSON au frontend React

        return res.json({
          success: true,
          message: 'Connexion réussie',
          livreur: {
            id: livreur.id,
            nom: livreur.nom,
            email: livreur.email,
            marque_moto : livreur.marque_moto,
            telephone : livreur.telephone,
            lat : livreur.latitude_li,
            long : livreur.longitude_li,
            photo: livreur.pp,
            cni: livreur.num_cni,
            disponibilite: livreur.disponibilite,
            cerfic: livreur.certifyand
          }
        });
      });

    } catch (err) {
      console.error('Erreur bcrypt :', err);
      return res.status(500).json({ success: false, message: 'Erreur lors de la vérification du mot de passe' });
    }
  });
};

// ⏩ Traitement du formulaire d'inscription 

exports.register888 = async (req, res) => {
  const { nom, email, telephone, marque_moto, num_cni, motdepasse, confirmation } = req.body;
  const photoProfil = req.file ? req.file.filename : null;

  if (!nom || !email || !telephone || !marque_moto || !num_cni || !motdepasse || !confirmation) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
  }

  if (motdepasse !== confirmation) {
    return res.status(401).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
  }

  try {
    const hashedPassword = await bcrypt.hash(motdepasse, 10);

    const insertQuery = `
      INSERT INTO livreuruser (nom, email, telephone, marque_moto, num_cni, pp, motdepasse, isOnline)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.query(insertQuery, [nom, email, telephone, marque_moto, num_cni, photoProfil, hashedPassword], (err, result) => {


      if (result.length > 0) {
        return res.status(402).json({success: false, message: "Ce mail est lié a un compte existant"});;
      }

      if (err) {
        console.error('Erreur MySQL :', err);
        return res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
      }


      const newLivreurId = result.insertId;

      // 🔐 Stocker la session après l'insertion
      req.session.livreur = {
        id: newLivreurId,
        nom,
        email
      };
      req.session.isAuthenticated = true;

        // ✅ Envoie réponse JSON au frontend React
        return res.json({
          success: true,
          message: 'Connexion réussie',
          livreur: {
            id: newLivreurId,
            nom,
            photo: photoProfil
          }
        });
    });
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};


exports.register = async (req, res) => {
  let { nom, email, telephone, marque_moto, num_cni, motdepasse, confirmation } = req.body;
  const photoProfil = req.file ? req.file.filename : null;

  // Suppression des espaces en début/fin
  nom = nom?.trim();
  email = email?.trim();
  telephone = telephone?.trim();
  marque_moto = marque_moto?.trim();
  num_cni = num_cni?.trim();
  motdepasse = motdepasse?.trim();
  confirmation = confirmation?.trim();

  if (!nom || !email || !telephone || !marque_moto || !num_cni || !motdepasse || !confirmation) {
    return res.status(400).json({ success: false, message: 'Veuillez remplir tous les champs' });
  }

  // Vérification du format téléphone : commence par 0, 10 chiffres, que des chiffres
  const telRegex = /^0\d{9}$/;
  if (!telRegex.test(telephone)) {
    return res.status(400).json({ success: false, message: "Le téléphone doit commencer par 0 et contenir exactement 10 chiffres sans lettres" });
  }

  if (motdepasse !== confirmation) {
    return res.status(401).json({ success: false, message: 'Les mots de passe ne correspondent pas' });
  }

  try {
    const checkQuery = `
      SELECT nom, email, telephone, num_cni FROM livreuruser
      WHERE nom = ? OR email = ? OR telephone = ? OR num_cni = ?
    `;
    db.query(checkQuery, [nom, email, telephone, num_cni], async (err, results) => {
      if (err) {
        console.error('Erreur MySQL :', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de la vérification des doublons' });
      }

      if (results.length > 0) {
        for (const row of results) {
          if (row.email === email) {
            return res.status(409).json({ success: false, message: 'Cet email est lié a un compte' });
          }
          if (row.telephone === telephone) {
            return res.status(409).json({ success: false, message: 'Ce téléphone est dlié a un compte' });
          }
          if (row.num_cni === num_cni) {
            return res.status(409).json({ success: false, message: 'Ce numéro CNI est lié a un compte' });
          }
          if (row.nom === nom) {
            return res.status(409).json({ success: false, message: 'Ce nom est lié a un compte' });
          }
        }
      }

      const hashedPassword = await bcrypt.hash(motdepasse, 10);

      const insertQuery = `
        INSERT INTO livreuruser (nom, email, telephone, marque_moto, num_cni, pp, motdepasse, isOnline)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `;
      db.query(insertQuery, [nom, email, telephone, marque_moto, num_cni, photoProfil, hashedPassword], (err, result) => {
        if (err) {
          console.error('Erreur MySQL :', err);
          return res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
        }

        const newLivreurId = result.insertId;

        req.session.livreur = {
          id: newLivreurId,
          nom,
          photo: photoProfil,
          telephone,
          marque_moto,
          cni :num_cni,
          email
        };
        req.session.isAuthenticated = true;

        return res.json({
          success: true,
          message: 'Inscription réussie',
          livreur: {
            id: newLivreurId,
            nom,
            photo: photoProfil,
            telephone,
            marque_moto,
            cni :num_cni,
            email
          }
        });
      });
    });
  } catch (error) {
    console.error('Erreur bcrypt :', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
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
