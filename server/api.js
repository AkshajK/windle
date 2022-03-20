/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Message = require("./models/message");
const Tournament = require("./models/tournament");
const Community = require("./models/community");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socketManager = require("./server-socket");
console.log(socketManager);
const serverFunctions = require("./serverFunctions");

// initialize wordlist
serverFunctions.setup();

User.find({}).then((users) => {
  users.forEach((user) => {
    user.tournamentLobbysIn = [];
    user.save();
  });
});

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) {
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  }
  res.send({});
});

// |------------------------------|
// | The Backend of WINDLE        |
// |------------------------------|
/*serverFunctions.createTournament(
  `Tournament Last Testing`,
  "MIT",
  new Date(`March 19, 2022 03:54:00`)
);*/
/*
for (var i = 0; i < 12 * 24 * 2; i++) {
  serverFunctions.createTournament(
    `Quick Tournament ${i + 1}`,
    "MIT",
    new Date(new Date(`March 19, 2022 04:20:00`).getTime() + 1000 * 60 * 5 * i),
    60 * 5
  );
}*/

router.post("/createCommunity", (req, res) => {
  const community = new Community({ name: req.body.name, leaderboard: [] });
  community.save().then((savedCommunity) => {
    res.send(savedCommunity);
  });
});

router.post("/enterCommunity", async (req, res) => {
  const community = await Community.findOne({ name: req.body.name });
  if (!community) {
    res.send({ invalid: true });
    return;
  }
  const tournamentsMongoDB = await Tournament.find({ communityId: community._id });
  const tournaments = tournamentsMongoDB.map((tournament) => {
    return {
      name: tournament.name,
      startTime: tournament.startTime,
      correctGuesses: tournament.guesses
        .filter((entry) => entry.guess === tournament.word)
        .map((entry) => ({
          userId: entry.userId,
          userName: entry.userName,
          picture: entry.picture,
          seconds: entry.seconds,
          virtual: entry.virtual,
          guessNumber: entry.guessNumber,
          virtualSeconds: entry.virtualSeconds,
        })),
      status: tournament.status,
    };
  });
  res.send({
    tournaments,
    leaderboard: community.leaderboard,
  });
});

router.post("/enterLobby", async (req, res) => {
  const community = await Community.findOne({ name: req.body.community });
  const tournament = await Tournament.findOne({
    communityId: community._id,
    name: req.body.tournamentName,
  });
  const tournamentId = tournament._id + "";
  const chatMessages = await Message.find({ tournamentId: tournamentId });
  const user = await User.findById(req.user._id);
  if (!user.tournamentLobbysIn.includes(tournamentId)) {
    user.tournamentLobbysIn = user.tournamentLobbysIn.concat([tournamentId]);
    user.save();
  }
  const participantsMongoDB = await User.find({ tournamentLobbysIn: tournament._id });
  const participants = participantsMongoDB.map((participant) => {
    const rating =
      participant.ratings.find((entry) => entry.communityId === community._id + "")?.rating || 1200;
    return {
      rating,
      name: participant.name,
      userId: participant._id + "",
      picture: participant.picture,
    };
  });
  const finished = tournament.guesses.find(
    (entry) =>
      entry.userId === req.user._id + "" &&
      (entry.guess === tournament.word || entry.guessNumber >= 6)
  );
  let answer = "Lol good try";
  if (finished) answer = tournament.word;
  socketManager
    .getSocketFromUserID(req.user._id)
    .join("TournamentLobby " + tournamentId + (finished ? " finish" : " start"));
  socketManager.getSocketFromUserID(req.user._id).join("TournamentLobby " + tournamentId);
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("joinedLobby", {
      userId: req.user._id + "",
      name: user.name,
      rating: user.rating || 1200,
      picture: user.picture,
    });
  const isVirtual =
    (tournament.status === "inProgress" || tournament.status === "complete") &&
    !tournament.ratedParticipants.includes(req.user._id + "");
  let virtualStartTime = tournament.startTime;
  if (isVirtual) {
    let ourEntry = tournament.virtualStartTimes.find((e) => e.userId === req.user._id + "");
    if (!ourEntry) {
      const tournament2 = await Tournament.findById(tournament._id);
      ourEntry = { userId: req.user._id + "", startTime: new Date() };
      tournament2.virtualStartTimes = tournament2.virtualStartTimes.concat([ourEntry]);
      tournament2.save();
    }
    virtualStartTime = ourEntry.startTime;
  }

  res.send({
    chatMessages,
    name: tournament.name,
    startTime: tournament.startTime,
    status: tournament.status,
    guesses: tournament.guesses.map((guess) => {
      if (guess.userId !== req.user._id + "" && !finished)
        return Object.assign(guess, { guess: "nice try" });
      return guess;
    }),
    participants,
    tournamentId,
    finished,
    answer,
    isVirtual,
    virtualStartTime,
  });
});

