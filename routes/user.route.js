import express from "express";
import { check } from "express-validator";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  allUsers,
  updateUser,
  deleteUser,
  fetchUser,
  savePost,
  fetchSavedPosts,
  getNotifications,
  stayActive
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", allUsers);
router.get("/stayActive", stayActive)
router.get("/savedposts", verifyToken, fetchSavedPosts);
router.get("/notification", verifyToken, getNotifications);
router.get("/:id", fetchUser);
router.put(
  "/:id",
  verifyToken,
  [check("username").notEmpty(), check("email").isEmail()],
  updateUser
);

router.post("/save/:id", verifyToken, savePost);
router.delete("/:id", verifyToken, deleteUser);

export default router;
