// import Coupon from "../models/Coupon.js";
import crypto from "crypto";
import Coupon from "../models/coupon.model.js";

// Create single coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expiryDate,
      minPurchase,
      maxDiscount,
      usageLimit,
    } = req.body;

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      expiryDate,
      minPurchase,
      maxDiscount,
      usageLimit,
    });

    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk generate coupons
export const generateBulkCoupons = async (req, res) => {
  try {
    const {
      prefix,
      number,
      discountType,
      discountValue,
      expiryDate,
      minPurchase,
      maxDiscount,
      usageLimit,
    } = req.body;

    const coupons = [];
    for (let i = 0; i < number; i++) {
      const code = `${prefix}${crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase()}`;
      coupons.push({
        code,
        discountType,
        discountValue,
        expiryDate,
        minPurchase,
        maxDiscount,
        usageLimit,
      });
    }

    await Coupon.insertMany(coupons);
    res
      .status(201)
      .json({ message: `${number} coupons generated successfully!` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
