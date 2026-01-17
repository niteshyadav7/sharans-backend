import User from "../models/user.model.js";
import { generateToken } from "../server.js";
import crypto from "crypto";
import { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendWelcomeEmail 
} from "../utils/emailService.js";


// Register User
export const registerUser = async (req, res) => {
  const { name, email, password, referralCode } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ success: false, message: "Email already exists" });

    // Generate unique referral code (First 4 chars of name + random string)
    // Clean name to alphanumeric
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
    const randomStr = crypto.randomBytes(2).toString('hex').toUpperCase();
    const newReferralCode = `${cleanName}${randomStr}`;

    // Validating referrer
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      referralCode: newReferralCode,
      referredBy
    });
    
    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    
    // Send verification email
    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode,
      },
      token: generateToken(user._id, user.role),

    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "User is blocked" });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        referralCode: user.referralCode,
        loyaltyPoints: user.loyaltyPoints,
      },
      token: generateToken(user._id, user.role),

    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Hash the token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    res.json({
      success: true,
      message: 'Email verified successfully! You can now access all features.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resend Verification Email
export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }
    
    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();
    
    // Send verification email
    await sendVerificationEmail(user, verificationToken);
    
    res.json({
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email address',
      });
    }
    
    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save();
    
    // Send reset email
    try {
      await sendPasswordResetEmail(user, resetToken);
      
      res.json({
        success: true,
        message: 'Password reset email sent! Please check your inbox.',
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      throw new Error('Failed to send password reset email');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash the token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }
    
    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.profileImage = req.body.profileImage || user.profileImage;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.gender = req.body.gender || user.gender;
    user.bio = req.body.bio || user.bio;

    // Update address if provided
    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address,
      };
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle User Status (Admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User is now ${user.isActive ? "Active" : "Blocked"}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
