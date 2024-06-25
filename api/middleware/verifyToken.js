import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  jwt.verify(token, process.env.SECRET_KEY, async (error, payload) => {
    if (error) return res.status(401).json({ message: "Not authorized" });
    req.userId = payload.id;
    next();
  });
};
