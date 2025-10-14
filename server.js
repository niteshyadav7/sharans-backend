import express from "express";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import compression from "compression";
import winston from "winston";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import { protect } from "./middlewares/auth.middleware.js";
import productRoutes from "./routes/product.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();
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
app.use(cors());
// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// app.use(cors({ origin: "https://sharans-backend.onrender.com", credentials: true }));
app.use(helmet());
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);

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

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/categories", categoryRoutes);
// utils

//---------------razorpay-----------------
export const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

//-----------------generate token----------
export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: "7d",
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
