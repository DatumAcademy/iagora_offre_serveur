const express = require('express');
const router = express.Router();
const offerController = require('../controllers/OfferController');

router.get('/search', offerController.searchOffers);
router.post('/create', offerController.createOffer);
router.get('/:id', offerController.getOfferDetails);
router.delete('/:id', offerController.deleteOffer);

module.exports = router;