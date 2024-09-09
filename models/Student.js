const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const languageSchema = new mongoose.Schema({
    label: { type: String },
    level: { type: String }
});

const diplomaSchema = new mongoose.Schema({
    id: { type: String },
    label: { type: String }
});

const experienceSchema = new mongoose.Schema({
    label: { type: String },
    description: { type: String },
    company: { type: String },
    city: { type: String },
    yearsexperience: { type: Number },
    years: { type: String },
    skills: [{ type: String }]
});


const studentSchema = new mongoose.Schema({
    numETU: { type: Number, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number },
    email: { type: String, required: true},
    gender: { type: String, required: true },
    diploma : [diplomaSchema],
    skills: [{ type: String }],
    language: [languageSchema],
    experience: [experienceSchema]
});

const Student = mongoose.model('Student', studentSchema,'Student');

module.exports = { Student };
