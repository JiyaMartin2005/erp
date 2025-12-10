import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import sendOtp from "./mailer.js";   // <-- IMPORTANT
dotenv.config();

const app = express();

// store OTP temporarily (later you can move this to DB if needed)
let otpStore = {};

// Allow frontend to talk to backend
app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("ERP Backend Running...");
});

// DB test route
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send("DB Connected Successfully: " + result.rows[0].now);
  } catch (err) {
    res.status(500).send("DB Error: " + err.message);
  }
});

// --------------------- REGISTER (Send OTP) ---------------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Temporarily store details
    otpStore[email] = { name, password, otp };

    // Send OTP Email
    await sendOtp(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// --------------------- RESEND OTP ---------------------
app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if this email started registration
    if (!otpStore[email]) {
      return res.status(400).json({ error: "No registration found for this email" });
    }

    // Generate NEW OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000);

    // Update OTP for that email
    otpStore[email].otp = newOtp;

    // Send new OTP email
    await sendOtp(email, newOtp);

    res.json({ message: "OTP resent successfully!" });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});


// --------------------- VERIFY OTP ---------------------
app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({ error: "No OTP found for this email" });
    }

    if (otpStore[email].otp != otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const { name, password } = otpStore[email];

    // Insert into DB after OTP success
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, password]
    );

    // Clear OTP after successful registration
    delete otpStore[email];

    res.json({ message: "Registration successful!" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// --------------------- LOGIN ---------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (user.rows.length === 0)
      return res.status(400).json({ error: "Invalid email or password" });

    res.json({ message: "Login successful!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start Server
app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
