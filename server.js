// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express"; // server start
import http from "http";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import compression from "compression";
import winston from "winston";
import fs from "fs";
import path from "path";
import passport from "passport";
import configurePassport from "./config/passport.js";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middlewares/auth.middleware.js";
import productRoutes from "./routes/product.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import reviewRoutes from "./routes/review.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import loyaltyRoutes from "./routes/loyalty.routes.js";
import giftCardRoutes from "./routes/giftCard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import layoutRoutes from "./routes/layout.routes.js";

import Razorpay from "razorpay";



import jwt from "jsonwebtoken";


// Environment variables are already loaded
const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "production";
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// ---------- Ensure logs folder exists ----------
const logDir = "logs";
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// ---------- Winston Logger ----------
const logger = winston.createLogger({
  level: NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

// Console logging for development
if (NODE_ENV === "development") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// ---------- Express App ----------
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configure CORS

// ---------- CORS Configuration ----------
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(compression());

// Initialize Passport
app.use(passport.initialize());
configurePassport(passport);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.", 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // 5 attempts
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// HTTP request logging via morgan integrated with Winston
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.json({
    success: true,
    env: NODE_ENV,
    message:
      "🚀 Enterprise Express + MongoDB + Winston Logging Server Running!",
  });
});

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    success: true,
    status: "UP",
    db: dbState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// ---------- Error Handler ----------
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// ---------- Database ----------
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {});
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// ---------- HTTP Server ----------
const server = http.createServer(app);

// ---------- Graceful Shutdown ----------
async function gracefulShutdown(signal) {
  logger.info(`⚠️  Received ${signal}. Closing server...`);
  server.close(async () => {
    logger.info("✅ HTTP server closed.");
    try {
      await mongoose.connection.close(false);
      logger.info("✅ MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      logger.error("❌ Error closing MongoDB:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("❌ Could not close in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
}

["SIGINT", "SIGTERM"].forEach((signal) =>
  process.on(signal, () => gracefulShutdown(signal))
);

// routes
app.get("/api/protected", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, role: ${req.user.role}` });
});

// Apply stricter rate limiting to auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/gift-cards", giftCardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/layout", layoutRoutes);
// utils









//-----------------generate token----------
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "1d",
  });
};

// ---------- Start ----------
connectDB().then(() => {
  server.listen(PORT, () => {
    logger.info(
      `🚀 Server running on http://localhost:${PORT} in ${NODE_ENV} mode`
    );
  });
});
