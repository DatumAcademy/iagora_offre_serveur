const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;
  
const languageSchema = new mongoose.Schema({
    id: String,
    label: String,
    level: String
});

const candidateSchema = new mongoose.Schema({
    student : Number
});

const detailOfferSchema = new mongoose.Schema({
    id: String,
    label: String,
    company: String,
    shortdescription : String,
    skills: String,
    contract : String,
    type: String,
    city: String,
    publicationdate : String,
    deadlinedate : String,
    minexperience : Number,
    language: languageSchema,
    candidate : [candidateSchema]
});


const OfferSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {type:String},
    offers : [detailOfferSchema]
});

let Offer = mongoose.model("MergedOffers", OfferSchema,"MergedOffers");

module.exports = {Offer}