import Cart from "../models/cart.model.js";
import CartItem from "../models/cartItem.model.js";
import Coupon from "../models/coupon.model.js";
import { calculateCartTotal } from "../utils/calculateCartTotal.js";

// Get or Create Cart(Create the cart)
export const getOrCreateCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items",
      populate: { path: "product" },
    });
    if (!cart) cart = await Cart.create({ user: req.user._id });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Item to Cart
export const addItemToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id });

    let item = await CartItem.findOne({ cart: cart._id, product: productId });
    if (item) item.quantity += quantity;
    else
      item = await CartItem.create({
        cart: cart._id,
        product: productId,
        quantity,
      });

    await item.save();
    if (!cart.items.includes(item._id)) cart.items.push(item._id);

    cart.total = await calculateCartTotal(CartItem, cart._id);
    await cart.save();

    res.status(200).json({ message: "Item added", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove Item from Cart
export const removeItemFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await CartItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    await CartItem.findByIdAndDelete(itemId);
    const cart = await Cart.findById(item.cart);
    cart.items.pull(itemId);
    cart.total = await calculateCartTotal(CartItem, cart._id);
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply Coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon" });
    if (coupon.expiry && new Date() > new Date(coupon.expiry))
      return res.status(400).json({ message: "Coupon expired" });

    const total = await calculateCartTotal(CartItem, cart._id);
    if (total < coupon.minPurchase)
      return res
        .status(400)
        .json({ message: `Minimum purchase ₹${coupon.minPurchase} required` });

    cart.coupon = coupon._id;
    cart.total = total;
    await cart.save();

    res.status(200).json({ message: "Coupon applied", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear Cart
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.deleteMany({ cart: cart._id });
    cart.items = [];
    cart.total = 0;
    cart.coupon = null;
    await cart.save();

    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
