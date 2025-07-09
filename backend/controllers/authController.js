const bcrypt = require('bcrypt');
const Admin = require('../models/adminModel');

exports.getLogin = (req, res) => {
  res.render('auth/login');
};

exports.postLogin = (req, res) => {
  const { email, motdepasse } = req.body;

  if (!email || !motdepasse) return res.send('Veuillez remplir tous les champs');

  Admin.findByEmail(email, async (err, results) => {
    if (err) return res.send('Erreur serveur');
    if (results.length === 0) return res.send('Email incorrect');

    const user = results[0];
    const match = await bcrypt.compare(motdepasse, user.motdepasse);

    if (!match) return res.send('Mot de passe incorrect');

    req.session.user = { id: user.id, email: user.email };
    req.session.isAuthenticated = true;

    res.redirect('/');
  });
};

exports.postRegister = async (req, res) => {
  const { nom, prenom, email, motdepasse, confirmation, code, codeXXX } = req.body;

  if (!nom || !prenom || !email || !motdepasse || !confirmation || !code || !codeXXX)
    return res.render('auth/register', { erreur: 'Veuillez remplir tous les champs' });

  if (motdepasse !== confirmation)
    return res.render('auth/register', { erreur: 'Les mots de passe ne correspondent pas' });

  if (code !== codeXXX)
    return res.render('auth/alerte');

  try {
    const hashedPassword = await bcrypt.hash(motdepasse, 10);
    const hashedCode = await bcrypt.hash(code, 10);

    Admin.registerAdmin(
      { nom, prenom, email, motdepasse: hashedPassword, code: hashedCode },
      (err) => {
        if (err) return res.render('auth/register', { erreur: 'Erreur lors de l\'inscription' });
        res.redirect('/auth/login');
      }
    );
  } catch (err) {
    res.render('auth/register', { erreur: 'Erreur serveur' });
  }
};
