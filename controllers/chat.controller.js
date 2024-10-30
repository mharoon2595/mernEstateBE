import HttpError from "../lib/Error.js";
import prisma from "../lib/prisma.js";

export const getChat = async (req, res, next) => {
  const tokenUserId = req.userId;
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id: req.params.id,
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }
};

export const getChats = async (req, res, next) => {
  console.log("getChats runnin");
  const tokenUserId = req.userId;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }

    res.status(200).json(chats);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }
};

export const addChat = async (req, res, next) => {
  const tokenUserId = req.userId;
  console.log(req.body);
  try {
    const checkExisting = await prisma.chat.findFirst({
      where: {
        AND: [
          { userIDs: { has: tokenUserId } },
          { userIDs: { has: req.body.receiverId } },
        ],
      },
    });

    if (!checkExisting) {
      const chat = await prisma.chat.create({
        data: {
          userIDs: [tokenUserId, req.body.receiverId],
        },
      });

      return res.status(200).json(chat);
    } else {
      return res.status(200).json({ message: "Chat already exists." });
    }
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }
};

export const readChat = async (req, res, next) => {
  const tokenUserId = req.userId;
  try {
    const chat = await prisma.chat.update({
      where: {
        id: req.params.id,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
      data: {
        seenBy: {
          push: [tokenUserId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }
};
