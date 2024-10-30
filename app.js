import express from "express";
import loginAuth from "./routes/auth.route.js";
import userAuth from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import chatRoute from "./routes/chat.route.js";
import msgRoute from "./routes/messages.route.js";
import HttpError from "./lib/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./socket/app.js";

const allowedOrigins = ["https://mernestate.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin like mobile apps or curl requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/auth", loginAuth);
app.use("/user", userAuth);
app.use("/post", postRoute);
app.use("/chats", chatRoute);
app.use("/messages", msgRoute);

app.use((req, res, next) => {
  const error = new HttpError("Unsupported route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured" });
});

server.listen(8800, () => {
  console.log("Server is running!");
});
