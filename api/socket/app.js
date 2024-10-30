import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

const app = express();

// const corsOptions = {
//   origin: "https://mernestate.vercel.app",
//   credentials: true,
// };

// app.use(cors(corsOptions));

app.get("/api/stayActive", (req, res, next) => {
  res.status(200).json({ message: "Hello world" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://mernestate.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUsers.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
    console.log("online users--->", onlineUsers);
    socket.emit("userConnected");
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    const receiver = getUser(receiverId);
    console.log(receiver);
    if (receiver) {
      io.to(receiver.socketId).emit("getMessage", data);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("online users--->", onlineUsers);
    console.log("user disconnected");
  });
});

export { app, server };
