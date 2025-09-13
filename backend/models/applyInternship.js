const mongoose = require('mongoose');

const applyInternshipSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  internshipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  employmentType: { type: String },
  stipend: { type: String },
  duration: { type: String },
  workType: { type: String },
  experienceLevel: { type: String },
  location: { type: String },
  skills: [String],
  status: {
    type: String,
    default: 'Under Review'
  },
  appliedOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('applyInternship', applyInternshipSchema);
