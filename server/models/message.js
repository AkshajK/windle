const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  userId: String,
  text: String,
  tournamentId: String,
  finished: Boolean,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// compile model from schema
module.exports = mongoose.model("message", MessageSchema);
