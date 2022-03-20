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
      guessNumber: Number,
      seconds: Number,
      virtualSeconds: Number,
      virtual: Boolean,
      result: [String],
    },
  ],
  virtualStartTimes: {
    type: [{ userId: String, startTime: Date }],
    default: [],
  },
  timeToHaveLobbyOpen: Number, // in seconds
  word: String,
  status: String, // 'scheduled'|'waiting'|'inProgress'|'complete'
  ratedParticipants: [String],
});

// compile model from schema
module.exports = mongoose.model("tournament", TournamentSchema);
