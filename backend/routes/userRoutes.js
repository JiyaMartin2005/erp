import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET all users (protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new user (optional, mostly handled by OTP)
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await User.create({ name, email, password, role });
    res.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user by ID (protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: only allow admin or self to delete
    if (req.user.role !== "Admin" && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: "Not authorized to delete this user" });
    }

    const deleted = await User.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
