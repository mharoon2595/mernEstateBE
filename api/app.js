import express from "express";
import loginAuth from "./routes/auth.route.js";
import userAuth from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import chatRoute from "./routes/chat.route.js";
import msgRoute from "./routes/messages.route.js";
import HttpError from "./lib/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", loginAuth);
app.use("/api/user", userAuth);
app.use("/api/post", postRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", msgRoute);

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

app.listen(8800, () => {
  console.log("Server is running!");
});
