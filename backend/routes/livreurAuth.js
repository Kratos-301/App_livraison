const express = require('express');
const router = express.Router();
const controller = require('../controllers/livreurAuthController');

// Auth
router.get('/loginUser', controller.loginForm);
router.post('/loginUser', controller.login);

router.get('/registerUser', controller.registerForm);
router.post('/registerUser', controller.register);

// Pages
router.get('/commande/html/page/accueil', controller.accueilClient);
router.get('/commande/html/page/acc-livreur', controller.accueilLivreur);

module.exports = router;
