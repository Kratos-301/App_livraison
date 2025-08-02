const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/commandeController');

const isClient = require('../middlewares/clientAuth');
const isLivreur = require('../middlewares/livreurAuth');

router.get('/commandeClient', isClient);
router.get('/commandeLivreur', isLivreur);

// API pour React

router.post('/accueil', ctrl.creerCommande);
router.post('/annuler/:id', ctrl.annulerClient);

router.post('/annuler_li/:id', ctrl.annulerLivreur);
router.post('/terminer/:id', ctrl.terminerCommandeLivreur);
router.post('/fini/:id', ctrl.finiCommandeLivreur);
router.post('/confirmer/:id', ctrl.confirmerCommande);

router.get('/accueil', ctrl.apiAccueilClient);
router.get('/livreurAccueil', ctrl.apiAccueilLivreur);


router.post('/updatePosition', ctrl.updatePosition);
router.post('/updatePositionCli', ctrl.updatePositionCli);


router.get('/updatePosition/:id', ctrl.getLivreurPosition);




module.exports = router;
