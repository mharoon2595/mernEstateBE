import HttpError from "../lib/Error.js";
import prisma from "../lib/prisma.js";

export const addMessage = async (req, res, next) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;
  let newMsg;

  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIDs: { hasSome: [tokenUserId] },
      },
    });
    if (!chat) {
      return next(new HttpError("Chat not found", 404));
    } else {
      newMsg = await prisma.messages.create({
        data: {
          text,
          chatId,
          userId: tokenUserId,
        },
      });

      await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          seenBy: [tokenUserId],
          lastMessage: text,
        },
      });
    }
    res.status(200).json(newMsg);
  } catch (err) {
    console.log(err);
    return next(
      new HttpError("Failed to send message, please try again in a bit", 500)
    );
  }
};
