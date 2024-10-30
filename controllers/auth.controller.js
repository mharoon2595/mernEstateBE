import bcrypt, { hash } from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import HttpError from "../lib/Error.js";
import { validationResult } from "express-validator";

export const register = async (req, res, next) => {
  const errors = validationResult(req);
  const { username, email, password } = req.body;

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  if (password.length < 8) {
    return next(
      new HttpError("Password must contain a minimum of 8 characters", 422)
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.meta.target === "User_username_key") {
      return next(new HttpError("Username already exists", 500));
    } else if (err.meta.target === "User_email_key") {
      return next(new HttpError("Email already exists", 500));
    } else
      return next(
        new HttpError(
          "Failed to create user, please try again after sometime.",
          500
        )
      );
  }
};

export const login = async (req, res, next) => {
  const errors = validationResult(req);
  const { username, password } = req.body;

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    const hashedPassword = user.password;

    if (!user) return next(new HttpError("Invalid credentials", 401));

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return next(new HttpError("Invalid credentials", 401));

    const { password: userPassword, ...userInfo } = user;
    // res
    //   .setHeader("Set-Cookie", "test=" + "myValue")
    //   .json({ message: "Logged in" });
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: age,
    });

    console.log({ ...userInfo, token: token });

    res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
    
      res.status(200).json({ ...userInfo, token: token });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Failed to login, please try again later!", 500));
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  
    res.status(200).json({ message: "Logout Successful" });
};
