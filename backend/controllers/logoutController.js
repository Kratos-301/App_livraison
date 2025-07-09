exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erreur de déconnexion :', err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
};
