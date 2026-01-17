import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/sharans-ecommerce");
    console.log("Connected to MongoDB");

    const email = "admin@sharans.com";
    const password = "admin123";

    // Check if exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("Admin user already exists. Updating role to admin...");
      existingAdmin.role = "admin";
      await existingAdmin.save();
      console.log(`Admin updated: ${email}`);
    } else {
      const admin = await User.create({
        name: "Super Admin",
        email,
        password,
        role: "admin",
      });
      console.log(`Admin created: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
