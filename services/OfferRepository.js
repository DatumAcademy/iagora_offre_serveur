var { Offer } = require("../models/Offer");
var configuraation = require('../configuration/SECRET');
var ObjectID = require("mongoose").Types.ObjectId;

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