import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout", (req, res) => logout);

export default router;
