const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schema for individual Education entries
const educationSchema = new Schema({
    detail: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
});

// Sub-schema for individual Work items
const workItemSchema = new Schema({
    image: { type: String }, // Stores the URL or path to the uploaded image
    description: { type: String }
});

// Sub-schema for individual Experience entries
const experienceSchema = new Schema({
    role: { type: String },
    company: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    description: { type: String }
});

// Main schema for the entire profile
const editProfileSchema = new Schema({
    // It's crucial to link the profile to a user account
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assumes you have a User model
        required: true,
        unique: true
    },
    
    // Profile Section
    profileImage: { type: String },
    fullName: { type: String },
    yearsOfExperience: { type: String },

    // About Me Section
    role: { type: String },
    bio: { type: String },

    education: [educationSchema],

    contact: {
        phone: { type: String },
        email: { type: String },
        instagram: { type: String },
        linkedin: { type: String },
        github: { type: String }
    },

    skills: [String],

    myWork: [workItemSchema],

    experience: [experienceSchema],

    // Resume Section
    resume: { type: String } 
}, {
    timestamps: true
});

const EditProfile = mongoose.model('EditProfile', editProfileSchema);

module.exports = EditProfile;