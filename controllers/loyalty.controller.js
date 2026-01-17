import User from '../models/user.model.js';
import PointTransaction from '../models/pointTransaction.model.js';
import Coupon from '../models/coupon.model.js';
import crypto from 'crypto';
import GlobalSettings from '../models/settings.model.js';

// Get Loyalty Profile
export const getLoyaltyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints referralCode');
    const history = await PointTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate total earned/spent statistics if needed
    
    res.json({
      success: true,
      points: user.loyaltyPoints,
      referralCode: user.referralCode,
      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
      history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Redeem Points for Coupon
export const redeemPoints = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    
    if (pointsToRedeem < 50) {
      return res.status(400).json({ success: false, message: 'Minimum 50 points required to redeem' });
    }

    const user = await User.findById(req.user._id);
    
    if (user.loyaltyPoints < pointsToRedeem) {
      return res.status(400).json({ success: false, message: 'Insufficient points' });
    }

    // Conversion logic
    const settings = await GlobalSettings.findOne() || {};
    const rate = settings.pointsToRupeeRate || 1;
    const discountAmount = pointsToRedeem * rate;
    
    // Generate Coupon
    const code = `RDM${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30); // Valid for 30 days

    const coupon = await Coupon.create({
      code,
      discountType: 'fixed',
      discountValue: discountAmount,
      minPurchase: discountAmount * 2, // Min purchase rule
      expiryDate: expiry,
      usageLimit: 1
    });

    // Deduct points
    user.loyaltyPoints -= pointsToRedeem;
    await user.save();

    // Log transaction
    await PointTransaction.create({
      user: user._id,
      amount: -pointsToRedeem,
      type: 'redeemed',
      description: `Redeemed for coupon ${code} (₹${discountAmount})`
    });

    res.json({
      success: true,
      message: `Redeemed ${pointsToRedeem} points for ₹${discountAmount} voucher`,
      couponCode: code,
      pointsRemaining: user.loyaltyPoints
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
