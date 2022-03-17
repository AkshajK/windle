const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  userId: String,
  name: String,
  text: String,
  tournamentId: String,
  finished: Boolean,
  picture: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// compile model from schema
module.exports = mongoose.model("message", MessageSchema);
