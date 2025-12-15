import dotenv from "dotenv";
dotenv.config(); // 👈 MUST be first

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import { connectDB } from "./src/config/db.js";
import { configurePassport } from "./src/config/passport.js";
import authRoutes from "./src/routes/auth.js";

// 1️⃣ DB
connectDB();

// 2️⃣ Express app FIRST
const app = express();

// 3️⃣ Passport config
configurePassport();

// 4️⃣ Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // ✅ NOW app exists

// 5️⃣ Routes
app.use("/api/auth", authRoutes);

// 6️⃣ Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
