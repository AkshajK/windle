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


router.post("/createCommunity", (req, res) => {
  const community = new Community({name: req.body.name, leaderboard: []})
  community.save().then((savedCommunity) => {
    res.send(savedCommunity);
  })
});

router.post("/enterCommunity", (req, res) => {
  const community = await Community.findOne({name: req.body.name});
  if(!community) res.send({invalid: true});
  const tournamentsMongoDB = await Tournament.find({communityId: community._id});
  const tournaments = tournamentsMongoDB.map((tournament) => {
    return {
      name: tournament.name,
      startTime: tournament.startTime,
      correctGuesses: tournament.guesses.filter((entry)=>(entry.guess === tournament.word))
    }
  })
  res.send({
    tournaments,
    leaderboard: community.leaderboard
  })
});

router.post("/enterLobby", (req, res) => {
  const community = await Community.findOne({name: req.body.community});
  const tournament = await Tournament.findOne({communityId: community._id, name: req.body.tournamentName})
  const tournamentId = tournament._id + "";
  const chatMessages = await Message.find({tournamentId: tournamentId});
  const user = await User.findById(req.user._id);
  if(!user.tournamentLobbysIn.includes(req.user._id+"")) {
    user.tournamentLobbysIn = user.tournamentLobbysIn.concat([req.user._id+""]);
    await user.save();
  }
  const participantsMongoDB = await User.find({tournamentLobbysIn: tournament._id})
  const participants = participantsMongoDB.map((participant) => {
    const rating = participant.ratings.find((entry)=>entry.communityId===community._id+"")?.rating || 1200;
  })
  res.send({
    chatMessages,
    name: tournament.name,
    startTime: tournament.startTime,
    status: tournament.status,
    guesses: tournament.guesses
  })
});

router.post("/exitLobby", (req, res) => {});

const leaveLobby; 

const startTournament;

router.post("/guess", (req, res) => {});

router.post("/message", (req, res) => {});

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;
