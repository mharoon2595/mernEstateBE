import HttpError from "../lib/Error.js";
import prisma from "../lib/prisma.js";

export const getPosts = async (req, res, next) => {
  const query = req.query;
  console.log(query);
  try {
    const data = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || 0,
          lte: parseInt(query.maxPrice) || 100000000000,
        },
      },
    });
    console.log(data);
    res.status(200).json(data);
  } catch (err) {
    return next(new HttpError("Failed to get posts"));
  }
};
export const getPost = async (req, res, next) => {
  const id = req.params.id;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });
    res.status(200).json(post);
  } catch (err) {
    return next(new HttpError("Failed to get post"));
  }
};
export const addPost = async (req, res, next) => {
  const body = req.body;
  const userId = req.userId;
  try {
    const postData = await prisma.post.create({
      data: {
        ...body.postData,
        userId: userId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(postData);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to add post"));
  }
};
export const updatePost = async (req, res, next) => {
  try {
  } catch (err) {
    return next(new HttpError("Failed to update post"));
  }
};
export const deletePost = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const data = await prisma.post.findUnique({
      where: { userId },
    });

    if (data.userId !== userId) {
      return next(new HttpError("Not Authorized", 422));
    }

    res.status(200).json({ message: "Post deleted!" });
  } catch (err) {
    return next(new HttpError("Failed to delete post"));
  }
};
