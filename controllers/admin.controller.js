import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Revenue & Total Orders
    const orderStats = await Order.aggregate([
      { $match: { paymentStatus: "paid" } }, // Only paid orders
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // 2. Count Documents
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

    // 3. Recent Orders (Last 5)
    const recentOrders = await Order.find()
      .select("totalAmount orderStatus createdAt user")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Daily Sales (Last 7 days) for Chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailySales = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        revenue: orderStats[0]?.totalRevenue || 0,
        orders: orderStats[0]?.totalOrders || 0,
        users: totalUsers,
        products: totalProducts,
        lowStock: lowStockProducts,
      },
      recentOrders,
      dailySales
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
