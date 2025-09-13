const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject:{type:String, required:true},
  message: { type: String, required: true },
  phoneNumber:{type:String, required:true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("contactUS", contactUsSchema);
