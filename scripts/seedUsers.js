import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

const sampleUsers = [
  { name: "Aarav Sharma", email: "aarav@example.com", phone: "9876543201", gender: "male" },
  { name: "Vivaan Gupta", email: "vivaan@example.com", phone: "9876543202", gender: "male" },
  { name: "Aditya Verma", email: "aditya@example.com", phone: "9876543203", gender: "male" },
  { name: "Vihaan Singh", email: "vihaan@example.com", phone: "9876543204", gender: "male" },
  { name: "Arjun Kumar", email: "arjun@example.com", phone: "9876543205", gender: "male" },
  { name: "Sai Iyer", email: "sai@example.com", phone: "9876543206", gender: "male" },
  { name: "Reyansh Reddy", email: "reyansh@example.com", phone: "9876543207", gender: "male" },
  { name: "Ayaan Khan", email: "ayaan@example.com", phone: "9876543208", gender: "male" },
  { name: "Krishna Das", email: "krishna@example.com", phone: "9876543209", gender: "male" },
  { name: "Ishaan Nair", email: "ishaan@example.com", phone: "9876543210", gender: "male" },
  { name: "Diya Patel", email: "diya@example.com", phone: "9876543211", gender: "female" },
  { name: "Saanvi Rao", email: "saanvi@example.com", phone: "9876543212", gender: "female" },
  { name: "Ananya Joshi", email: "ananya@example.com", phone: "9876543213", gender: "female" },
  { name: "Aadhya Mehta", email: "aadhya@example.com", phone: "9876543214", gender: "female" },
  { name: "Kiara Malhotra", email: "kiara@example.com", phone: "9876543215", gender: "female" },
  { name: "Pari Kapoor", email: "pari@example.com", phone: "9876543216", gender: "female" },
  { name: "Riya Jain", email: "riya@example.com", phone: "9876543217", gender: "female" },
  { name: "Anika Agarwal", email: "anika@example.com", phone: "9876543218", gender: "female" },
  { name: "Myra Saxena", email: "myra@example.com", phone: "9876543219", gender: "female" },
  { name: "Navya Tiwari", email: "navya@example.com", phone: "9876543220", gender: "female" }
];

const seedUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
       console.error("MONGO_URI not found in environment");
       process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Remove duplicates if re-running (optional, but good for testing)
    // await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });

    let count = 0;
    for (const userData of sampleUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        // Pass plain password, let User model hash it in pre-save hook
        await User.create({
          ...userData,
          password: "password123", 
          role: "user",
          loyaltyPoints: Math.floor(Math.random() * 500),
          isEmailVerified: true
        });
        count++;
      }
    }

    console.log(`Successfully seeded ${count} new customers.`);
    process.exit();
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
