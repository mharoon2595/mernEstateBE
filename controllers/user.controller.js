import HttpError from "../lib/Error.js";
import prisma from "../lib/prisma.js";
import bcrypt, { hash } from "bcrypt";
import { validationResult } from "express-validator";

export const allUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        posts: true,
      },
    });
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get users" });
  }
};

export const fetchUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        avatar: true,
        username: true,
        email: true,
        createdAt: true,
        posts: true,
      },
    });
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get user" });
  }
};

export const updateUser = async (req, res, next) => {
  const id = req.params.id;
  const incomingID = req.userId;
  const { password, avatar, ...inputs } = req.body;
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return next(new HttpError("Invalid format or empty inputs passed.", 422));
  }

  if (id !== incomingID) {
    return next(new HttpError("Not authorized", 422));
  }
  let updatedPassword;
  try {
    if (password) {
      if (password.length < 8) {
        next(
          new HttpError(
            "You password should contain a minimum of 8 characters.",
            422
          )
        );
      }
      updatedPassword = await bcrypt.hash(password, 12);
    }
    const updateUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    res.status(200).json(updateUser);
  } catch (err) {
    console.log(err);
    next(
      new HttpError("Failed to update details, please try again later.", 500)
    );
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const incomingID = req.userId;
  if (id !== incomingID) {
    res.status(401).json({ message: "Not authorized" });
  }
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User deleted!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const savePost = async (req, res, next) => {
  const postId = req.params.id;
  const tokenUserId = req.userId;

  try {
    const savedPost = await prisma.savedPosts.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      await prisma.savedPosts.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      await prisma.savedPosts.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete users!" });
  }
};

export const fetchSavedPosts = async (req, res, next) => {
  const userId = req.userId;

  try {
    const fetchPosts = await prisma.savedPosts.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true,
      },
    });

    const savedPosts = fetchPosts.map((data) => data.post);

    res.status(200).json(savedPosts);
  } catch (err) {
    return next(new HttpError("Failed to fetch saved posts!", 500));
  }
};

export const getNotifications = async (req, res, next) => {
  const tokenUserId = req.userId;
  try {
    const number = await prisma.chat.count({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
        NOT: {
          seenBy: {
            hasSome: [tokenUserId],
          },
        },
      },
    });
    console.log("notifications number--->", number);
    res.status(200).json(number);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try agaon later", 500)
    );
  }
};

export const stayActive=(req, res, next)=>{
  return res.status(200).json({message:"Hello world"})
}
