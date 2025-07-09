const express = require('express');
const router = express.Router();
const logoutController = require('../controllers/logoutController');

// Route de déconnexion
router.get('/', logoutController.logout);

module.exports = router;
