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
    console.log(socketManager.getIo().sockets.sockets);
    socketManager.addUser(
      req.user,
      //
      socketManager.getSocketFromSocketID(req.body.socketid)
    );
  }
  res.send({});
});

// |------------------------------|
// | The Backend of WINDLE        |
// |------------------------------|
//serverFunctions.createTournament("Test Tournament", "MIT", new Date("March 17, 2022 00:00:00"));

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
          seconds: entry.seconds,
          virtual: entry.virtual,
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
    await user.save();
  }
  const participantsMongoDB = await User.find({ tournamentLobbysIn: tournament._id });
  const participants = participantsMongoDB.map((participant) => {
    const rating =
      participant.ratings.find((entry) => entry.communityId === community._id + "")?.rating || 1200;
    return {
      rating,
      name: participant.name,
      userId: participant._id + "",
    };
  });
  const finished = tournament.guesses.find((entry) => entry.guess === tournament.word);
  socketManager
    .getSocketFromUserID(req.user._id)
    .join("TournamentLobby " + tournamentId + finished ? " finish" : " start");
  socketManager.getSocketFromUserID(req.user._id).join("TournamentLobby " + tournamentId);
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
  serverFunctions.leaveLobby(req.body.tournamentId);
});

router.post("/guess", async (req, res) => {
  const user = await User.findById(req.user._id);
  const tournament = await Tournament.findById(req.body.tournamentId);
  if (tournament.status !== "inProgress") return;
  if (!allowed_words.has(req.body.guess)) {
    res.send({ valid: false });
    return;
  }
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
    { userId: req.user._id + "", userName: user.name, seconds: time, virtual: false, result },
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
  res.send({ result, valid: true, correct });
  if (correct) {
    socketManager
      .getSocketFromUserID(req.user._id)
      .leave("TournamentLobby " + tournamentId + " start");
    socketManager
      .getSocketFromUserID(req.user._id)
      .join("TournamentLobby " + tournamentId + " finish");
  }
});

router.post("/message", async (req, res) => {
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
