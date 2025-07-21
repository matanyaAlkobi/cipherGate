import express from "express";
import bcrypt from "bcrypt";
import User from "../lib/sequelize.js";
import 'dotenv/config'
let verifiedUsers = {};
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    // צריך  להוסיף בדיקה אם  קיים כבר המשתמש
    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
    });

    res.status(201).json({ id: newUser.id });
  } catch (error) {
    console.error(error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Creation error" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(403).json({ message: "username not found" });
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      return res.status(403).json({ message: "incorrect password" });
    verifiedUsers[username] = true;
    res.status(200).json({ message: "login successfuly" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "login error" });
  }
});

router.post("/decode_message", (req, res) => {
  try {
    const { username, message } = req.body;
    if (!verifiedUsers[username]) {
      return res
        .status(403)
        .json({ error: "Access denied. User not verified." });
    }
    let isAscending = true;
    for (let i = 0; i < message.length - 1; i++) {
      if (message[i] > message[i + 1]) {
        isAscending = false;
        break;
      }
    }
    if (!isAscending) return res.json({ result: -1 });
    let sum = 0;
    for (let i = 0; i < message.length; i++) {
      sum += message[i];
    }
    res.json({ result: sum });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error decoding message" });
  }
});

export default router;
