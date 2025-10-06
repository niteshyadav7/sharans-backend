export const calculateCartTotal = async (CartItem, cartId) => {
  const items = await CartItem.find({ cart: cartId }).populate("product");
  return items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
};
// this is for the calculate the CartTotal
