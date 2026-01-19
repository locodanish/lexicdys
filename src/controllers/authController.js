const bcrypt = require('bcryptjs');
const User = require('../models/user/User');

// Logic for Sign Up
exports.signup = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      isAdmin: false
    });

    await newUser.save();

    // ✅ FIXED: Now returning the user ID so the frontend can use it
    res.status(201).json({ 
      message: "User registered successfully!",
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      }
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logic for Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("1. Login Attempt Received:", email);

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: "User not found. Please Sign Up." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Send back user info
    res.json({
      message: "Login Successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin || false
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};