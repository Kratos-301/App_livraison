module.exports = (req, res, next) => {
  if (!req.session.client) return res.redirect('/connect');
  next();
  function requireClientAuth(req, res, next) {
  if (!req.session.client) {
    return res.status(401).json({ message: 'Non autorisé' });
  }
  next();
}

};
