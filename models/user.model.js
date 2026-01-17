import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

    // Admin control
    isActive: { type: Boolean, default: true },

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Loyalty & Referral
    loyaltyPoints: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isReferralBonusPaid: { type: Boolean, default: false }, // Has the referrer been paid?

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

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Indexes for performance
userSchema.index({ email: 1 }); // Unique index for email lookups
userSchema.index({ role: 1, isActive: 1 }); // Compound index for admin queries

const User = mongoose.model("User", userSchema);
export default User;
