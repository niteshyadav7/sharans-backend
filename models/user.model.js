

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//       minlength: 3,
//       maxlength: 50,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       match: [
//         /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
//         "Please provide a valid email",
//       ],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: 6,
//     },
//     phone: {
//       type: String,
//       maxlength: 15,
//     },
//     profileImage: {
//       type: String, // can store a URL
//       default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
//     },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       postalCode: String,
//       country: String,
//     },
//     dateOfBirth: {
//       type: Date,
//     },
//     gender: {
//       type: String,
//       enum: ["male", "female", "other"],
//     },
//     bio: {
//       type: String,
//       maxlength: 300,
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin"],
//       default: "user",
//     },
//   },
//   { timestamps: true }
// );

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare password
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const User = mongoose.model("User", userSchema);
// export default User;


import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, minlength: 3, maxlength: 50 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6 },
    phone: { type: String, maxlength: 15 },
    profileImage: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    bio: { type: String, maxlength: 300 },
    role: { type: String, enum: ["user", "admin"], default: "user" },

    // New field for admin control
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
