const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema({
  name: String,
  leaderboard: [{ userId: String, name: String, rating: Number }],
});

// compile model from schema
module.exports = mongoose.model("community", CommunitySchema);
