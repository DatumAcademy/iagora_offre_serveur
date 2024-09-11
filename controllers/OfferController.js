const OfferRepository = require('../services/OfferRepository');

exports.searchOffers = async (req, res) => {
  try {
    const { type, skills, label,city, contract, minexperience, language, offerType, page, pageSize, sortPublicationDate, sortDeadlineDate } = req.query;
    const result = await OfferRepository.searchOffers(
        { type, skills, label,city, contract, minexperience, language, offerType }, 
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

exports.createOffer = async (req, res) => {
  try {
    const offerData = req.body; 
    const newOffer = await OfferRepository.createOffer(offerData);
    res.status(201).json({
      status: 201,
      message: "Offre créer avec succés!"
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.getOfferDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await OfferRepository.getOfferDetails(id);
    res.status(200).json({
      status: 200,
      data: offer,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await OfferRepository.deleteOffer(id);
    res.status(200).json({
      status: 200,
      message: result.message,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

exports.getStatistique = async (req, res) => {
  try {
    const result = await OfferRepository.getStatistique();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStudentCandidate = async (req, res) => {
  try {
    const { numETU } = req.params;
    const { page, pageSize,type, skills, label } = req.query;
    const result = await OfferRepository.getStudentCandidate({type, skills, label},numETU, page, pageSize);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};