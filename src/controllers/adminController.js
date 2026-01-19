const User = require('../models/user/User');
const Word = require('../models/content/Word');
const Sentence = require('../models/content/Sentence');
const bcrypt = require('bcryptjs'); 

// --- USER MANAGEMENT ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Admin Status
exports.toggleAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: "Updated admin status", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW: Update User Details
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    // Prepare data to update
    const updateData = { fullName, email, phone };

    // Only update password if a new one is provided
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true } // Return the updated document
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
};

// ✅ NEW: Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- CONTENT MANAGEMENT ---
exports.getContent = async (req, res) => {
  try {
    const type = req.params.type; // 'words' or 'sentences'
    const data = type === 'words' 
      ? await Word.find().sort({ createdAt: -1 }) 
      : await Sentence.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addContent = async (req, res) => {
  try {
    const { text, type } = req.body;
    const newItem = type === 'words' 
      ? new Word({ text }) 
      : new Sentence({ text });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (type === 'words') await Word.findByIdAndDelete(id);
    else await Sentence.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { id, type } = req.params; // type = 'words' or 'sentences'
    const { text } = req.body;

    let updatedItem;
    if (type === 'words') {
      updatedItem = await Word.findByIdAndUpdate(id, { text }, { new: true });
    } else {
      updatedItem = await Sentence.findByIdAndUpdate(id, { text }, { new: true });
    }

    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Updated successfully", item: updatedItem });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};