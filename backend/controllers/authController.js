import { sendOtpMail } from "../utils/mailer.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Temporary OTP store
const otpStore = {};

// REGISTER → SEND OTP
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = { otp, name, password };

    await sendOtpMail(email, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// VERIFY OTP → CREATE USER & RETURN JWT
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: "OTP expired or not found" });
    if (record.otp !== Number(otp)) return res.status(400).json({ error: "Invalid OTP" });

    // Create user in PostgreSQL
    const user = await User.create({
      name: record.name,
      email,
      password: record.password
    });

    // Remove OTP from memory
    delete otpStore[email];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed" });
  }
};
