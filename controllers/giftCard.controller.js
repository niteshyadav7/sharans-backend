import GiftCard from '../models/giftCard.model.js';
import crypto from 'crypto';

// Admin: Generate new gift card
export const generateGiftCard = async (req, res) => {
  try {
    const { amount, recipientEmail, message, expiryDays = 365 } = req.body;

    const code = `GC${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    const giftCard = await GiftCard.create({
      code,
      initialValue: amount,
      currentBalance: amount,
      expiryDate,
      recipientEmail,
      message,
      purchasedBy: req.user._id // Admin ID
    });

    // Notify recipient if email provided
    if (recipientEmail) {
      // Logic to send email would go here
      // await sendEmail(...) 
      console.log(`Email would be sent to ${recipientEmail} with code ${code}`);
    }

    res.status(201).json({
      success: true,
      message: 'Gift card generated',
      giftCard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check Balance
export const checkBalance = async (req, res) => {
  try {
    const { code } = req.body;
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Invalid gift card code' });
    }

    if (giftCard.status !== 'active') {
      return res.status(400).json({ success: false, message: `Gift card is ${giftCard.status}` });
    }

    if (new Date() > giftCard.expiryDate) {
      return res.status(400).json({ success: false, message: 'Gift card has expired' });
    }

    res.json({
      success: true,
      balance: giftCard.currentBalance,
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get All Gift Cards
export const getAllGiftCards = async (req, res) => {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    res.json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Admin: Toggle gift card status
export const toggleGiftCardStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);

    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    // Toggle between active and disabled
    giftCard.status = giftCard.status === 'active' ? 'disabled' : 'active';
    await giftCard.save();

    res.json({
      success: true,
      message: `Gift card ${giftCard.status}`,
      giftCard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete gift card
export const deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findByIdAndDelete(id);

    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }

    res.json({
      success: true,
      message: 'Gift card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
