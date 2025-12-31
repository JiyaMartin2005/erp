import express from "express";
import { register, verifyOtp } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);      // Send OTP
router.post("/verify-otp", verifyOtp);   // Verify OTP

export default router;
