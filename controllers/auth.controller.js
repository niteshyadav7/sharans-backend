
// import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import { generateToken } from "../server.js";
// import { generateToken } from "../utils/generateToken.js";

// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------
// GET ALL USERS (Admin)
// ----------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ----------------------------
// UPDATE PROFILE (Logged-in User)
// ----------------------------
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id); // req.user from protect middleware
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id, updatedUser.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Login Admin
// export const loginAdmin = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const admin = await Admin.findOne({ email });
//     if (!admin || !(await admin.matchPassword(password)))
//       return res.status(401).json({ message: "Invalid email or password" });

//     res.json({
//       _id: admin._id,
//       name: admin.name,
//       email: admin.email,
//       role: "admin",
//       token: generateToken(admin._id, "admin"),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
