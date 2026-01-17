# 🛍️ Sharans E-Commerce Backend

A robust and scalable Node.js e-commerce backend API with MongoDB, featuring comprehensive cart management, order processing, coupon system, and Razorpay payment integration.

## ✨ Features

- 🔐 **JWT Authentication & Authorization** - Secure user authentication with role-based access control
- 🛒 **Shopping Cart Management** - Add, update, remove items with real-time total calculation
- 📦 **Order Processing** - Support for both COD and Razorpay online payments
- 🎫 **Coupon System** - Flexible discount coupons with usage tracking and validation
- 📊 **Admin Dashboard** - Manage products, categories, orders, and users
- 📤 **Bulk Upload** - CSV import for products and categories
- 🔒 **Security** - Helmet, CORS, rate limiting, and input validation
- 📝 **Comprehensive Logging** - Winston logger with file and console outputs
- 🚀 **Performance** - Response compression and optimized queries
- 🎯 **Dynamic Shipping** - Configurable shipping costs

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Database:** MongoDB 6.0+ with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Payment Gateway:** Razorpay
- **Logging:** Winston
- **Validation:** Express Validator
- **Security:** Helmet, CORS, Express Rate Limit
- **File Upload:** Multer
- **CSV Processing:** csvtojson

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js >= 18.0.0
- MongoDB >= 6.0.0
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/niteshyadav7/sharans-backend.git
cd sharans-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server
NODE_ENV=development
PORT=8080

# Database
MONGO_URI=mongodb://localhost:27017/sharans-ecommerce

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 5. Run the Application

**Development mode:**
```bash
npm start
```

The server will start on `http://localhost:8080`

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "1234567890"
}
```

#### Get All Users (Admin Only)
```http
GET /api/auth/all
Authorization: Bearer <admin-token>
```

#### Toggle User Status (Admin Only)
```http
PATCH /api/auth/toggle/:userId
Authorization: Bearer <admin-token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "originalPrice": 1000,
  "currentPrice": 800,
  "stock": 50,
  "category": "category_id",
  "images": ["image_url_1", "image_url_2"]
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin-token>
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

#### Bulk Upload Products (Admin Only)
```http
POST /api/products/bulk
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

file: products.csv
```

### Category Endpoints

#### Get All Categories
```http
GET /api/categories
```

#### Create Category (Admin Only)
```http
POST /api/categories
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Category Name",
  "description": "Category description"
}
```

#### Bulk Upload Categories (Admin Only)
```http
POST /api/categories/bulk
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

file: categories.csv
```

### Cart Endpoints

#### Get Cart
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/remove/:itemId
Authorization: Bearer <token>
```

#### Apply Coupon
```http
POST /api/cart/apply-coupon
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE20"
}
```

#### Clear Cart
```http
DELETE /api/cart/clear
Authorization: Bearer <token>
```

### Order Endpoints

#### Create Order
```http
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "COD",
  "shippingAddress": {
    "name": "John Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip": "400001",
    "country": "India"
  }
}
```

#### Verify Razorpay Payment
```http
POST /api/orders/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_id",
  "razorpay_payment_id": "payment_id",
  "razorpay_signature": "signature"
}
```

#### Get User Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get All Orders (Admin Only)
```http
GET /api/orders/all?page=1&limit=50
Authorization: Bearer <admin-token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "shipped"
}
```

### Coupon Endpoints (Admin Only)

#### Create Coupon
```http
POST /api/coupons
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "code": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchase": 500,
  "maxDiscount": 200,
  "usageLimit": 100,
  "expiryDate": "2026-12-31"
}
```

#### Bulk Generate Coupons
```http
POST /api/coupons/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "prefix": "SAVE",
  "number": 100,
  "discountType": "fixed",
  "discountValue": 50,
  "minPurchase": 500,
  "usageLimit": 1
}
```

#### Get All Coupons
```http
GET /api/coupons
Authorization: Bearer <admin-token>
```

#### Delete Coupon
```http
DELETE /api/coupons/:id
Authorization: Bearer <admin-token>
```

### Health Check

```http
GET /health
```

Response:
```json
{
  "success": true,
  "status": "UP",
  "db": "connected",
  "uptime": 12345.67,
  "timestamp": "2026-01-16T12:00:00.000Z"
}
```

## 🗂️ Project Structure

```
sharans-backend/
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── cart.controller.js
│   ├── category.controller.js
│   ├── coupon.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   └── shippingController.js
├── middlewares/          # Custom middleware
│   ├── auth.middleware.js
│   └── validators.js
├── models/               # Mongoose schemas
│   ├── admin.model.js
│   ├── cart.model.js
│   ├── cartItem.model.js
│   ├── category.model.js
│   ├── coupon.model.js
│   ├── order.model.js
│   ├── product.model.js
│   ├── shippingModel.js
│   └── user.model.js
├── routes/               # API routes
│   ├── auth.routes.js
│   ├── cart.routes.js
│   ├── category.routes.js
│   ├── coupon.routes.js
│   ├── order.routes.js
│   ├── product.routes.js
│   └── shippingRoutes.js
├── utils/                # Utility functions
│   └── calculateCartTotal.js
├── logs/                 # Application logs
├── uploads/              # Uploaded files
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
├── server.js            # Application entry point
├── CODEBASE_REVIEW.md   # Comprehensive code review
├── IMPLEMENTATION_PROGRESS.md  # Implementation status
└── QUICK_FIX_GUIDE.md   # Quick fix instructions
```

## 🔒 Security Features

- **Helmet.js** - Sets various HTTP headers for security
- **CORS** - Configured with origin whitelist
- **Rate Limiting** - Prevents brute force attacks
  - General: 100 requests per 15 minutes
  - Auth routes: 5 attempts per 15 minutes
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Express Validator on all endpoints
- **MongoDB Injection Protection** - Mongoose sanitization

## 📊 Database Models

### User
- name, email, password (hashed)
- phone, profileImage, address
- dateOfBirth, gender, bio
- role (user/admin), isActive

### Product
- name, description, SKU
- originalPrice, currentPrice, currency
- stock, category, brand, tags
- size, netQuantity, capacity, type
- skinType, gender, features
- images, seller info, delivery options
- status (active/inactive/out-of-stock)

### Order
- user, items (product, quantity, price)
- shippingAddress
- totalAmount, paymentMethod, paymentStatus
- orderStatus, Razorpay IDs

### Cart
- user, items (CartItem references)
- total, coupon

### Coupon
- code, discountType (percentage/fixed)
- discountValue, expiryDate
- minPurchase, maxDiscount
- usageLimit, usedCount

## 🧪 Testing

Currently, the project doesn't have automated tests. To test manually:

1. Use Postman or Thunder Client
2. Import the API endpoints
3. Test each endpoint with valid and invalid data
4. Check rate limiting by making multiple requests
5. Verify authentication and authorization

## 📝 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

In development mode, logs are also output to the console with colors.

## 🚨 Known Issues & Fixes

See `IMPLEMENTATION_PROGRESS.md` for:
- Completed security fixes
- Remaining critical bugs
- Recommended improvements

See `QUICK_FIX_GUIDE.md` for step-by-step fix instructions.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Nitesh Yadav**

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Mongoose team for the MongoDB ODM
- Razorpay for payment integration
- All open-source contributors

## 📞 Support

For support, email niteshyadav7@example.com or open an issue in the repository.

---

**⭐ If you find this project helpful, please give it a star!**
