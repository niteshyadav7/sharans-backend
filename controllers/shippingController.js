import Shipping from "../models/shippingModel.js";

// ✅ Create or Update Shipping Amount
export const updateShippingAmount = async (req, res) => {
  try {
    const { amount } = req.body;

    if (amount == null || amount < 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    // Only one document — update if exists, else create
    let shipping = await Shipping.findOne();

    if (shipping) {
      shipping.amount = amount;
      await shipping.save();
      return res.status(200).json({
        success: true,
        message: "Shipping amount updated successfully",
        shipping,
      });
    } else {
      shipping = await Shipping.create({ amount });
      return res.status(201).json({
        success: true,
        message: "Shipping amount added successfully",
        shipping,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Current Shipping Amount
export const getShippingAmount = async (req, res) => {
  try {
    const shipping = await Shipping.findOne();
    if (!shipping) {
      return res.status(200).json({ success: true, amount: 0 });
    }

    res.status(200).json({ success: true, amount: shipping.amount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
