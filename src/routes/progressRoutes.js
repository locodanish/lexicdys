const express = require("express");
const router = express.Router();
const Progress = require("../models/progress.js");

// Save score
router.post("/", async (req, res) => {
  try {
    const { userId, contentId, contentType, accuracy } = req.body;
    const newProgress = new Progress({
      userId,
      contentId,
      contentType,
      accuracy,
    });
    await newProgress.save();
    res.status(201).json(newProgress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user progress
router.get("/:userId", async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
