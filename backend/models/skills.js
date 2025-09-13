// //  EDIT PROFILE - SKILLS SCHEMA

const mongoose = require('mongoose');
const skillsSchema = new mongoose.Schema({
        userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserIntern', // Assumes your user model is named 'UserIntern'
        required: true, 
        unique: true // Each user can only have one profile document
    },
    items: [String] // A simple array of skill names
});
module.exports = mongoose.model('Skills', skillsSchema);