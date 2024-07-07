import HttpError from "../lib/Error.js";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

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
      include: {
        savedPosts: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    let postId = JSON.stringify(data, null, 2);

    // if(token){
    //   jwt.verify(token,  )
    // }
    console.log(postId);
    res.status(200).json(data);
  } catch (err) {
    return next(new HttpError("Failed to get posts"));
  }
};

export const getMyPosts = async (req, res, next) => {
  const userId = req.userId;

  try {
    const fetchMyPosts = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      include: {
        savedPosts: true,
      },
    });
    console.log(fetchMyPosts);
    res.status(200).json(fetchMyPosts);
  } catch (err) {
    return next(new HttpError("Unable to fetch posts, please try again.", 500));
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
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    let token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
        if (!err) {
          const saved = await prisma.savedPosts.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res
            .status(200)
            .json({ ...post, isSaved: saved ? true : false });
        }
      });
    } else {
      res.status(200).json({ ...post, isSaved: false });
    }
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
        city: body.postData.toLowerCase(),
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
  const id = req.params.id;
  const body = req.body;
  console.log(body);
  try {
    const updateData = await prisma.post.update({
      where: {
        id: id,
      },
      data: {
        ...body.postData,
        postDetail: {
          update: { ...body.postDetail },
        },
      },
    });
    res.status(200).json({ message: "Details updated!" });
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
