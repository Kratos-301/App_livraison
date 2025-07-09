module.exports = (req, res, next) => {
  if (!req.session.livreur) return res.redirect('/connect');
  next();
};