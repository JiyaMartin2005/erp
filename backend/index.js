import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize from "./db/sequelize.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

//  CREATE APP FIRST
const app = express();

// middlewares
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);   //  NOW this is correct

app.get("/", (req, res) => {
  res.send("ERP Backend Running...");
});

const startServer = async () => {
  try {
    await sequelize.sync();
    console.log("Database synced");

    app.listen(process.env.PORT, () => {
      console.log("Server running on port " + process.env.PORT);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
