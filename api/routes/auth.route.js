import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { check } from "express-validator";

const router = express.Router();

router.post(
  "/register",
  [
    check("email").isEmail(),
    check("username").notEmpty(),
    check("password").isLength({ min: 8 }),
  ],
  register
);

router.post(
  "/login",
  [check("username").notEmpty(), check("password").isLength({ min: 8 })],
  login
);

router.post("/logout", logout);

export default router;