router.post("/exitLobby", (req, res) => {
  serverFunctions.leaveLobby(req.user._id + "", req.body.tournamentId);
});

router.post("/guess", async (req, res) => {
  const user = await User.findById(req.user._id);
  const tournament = await Tournament.findById(req.body.tournamentId);
  if (tournament.status !== "inProgress") return;
  console.log(req.body.guess);
  if (!serverFunctions.isAllowed(req.body.guess)) {
    res.send({ valid: false });
    return;
  }
  const time = (new Date().getTime() - new Date(tournament.startTime).getTime()) * 0.001;
  const result = req.body.guess
    .split("")
    .map((character, i) =>
      character === tournament.word[i]
        ? "green"
        : tournament.word.split("").includes(character)
        ? "yellow"
        : "white"
    );

  const guessNumber =
    tournament.guesses.filter((guess) => guess.userId === req.user._id + "").length + 1;
  const correct = req.body.guess === tournament.word;
  const virtualEntry = tournament.virtualStartTimes.find((e) => e.userId === req.user._id + "");
  const virtualSeconds = virtualEntry
    ? time +
      new Date(tournament.startTime).getTime() * 0.001 -
      new Date(virtualEntry.startTime).getTime() * 0.001
    : undefined;
  const newGuesses = tournament.guesses.concat([
    {
      userId: req.user._id + "",
      userName: user.name,
      picture: user.picture,
      seconds: time,
      virtual: virtualEntry ? true : false,
      virtualSeconds,
      guessNumber,
      guess: req.body.guess,
      result,
    },
  ]);
  tournament.guesses = newGuesses;
  tournament.save();
  const guess = {
    tournamentId: tournament._id + "",
    userId: req.user._id + "",
    userName: user.name,
    picture: user.picture,
    virtual: virtualEntry ? true : false,
    virtualSeconds,
    guessNumber,
    seconds: time,
    result,
    // guess: req.body.guess,
    correct,
  };

  socketManager
    .getSocketFromUserID(req.user._id)
    .to("TournamentLobby " + req.body.tournamentId + " start")
    .emit("guess", guess);
  guess.guess = req.body.guess;
  guess.answer = (correct || guessNumber >= 6) && tournament.word;
  socketManager.getSocketFromUserID(req.user._id).emit("guess", guess);
  socketManager
    .getIo()
    .in("TournamentLobby " + req.body.tournamentId + " finish")
    .emit("guess", guess);
  res.send({
    result,
    valid: true,
    correct,
    guesses: correct || guessNumber >= 6 ? tournament.guesses : [],
    answer: (correct || guessNumber >= 6) && tournament.word,
  });
  if (correct || guessNumber >= 6) {
    socketManager
      .getSocketFromUserID(req.user._id)
      .leave("TournamentLobby " + req.body.tournamentId + " start");
    socketManager
      .getSocketFromUserID(req.user._id)
      .join("TournamentLobby " + req.body.tournamentId + " finish");
  }
});

router.post("/message", async (req, res) => {
  const user = await User.findById(req.user._id);
  const tournament = await Tournament.findById(req.body.tournamentId);
  const finished =
    tournament.guesses.filter(
      (entry) =>
        entry.userId === req.user._id + "" &&
        (entry.guess === tournament.word || entry.guessNumber >= 6)
    ).length > 0;
  const info = {
    text: req.body.text,
    userId: req.user._id + "",
    name: user.name,
    picture: user.picture,
    tournamentId: tournament._id + "",
    finished,
    timestamp: new Date(),
  };
  const message = new Message(info);
  message.save();
  const roomName = "TournamentLobby " + tournament._id + " " + (finished ? "finish" : "start");
  console.log("sending out socket to " + roomName);
  socketManager.getIo().in(roomName).emit("message", info);
  res.send({});
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
