const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientAuthController');

// 🔐 Authentification client
router.get('/loginUser', clientController.loginForm);
router.post('/loginUser', clientController.login);

router.get('/registerUser', clientController.registerForm);
router.post('/registerUser', clientController.register);

module.exports = router;
