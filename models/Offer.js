const mongoose = require( 'mongoose')
const Schema = mongoose.Schema;
  
const languageSchema = new mongoose.Schema({
    id: String,
    label: String,
    level: String
});

const detailOfferSchema = new mongoose.Schema({
    id: String,
    label: String,
    company: String,
    shortDescription : String,
    skills: String,
    contract : String,
    type: String,
    city: String,
    publicationdate : Date,
    deadlinedate : Date,
    minexperience : Number,
    language: languageSchema
});


const OfferSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    type: {type:String},
    offers : [detailOfferSchema]
});

let Offer = mongoose.model("Offer", OfferSchema,"Offer");

module.exports = {Offer}