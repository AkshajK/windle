const express = require("express");

const User = require("./models/user");
const Message = require("./models/message");
const Tournament = require("./models/tournament");
const Community = require("./models/community");
const lock = require("./lock").lock;
const socketManager = require("./server-socket");

const fs = require("fs");

let wordList = [];
const allowedWords = new Set();
let allowedWordsArr = [];

const setup = async () => {
  fs.readFile("server/wordle_answers.txt", "utf8", (err, data) => {
    if (err) throw err;
    wordList = data.split("\n");
    console.log(`Imported ${wordList.length} words`);
    fs.readFile("server/wordle_allowed_guesses.txt", "utf8", (err, data) => {
      if (err) throw err;
      allowedWordsArr = data.split("\n").concat(wordList);
      for (var i = 0; i < allowedWordsArr.length; i++) {
        allowedWords.add(allowedWordsArr[i]);
        //console.log(`Added ${allowedWordsArr[i]}`);
      }
      console.log(`Imported ${allowedWords.size} words`);
    });
  });

  const tournaments = await Tournament.find({});
  tournaments.forEach((tournament) => {
    if (tournament.status === "waiting" || tournament.status === "scheduled") {
      const startTime = tournament.startTime;
      const timeUntilStart = new Date(startTime).getTime() - new Date().getTime();
      const timeUntilOpenLobby =
        new Date(startTime).getTime() -
        new Date().getTime() -
        tournament.timeToHaveLobbyOpen * 1000;
      if (tournament.status === "scheduled") {
        const id = tournament._id + "";
        setTimeout(async () => {
          const newTournament = await Tournament.findById(id);
          newTournament.status = "waiting";
          await newTournament.save();
        }, Math.max(0, timeUntilOpenLobby));
      }
      setTimeout(() => {
        startTournament(tournament._id);
      }, timeUntilStart);

      console.log(
        `Scheduled tournament ${tournament.name} to start in ${timeUntilStart * 0.001} seconds`
      );
    }
  });
  if (tournament.status === "inProgress") {
    const startTime = tournament.startTime;
    const timeUntilEnd = new Date(startTime).getTime() + 86400 * 1000 - new Date().getTime();
    setTimeout(() => {
      endTournament(tournament._id);
    }, timeUntilEnd);
  }
};

const isAllowed = (word) => {
  return allowedWords.has(word);
};
const leaveLobby = async (userId, tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  await lock.acquire(userId, async () => {
    const user = await User.findById(userId);
    if (user.tournamentLobbysIn.includes(tournamentId)) {
      user.tournamentLobbysIn = user.tournamentLobbysIn.filter((id) => id !== tournamentId);
    }
    await user.save();
  });
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("leftLobby", {
      userId,
    });

  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + tournamentId);
  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + tournamentId + " start");
  socketManager.getSocketFromUserID(userId).leave("TournamentLobby " + tournamentId + " finish");
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
  console.log(`Scheduled tournament ${name} to start in ${timeUntilStart * 0.001} seconds`);
};

const startTournament = async (tournamentId) => {
  setTimeout(() => {
    endTournament(tournament._id);
  }, 86400 * 1000);
  const participantsMongoDB = await User.find({ tournamentLobbysIn: tournamentId });
  await lock.acquire(tournamentId, async () => {
    const tournament = await Tournament.findById(tournamentId);
    tournament.status = "inProgress";
    tournament.ratedParticipants = participantsMongoDB.map((participant) => participant._id + "");
    await tournament.save();
  });
  socketManager
    .getIo()
    .in("TournamentLobby " + tournamentId)
    .emit("start tournament", { tournamentId: tournamentId + "" });
};

const endTournament = async (tournamentId) => {
  await lock.acquire(tournamentId, async () => {
    const tournament = await Tournament.findById(tournamentId);
    tournament.status = "complete";
    await tournament.save();
  });
};

module.exports = {
  createTournament,
  startTournament,
  endTournament,
  leaveLobby,
  getRandomInt,
  isAllowed,
  setup,
};
