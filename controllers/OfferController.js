const OfferRepository = require('../services/OfferRepository');

exports.searchOffers = async (req, res) => {
  try {
    const { type, skills, city, contract, minexperience, language, offerType, page, pageSize, sortPublicationDate, sortDeadlineDate } = req.query;
    const result = await OfferRepository.searchOffers(
        { type, skills, city, contract, minexperience, language, offerType }, 
        page, 
        pageSize, 
        sortPublicationDate, 
        sortDeadlineDate
      );
    res.status(200).json({
        status: 200,
        data : result
    });
  } catch (err) {}
};
