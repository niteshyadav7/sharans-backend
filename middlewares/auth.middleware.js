import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, "hello my name is nitesh yadav");
    req.user = await User.findById(decoded.id).select("-password");
    req.user.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};

// Admin Only
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") next();
  else res.status(403).json({ message: "Admin access only" });
};
