# Admin Panel Guide

## 🚀 Getting Started

1.  **Backend Server**:
    *   Typically runs on port `5000`.
    *   Command: `npm run dev` (in root folder)

2.  **Admin Frontend**:
    *   Runs on port `5173`.
    *   Command: `cd admin && npm run dev`

## 🔑 Login
*   URL: `http://localhost:5173/login`
*   Credentials: Use an account with `role: 'admin'`.
    *   If you don't have one, use Compass/Mongo Shell to set a user's role:
        ```javascript
        db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
        ```

## 🛠 Features

### Products
*   **List**: View all products with images and stock status.
*   **Add/Edit**: Create products and **upload images**.
*   **Delete**: Remove products from catalog.

### Orders
*   **Kanban/List**: View orders by status (Processing, Shipped, Delivered).
*   **Status Update**: Change order status directly from the dropdown.

### Coupons
*   **Create**: Generate discount codes (percentage based).
*   **Manage**: Delete expired or unused coupons.

### Categories
*   **CRUD**: Create, Edit, and Delete product categories.

### Customers
*   **Manage**: View detailed customer list.
*   **Block/Unblock**: Toggle user status (Active/Deactivated).

### Settings
*   **Shipping**: Configure the global shipping fee.

## ⚠️ Troubleshooting
*   **CORS Error**: Ensure backend `server.js` allows `http://localhost:5173`. (It defaults to allow all).

*   **401 Unauthorized**: If your token expires, you will be redirected to Login.

---
**Enjoy managing your store!** 🛍️
