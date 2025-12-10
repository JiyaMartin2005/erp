// controllers/authController.js
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check existing user
    const userExists = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hash]
    );

    res.json({ message: "User registered", user: newUser.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.rows[0].password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, user: user.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
