const mongoose = require('mongoose');

mongoose.set("strictQuery",false);

const connectDB = async () => {
  try{
  const conn =  await mongoose.connect(process.env.MONGO_URI); 
    console.log("✅👌 MongoDB Connected");
    return conn;
  }
  catch(err) {
    console.log("❌ Mongo Error :", err.message);
    process.exit(1);  // stop the server
  }
};

module.exports = connectDB;