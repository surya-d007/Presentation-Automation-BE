// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../schema/studentSchema"); // Import User schema

// Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password, regNo } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password || !regNo) {
    return res
      .status(400)
      .json({ message: "Name, email, regNo and password are required" });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new user
    const newUser = new User({ name, email, password, regNo });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // If login is successful, respond with user info (excluding password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
