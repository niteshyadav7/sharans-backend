import User from "../models/user.model.js";

// Get all users (Admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle user active status (Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
     res.status(500).json({ message: error.message });
  }
};

// Delete user (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
