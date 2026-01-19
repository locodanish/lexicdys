const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 1. IMPORT ROUTES
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes"); // <--- ADD THIS
const progressRoutes = require("./src/routes/progressRoutes");

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Database Connection ---
const MONGO_URI = "mongodb://127.0.0.1:27017/lexicdys";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// --- Routes ---
app.use("/api", authRoutes); // Handles /api/login, /api/signup
app.use("/api/admin", adminRoutes); // <--- ADD THIS (Handles /api/admin/users, etc.)
app.use("/api/progress", progressRoutes);

// --- Start Server ---
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
