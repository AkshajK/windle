let io;
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const User = require("./models/user");
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => io.sockets.sockets.get(socketid);

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  socketToUserMap[socket.id] = user;
};

const removeUser = (userobj, socket, server) => {
  if (userobj) {
    const userId = userobj._id + "";
    if (!server) delete userToSocketMap[userobj._id];
    User.findById(userobj._id).then((user) => {
      const leftId = user.tournamentLobbysIn[0];
      io.in("TournamentLobby " + leftId).emit("leftLobby", {
        userId,
      });

      user.tournamentLobbysIn = user.tournamentLobbysIn.shift();
      user.markModified("tournamentLobbysIn");
      user.save();
      socket.leave("TournamentLobby " + leftId);
      socket.leave("TournamentLobby " + leftId + " start");
      socket.leave("TournamentLobby " + leftId + " finish");
    });
  }
  delete socketToUserMap[socket.id];
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http, { allowEIO3: true });
    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        console.log(`${user?.name || socket.id} has disconnected for reason ${reason}`);

        removeUser(user, socket, reason === "server namespace disconnect");
      });
    });
  },

  addUser: addUser,
  removeUser: removeUser,

  getSocketFromUserID: getSocketFromUserID,
  getUserFromSocketID: getUserFromSocketID,
  getSocketFromSocketID: getSocketFromSocketID,
  getIo: () => io,
};
