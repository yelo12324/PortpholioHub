// models/internForm.js - FINAL COMPLETE SCHEMA

const mongoose = require('mongoose');

// --- SUB-SCHEMAS for repeating data blocks ---

// For Form 1
const educationSchema = new mongoose.Schema({
    degree: { type: String, trim: true },
    college: { type: String, trim: true },
    year: { type: String, trim: true }
});

// For Form 2
const skillSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true }
});

const experienceSchema = new mongoose.Schema({
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    start: { type: String },
    end: { type: String }
});

// ✅ NEW: For Form 3
const projectSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    photo: { type: String } // For the Cloudinary URL of the project image
});


// --- THE MAIN PORTFOLIO SCHEMA ---

const portfolioSchema = new mongoose.Schema({
    // Link to the user who owns this portfolio
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UserIntern',
        required: true,
        unique: true 
    },
    
    // --- Data from Form 1 (Basic Details) ---
    fullName: { type: String, required: true, trim: true },
    role: { type: String, trim: true },
    city: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    aboutMe: { type: String, trim: true },
    photo: { type: String }, 
    resume: { type: String },
    education: [educationSchema],
    
    // --- Data from Form 2 (Skills & Experience) ---
    skills: [skillSchema],
    experience: [experienceSchema],

    // ✅ NEW: Data from Form 3 (My Work / Projects) ---
    projects: [projectSchema],

    // ✅ NEW: Data from Form 4 (Contact Details) ---
    contactDetails: {
        phone: { type: String, trim: true },
        contactEmail: { type: String, trim: true }, // Named to avoid confusion with login email
        github: { type: String, trim: true },
        linkedin: { type: String, trim: true },
        instagram: { type: String, trim: true },
        facebook: { type: String, trim: true }
    },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to update the 'updatedAt' timestamp on every update
portfolioSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

const internForm = mongoose.model('internForm', portfolioSchema);

module.exports = internForm;