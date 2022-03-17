const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  name: String,
  communityId: String,
  startTime: Date,
  guesses: [
    {
      userId: String,
      userName: String,
      picture: String,
      guess: String,
      seconds: Number,
      virtual: Boolean,
    },
  ],
  timeToHaveLobbyOpen: Number, // in seconds
  word: String,
  status: String, // 'scheduled'|'waiting'|'inProgress'|'complete'
  ratedParticipants: [String],
});

// compile model from schema
module.exports = mongoose.model("tournament", TournamentSchema);
