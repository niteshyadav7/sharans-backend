import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_dummy";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

console.log("Initializing Razorpay with:", RAZORPAY_KEY_ID);

export const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
