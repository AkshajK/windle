const express = require("express");

const User = require("./models/user");
const Message = require("./models/message");
const Tournament = require("./models/tournament");
const Community = require("./models/community");

const socketManager = require("./server-socket");

const fs = require("fs");

let wordList = [];
let allowedWords = new Set();
let allowedWordsArr = [];

fs.readFile("server/wordle_answers.txt", "utf8", (err, data) => {
  if (err) throw err;
  wordList = data.split("\n");
  console.log(`Imported ${wordList.length} words`);
});
fs.readFile("server/wordle_allowed_guesses.txt", "utf8", (err, data) => {
  if (err) throw err;
  allowedWordsArr = data.split("\n").concat(wordList);
  for (var i = 0; i < allowedWordsArr.length; i++) {
    allowedWords.add(allowedWordsArr[i]);
  }
  console.log(`Imported ${allowedWords.size} words`);
});

const leaveLobby = async (userId, tournamentId = undefined) => {
  const user = await User.findById(userId);
  const leftId = tournamentId;
  if (tournamentId && user.tournamentLobbysIn.includes(tournamentId)) {
    user.tournamentLobbysIn = user.tournamentLobbysIn.filter((id) => id !== tournamentId);
  } else if (!tournamentId) {
    leftId = user.tournamentLobbysIn[0];
    user.tournamentLobbysIn = user.tournamentLobbysIn.shift();
    user.markModified("tournamentLobbysIn");
  }
  await user.save();
  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + leftId);
  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + leftId + " start");
  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + leftId + " finish");
};

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};
const createTournament = async (
  name,
  communityName,
  startTime,
  timeToHaveLobbyOpen = 24 * 60 * 60
) => {
  const community = await Community.findOne({ name: communityName });
  const tournament = new Tournament({
    name,
    communityId: community._id + "",
    startTime,
    timeToHaveLobbyOpen,
    word: wordList[getRandomInt(wordList.length)],
    status: "scheduled",
  });
  const saved = await tournament.save();
  const timeUntilStart = new Date(startTime).getTime() - new Date().getTime();
  const timeUntilOpenLobby =
    new Date(startTime).getTime() - new Date().getTime() - timeToHaveLobbyOpen * 1000;
  setTimeout(async () => {
    const newTournament = await Tournament.findById(saved._id);
    newTournament.status = "waiting";
    await newTournament.save();
  }, Math.max(0, timeUntilOpenLobby));
  setTimeout(() => {
    startTournament(saved._id);
  }, timeUntilStart);
};

const startTournament = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  tournament.status = "inProgress";
  await tournament.save();
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("start tournament", {});
};

module.exports = {
  createTournament,
  startTournament,
  leaveLobby,
  getRandomInt,
};
