var { Offer } = require("../models/Offer");
var configuraation = require('../configuration/SECRET');
const mongoose = require('mongoose');
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

  function convertToFormattedDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${day}-${month}-${year}`;
  }

  function formatToDateString(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  exports.createOffer = async (offerData) => {
    try {
      const { type, offers } = offerData;

      const offersWithFormattedDates = offers.map(offer => {
        const publicationDate = offer.publicationdate ? new Date(offer.publicationdate) : new Date();
        const deadlineDate = offer.deadlinedate ? new Date(offer.deadlinedate) : null;
  
        return {
          ...offer,
          publicationdate: formatToDateString(publicationDate),
          deadlinedate: deadlineDate ? formatToDateString(deadlineDate) : "",
          id: new mongoose.Types.ObjectId()
        };
      });

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
      throw new Error(err.message);
    }
  };

  exports.getOfferDetails = async (offerId) => {
    try {
      const offer = await Offer.findOne(
        { "offers.id": offerId },
        { "offers.$": 1, type: 1 }
      );
  
      if (!offer) {
        throw new Error("Aucune offre correspondante!");
      }

      const offerDetails = offer.offers[0];
      const typeOffre = offer.type;
  
      return {
        id: offerDetails.id,
        label: offerDetails.label,
        company: offerDetails.company,
        shortdescription: offerDetails.shortdescription,
        skills: offerDetails.skills,
        contract: offerDetails.contract,
        type: offerDetails.type,
        city: offerDetails.city,
        publicationdate: offerDetails.publicationdate,
        deadlinedate: offerDetails.deadlinedate,
        minexperience: offerDetails.minexperience,
        language: offerDetails.language,
        typeOffre: typeOffre
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };

  exports.deleteOffer = async (offerId) => {
    try {
      const result = await Offer.updateOne(
        { "offers.id": offerId },
        { $pull: { offers: { id: offerId } } }
      );
  
      if (result.modifiedCount === 0) {
        throw new Error("Offre non trouvée ou n'a pas pu être supprimée!");
      }
      return { message: "Offre supprimée avec succès!" };
    } catch (err) {
      throw new Error(err.message);
    }
  };

  exports.getStatistique = async () => {
    try {
      const result = await Offer.aggregate([
        { $unwind: "$offers" },
        {
          $project: {
            skillsArray: { $split: ["$offers.skills", ", "] },
            candidateCount: { $size: "$offers.candidate" }
          }
        },
        { $unwind: "$skillsArray" },
        {
          $group: {
            _id: "$skillsArray",
            totalCandidates: { $sum: "$candidateCount" }
          }
        },
        {
          $project: {
            _id: 0,
            skill: "$_id",
            result: "$totalCandidates"
          }
        }
      ]);
  
      return result;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  exports.getStudentCandidate = async (studentId, page = 1, pageSize = 20) => {
    try {
      const pageNum = Number(page) || 1;
      const pageSizeNum = Number(pageSize) || 20;
      const studentIdNum = parseInt(studentId, 10);

      const totalResults = await Offer.aggregate([
        { $unwind: "$offers" },
        { $match: { "offers.candidate.student": studentIdNum } },
        { $count: "total" }
      ]);
  
      const total = totalResults.length > 0 ? totalResults[0].total : 0;
      const totalPages = Math.ceil(total / pageSizeNum);

      const applications = await Offer.aggregate([
        { $unwind: "$offers" },
        {
          $match: {
            "offers.candidate.student": studentIdNum
          }
        },
        { $skip: (pageNum - 1) * pageSizeNum },
        { $limit: pageSizeNum },
        {
          $project: {
            _id: 0,
            id: "$offers.id",
            label: "$offers.label",
            company: "$offers.company",
            shortdescription: "$offers.shortdescription",
            skills: "$offers.skills",
            contract: "$offers.contract",
            type: "$offers.type",
            city: "$offers.city",
            publicationdate: "$offers.publicationdate",
            deadlinedate: "$offers.deadlinedate",
            minexperience: "$offers.minexperience",
            language: "$offers.language",
            candidate: "$offers.candidate",
            typeOffre: "$type"
          }
        }
      ]);
  
      return {
        status: 200,
        data: {
          totalPages: totalPages,
          currentPage: pageNum,
          pageSize: pageSizeNum,
          totalResults: total,
          offers: applications
        }
      };
    } catch (err) {
      throw new Error(err.message);
    }
  };
  