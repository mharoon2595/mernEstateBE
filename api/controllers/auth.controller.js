import bcrypt, { hash } from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

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
    console.log(err.meta);
    if (err.meta.target === "User_username_key") {
      res.status(500).json({ message: "Username already exists" });
    } else if (err.meta.target === "User_email_key") {
      res.status(500).json({ message: "Email already exists" });
    } else
      res.status(500).json({
        message: "Failed to create user, please try again after sometime.",
      });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials!" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid credentials!" });

    // res
    //   .setHeader("Set-Cookie", "test=" + "myValue")
    //   .json({ message: "Logged in" });
    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: age,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        maxAge: age,
      })
      .status(200)
      .json({ message: "Login succesful" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Falied to login, please try again later!" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful" });
};
