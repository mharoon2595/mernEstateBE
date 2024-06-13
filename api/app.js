import express from "express";
import userAuth from "./routes/auth.route.js";

const app = express();

app.use(express.json());

app.use("/api/auth", userAuth);

app.listen(8800, () => {
  console.log("Server is running!");
});
