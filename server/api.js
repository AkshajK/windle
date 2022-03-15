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
  if (req.user)
    socketManager.addUser(req.user, socketManager.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | The Backend of WINDLE        |
// |------------------------------|
const fs = require("fs");

let wordList = [];
let allowedWords = new Set();
let allowedWordsArr = [];
fs.readFile("wordle_answers.txt", (err, data) => {
  if (err) throw err;
  wordList = data.split("\n");
  console.log(`Imported ${wordList.length} words`);
});
fs.readFile("wordle_allowed_guesses.txt", (err, data) => {
  if (err) throw err;
  allowedWordsArr = data.split("\n").concat(wordList);
  for (var i = 0; i < allowedWordsArr.length; i++) {
    allowedWords.add(allowedWordsArr[i]);
  }
  console.log(`Imported ${allowedWords.length} words`);
});

router.post("/createCommunity", (req, res) => {
  const community = new Community({ name: req.body.name, leaderboard: [] });
  community.save().then((savedCommunity) => {
    res.send(savedCommunity);
  });
});

router.post("/enterCommunity", (req, res) => {
  const community = await Community.findOne({ name: req.body.name });
  if (!community) res.send({ invalid: true });
  const tournamentsMongoDB = await Tournament.find({ communityId: community._id });
  const tournaments = tournamentsMongoDB.map((tournament) => {
    return {
      name: tournament.name,
      startTime: tournament.startTime,
      correctGuesses: tournament.guesses
        .filter((entry) => entry.guess === tournament.word)
        .map((entry) => ({ userId: entry.userId, seconds: entry.seconds, virtual: entry.virtual })),
    };
  });
  res.send({
    tournaments,
    leaderboard: community.leaderboard,
  });
});

router.post("/enterLobby", (req, res) => {
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
    await user.save();
  }
  const participantsMongoDB = await User.find({ tournamentLobbysIn: tournament._id });
  const participants = participantsMongoDB.map((participant) => {
    const rating =
      participant.ratings.find((entry) => entry.communityId === community._id + "")?.rating || 1200;
  });
  const finished = tournament.guesses.find((entry) => entry.guess === tournament.word);
  socketManager.join("TournamentLobby " + tournamentId + finished ? " finish" : " start");
  socketManager.join("TournamentLobby " + tournamentId);
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("joinedLobby", { userId: req.user._id + "", name: user.name, rating: user.rating });
  res.send({
    chatMessages,
    name: tournament.name,
    startTime: tournament.startTime,
    status: tournament.status,
    guesses: tournament.guesses,
    participants,
  });
});

router.post("/exitLobby", (req, res) => {
  leaveLobby(req.body.tournamentId);
});

const leaveLobby = (tournamentId) => {
  const user = await User.findById(req.user._id);
  const leftId = tournamentId;
  if (tournamentId && user.tournamentLobbysIn.includes(tournamentId)) {
    user.tournamentLobbysIn = user.tournamentLobbysIn.filter((id) => id !== tournamentId);
  } else if (!tournamentId) {
    leftId = user.tournamentLobbysIn[0];
    user.tournamentLobbysIn = user.tournamentLobbysIn.shift();
    user.markModified("tournamentLobbysIn");
  }
  await user.save();
  socketManager.leave("TournamentLobby " + leftId);
  socketManager.leave("TournamentLobby " + leftId + " start");
  socketManager.leave("TournamentLobby " + leftId + " finish");
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};
const createTournament = (name, communityId, startTime, timeToHaveLobbyOpen = 24 * 60 * 60) => {
  const tournament = new Tournament({
    name,
    communityId,
    startTime,
    timeToHaveLobbyOpen,
    word: wordList[getRandomInt(wordList.length)],
    status: "scheduled",
  });
  const saved = await tournament.save();
  const timeUntilStart = new Date(startTime).getTime() - new Date().getTime();
  const timeUntilOpenLobby =
    new Date(startTime).getTime() - new Date().getTime() - timeToHaveLobbyOpen * 1000;
  setTimeout(() => {
    const newTournament = await Tournament.findById(saved._id);
    newTournament.status = "waiting";
    await newTournament.save();
  }, Math.max(0, timeUntilOpenLobby));
  setTimeout(() => {
    startTournament(saved._id);
  }, timeUntilStart);
};

const startTournament = (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  tournament.status = "inProgress";
  await tournament.save();
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("start tournament", {});
};

router.post("/guess", (req, res) => {
  const user = await User.findById(req.user._id);
  const tournament = await Tournament.findById(req.body.tournamentId);
  if (tournament.status !== "inProgress") return;
  const time = (Date.now().getTime() - new Date(tournament.startTime).getTime()) * 0.001;
  const result = req.body.guess
    .split("")
    .map((character, i) =>
      character === tournament.answer[0]
        ? "green"
        : tournament.answer.split("").includes(character)
        ? "yellow"
        : "white"
    );
  const correct = req.body.guess === tournament.word;
  const newGuesses = tournament.guesses.concat([
    { userId: req.user._id + "", seconds: time, virtual: false, result },
  ]);
  tournament.guesses = newGuesses;
  await tournament.save();
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("guess", {
      tournamentId: tournament._id + "",
      userId: req.user._id + "",
      name: user.name,
      guessNumber: newGuesses.filter((guess) => guess.userId === req.user._id + "").length,
      time,
      result,
      correct,
    });
  res.send({ result, correct });
  if (correct) {
    socketManager.leave("TournamentLobby " + tournamentId + " start");
    socketManager.join("TournamentLobby " + tournamentId + " finish");
  }
});

router.post("/message", (req, res) => {
  const user = await User.findById(req.user._id);
  const tournament = await Tournament.findById(req.body.tournamentId);
  const finished =
    tournament.guesses.filter(
      (entry) => entry.userId === req.user._id + "" && entry.guess === tournament.word
    ).length > 0;
  const info = {
    text: req.body.message,
    userId: req.user._id + "",
    name: user.name,
    tournamentId: tournament._id + "",
    finished,
  };
  const message = new Message(info);
  message.save();

  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId + " " + finished ? "finish" : "start")
    .emit("message", info);
});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
