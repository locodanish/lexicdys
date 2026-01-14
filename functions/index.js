const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// test DB connection
db.query("SELECT 1", (err) => {
  if (err) console.error("DB ❌", err);
  else console.log("DB connected ✅");
});

// mount routes
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});