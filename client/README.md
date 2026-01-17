# Sharans E-Commerce Frontend

A modern, responsive React-based e-commerce frontend built with Vite, inspired by the sharans.in design.

## 🎨 Design System

### Colors
- **Primary**: `#D6B370` (Terracotta/Burnt Orange)
- **Secondary**: `#8A8A4E` (Olive Green)
- **Cream**: `#F5EDE4`
- **White**: `#FFFFFF`
- **Black**: `#1A1A1A`

### Typography
- **Headings**: Playfair Display (Serif)
- **Body**: Inter (Sans-serif)

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── assets/          # Images, icons, fonts
│   ├── components/      # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── ProductCard.jsx
│   │   ├── CategoryCard.jsx
│   │   └── ...
│   ├── context/         # React Context
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── Account.jsx
│   ├── utils/           # Utility functions
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── package.json
└── vite.config.js
```

## 🚀 Features Implemented

### Core Features
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Authentication** - Login/Register with JWT
- ✅ **Shopping Cart** - Add, remove, update quantities
- ✅ **Product Catalog** - Browse, filter, search
- ✅ **Product Details** - Images, descriptions, reviews
- ✅ **Checkout Process** - Order placement
- ✅ **User Account** - Order history, profile management

### UI/UX Features
- ✅ **Smooth Scroll-to-Top** - On every page navigation
- ✅ **Hover Effects** - Interactive product cards
- ✅ **Loading States** - Skeleton loaders
- ✅ **Toast Notifications** - User feedback
- ✅ **Form Validation** - Client-side validation
- ✅ **Responsive Navigation** - Mobile menu

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: CSS3 with CSS Variables

## 📦 Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your backend URL
VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔗 API Integration

The frontend connects to your existing backend at `http://localhost:3000/api`.

### API Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /products` - Get all products
- `GET /products/:id` - Get product details
- `GET /categories` - Get all categories
- `POST /orders` - Create order
- `GET /layout` - Get storefront layout

## 🎯 Pages

### Home (`/`)
- Hero section with featured product
- Brand values (Natural, Cruelty-Free, etc.)
- Bestsellers grid
- Category showcase
- Testimonials

### Products (`/products`)
- Product grid with filters
- Search functionality
- Category filtering
- Price sorting
- Pagination

### Product Detail (`/products/:id`)
- Product images gallery
- Description & specifications
- Add to cart
- Related products
- Customer reviews

### Cart (`/cart`)
- Cart items list
- Quantity controls
- Price summary
- Proceed to checkout

### Checkout (`/checkout`)
- Shipping information
- Payment method
- Order summary
- Place order

### Account (`/account`)
- Order history
- Profile information
- Address management

## 🎨 Component Library

### Header
- Logo
- Navigation menu
- Cart icon with badge
- User menu / Sign In/Up buttons

### Footer
- About Sharans
- Customer Support links
- Social media icons
- Newsletter subscription

### ProductCard
- Product image
- Name & brand
- Price (with discount)
- Star rating
- Add to cart button

### CategoryCard
- Category image
- Category name
- Product count
- Shop Now button

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token sent with every API request
4. Auto-logout on 401 response

## 🛒 Cart Management

- Cart stored in localStorage
- Persists across sessions
- Real-time total calculation
- Quantity validation

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

```bash
# Build for production
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Your own server
```

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

This is a custom project for Sharans e-commerce platform.

## 📄 License

Proprietary - All rights reserved

---

Built with ❤️ for Sharans Natural Beauty Products
