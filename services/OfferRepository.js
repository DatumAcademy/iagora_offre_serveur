var { Offer } = require("../models/Offer");
var configuraation = require('../configuration/SECRET');
const mongoose = require('mongoose');

exports.searchOffers = async (filters, page, pageSize, sortPublicationDate = 'DESC', sortDeadlineDate = 'DESC') => {
    const pageNum = Number(page) || 0;
    const pageSizeNum = Number(pageSize) || 10;
  
    const match = {
      ...(filters.type && { type: filters.type }),
      ...(filters.skills && { "offers.skills": { $regex: filters.skills, $options: 'i' } }),
      ...(filters.city && { "offers.city": filters.city }),
      ...(filters.contract && { "offers.contract": filters.contract }),
      ...(filters.minexperience && { "offers.minexperience": { $gte: Number(filters.minexperience) } }),
      ...(filters.language && { "offers.language.label": filters.language }),
      ...(filters.offerType && { "offers.type": filters.offerType }), 
    };

    const sortOrderPublicationDate = sortPublicationDate === 'ASC' ? 1 : -1;
    const sortOrderDeadlineDate = sortDeadlineDate === 'ASC' ? 1 : -1;
  
    const totalResults = await Offer.aggregate([
      { $unwind: "$offers" },
      { $match: match },
      { $count: "total" }
    ]);
  
    const total = totalResults.length > 0 ? totalResults[0].total : 0;
  
    let totalPages = Math.floor(total / pageSizeNum);
    if (total % pageSizeNum !== 0) {
      totalPages += 1;
    }
  
    const offers = await Offer.aggregate([
      { $unwind: "$offers" },
      { $match: match },
      { $sort: { "offers.publicationdate": sortOrderPublicationDate, "offers.deadlinedate": sortOrderDeadlineDate } },
      { $skip: pageNum * pageSizeNum },
      { $limit: pageSizeNum },
      {
        $addFields: {
          "offers.typeOffre": "$type"
        }
      },
      {
        $replaceRoot: { newRoot: "$offers" }
      }
    ]);
  
    return {
      totalPages,
      currentPage: pageNum,
      pageSize: pageSizeNum,
      totalResults: total,
      offers,
    };
  };

  function convertToFormattedDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${day}-${month}-${year}`;
  }

  exports.createOffer = async (offerData) => {
    try {
      const { type, offers } = offerData;

      const offersWithFormattedDates = offers.map(offer => ({
        ...offer,
        publicationdate: convertToFormattedDate(offer.publicationdate),
        deadlinedate: convertToFormattedDate(offer.deadlinedate),
        id: new mongoose.Types.ObjectId()
      }));

      let existingOffer = await Offer.findOne({ type: type });
  
      if (existingOffer) {
        existingOffer.offers.push(...offersWithFormattedDates);
        await existingOffer.save();
        return existingOffer;
      } else {
        const newOffer = new Offer({
          _id: new mongoose.Types.ObjectId(),
          type: type,
          offers: offersWithFormattedDates
        });
  
        await newOffer.save();
        return newOffer;
      }
    } catch (err) {
      throw new Error('Error creating the offer: ' + err.message);
    }
  };