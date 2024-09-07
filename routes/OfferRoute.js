const express = require('express');
const router = express.Router();
const offerController = require('../controllers/OfferController');

router.get('/statistics', offerController.getStatistique);
router.get('/:id', offerController.getOfferDetails);
router.get('/search', offerController.searchOffers);
router.post('/create', offerController.createOffer);
router.delete('/:id', offerController.deleteOffer);

module.exports = router;