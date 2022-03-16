let io;
const userToSocketMap = {}; // maps user ID to socket object
const socketToUserMap = {}; // maps socket ID to user object
const User = require("./models/user");
const getSocketFromUserID = (userid) => userToSocketMap[userid];
const getUserFromSocketID = (socketid) => socketToUserMap[socketid];
const getSocketFromSocketID = (socketid) => {
  console.log(io.sockets.sockets);
  return io.sockets.sockets.get(socketid);
};

const addUser = (user, socket) => {
  const oldSocket = userToSocketMap[user._id];
  if (oldSocket && oldSocket.id !== socket.id) {
    // there was an old tab open for this user, force it to disconnect
    // FIXME: is this the behavior you want?
    oldSocket.disconnect();
    delete socketToUserMap[oldSocket.id];
  }

  userToSocketMap[user._id] = socket;
  console.log(socket);
  socketToUserMap[socket.id] = user;
};

const removeUser = async (userobj, socket) => {
  if (userobj) {
    delete userToSocketMap[userobj._id];
    const user = await User.findById(userobj._id);
    const leftId = user.tournamentLobbysIn[0];
    user.tournamentLobbysIn = user.tournamentLobbysIn.shift();
    user.markModified("tournamentLobbysIn");
    await user.save();
    getSocketFromUserID(userobj._id).leave("TournamentLobby " + leftId);
    getSocketFromUserID(userobj._id).leave("TournamentLobby " + leftId + " start");
    getSocketFromUserID(userobj._id).leave("TournamentLobby " + leftId + " finish");
  }
  delete socketToUserMap[socket.id];
};

module.exports = {
  init: (http) => {
    io = require("socket.io")(http);
    console.log("init done");
    io.on("connection", (socket) => {
      console.log(`socket has connected ${socket.id}`);
      socket.on("disconnect", (reason) => {
        const user = getUserFromSocketID(socket.id);
        removeUser(user, socket);
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
