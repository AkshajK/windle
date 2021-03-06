const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  picture: String,
  ratings: {
    type: [{ communityId: String, rating: Number }],
    default: [],
  },
  tournamentLobbysIn: {
    type: [String],
    default: [],
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
