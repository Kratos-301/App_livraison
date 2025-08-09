const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/deliveryController');



//Envoie de données vers la BD Initialement
router.post('/deliLivreur', ctrl.creerDelivery);


//Envoie vers la BD Interraction

router.post('/deliclient/:id', ctrl.DeliClient);

router.post('/delilivreur/:id', ctrl.DeliLivreur);

router.post('/delilivreurTerminerpopo/:id', ctrl.DeliLivreurTerminer);


//Section annulation après arrivée du livreur

router.post('/annulerLivreur/:id', ctrl.AnnulationDeliveryLivreur);

router.post('/annulerClient/:id', ctrl.AnnulationDeliveryClient);



//Reception des données depuis la BD sue l'ecran accueil
router.get('/deliClient', ctrl.DeliveryClient);
router.get('/deliLivreur', ctrl.DeliveryLivreur);

module.exports = router;