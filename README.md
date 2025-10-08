<!-- API -->

<!-- Creating the USER -->
<!-- POST -->
<!-- http://localhost:8080/api/auth/register -->
<!-- login -->
<!-- http://localhost:8080/api/auth/login -->

<!-- Admin Login -->
<!-- http://localhost:8080/api/auth/admin/login -->


<!-- Product add -->
<!-- /api/products -->
<!-- Coupon Code -->
<!-- /api/coupons -->
<!-- /api/coupons/bulk -->

<!-- Admin -->

{
    "name": "Test Admin",
    "email": "admintest@gmail.com",
    "password": "test@123"
}


<!-- user -->
{
  "name": "Nitesh Yadav",
  "email": "nitesh@test.com",
  "password": "Password@123",
  "role": "user"
}
<!-- product -->
{
  "name": "Organic Aloe Vera Gel",
  "description": "Pure organic aloe vera gel for skin and hair care.",
  "originalPrice": 499,
  "currentPrice": 349,
  "stock": 120,
  "category": "Skin Care",
  "images": [
    "https://example.com/images/aloe1.jpg",
    "https://example.com/images/aloe2.jpg"
  ],
  "sku": "ALOE-GEL-001"
}
<!-- coupon bulk -->
{
  "prefix": "SUMMAR",
  "number": 10,
  "discountType": "fixed",
  "discountValue": 50,
  "expiryDate": "2025-12-31",
  "minPurchase": 200,
  "maxDiscount": 50,
  "usageLimit": 3
}
<!-- coupon single -->
{
  "code": "SINGLE100",
  "discountType": "percentage",
  "discountValue": 20,
  "expiryDate": "2025-12-31",
  "minPurchase": 100,
  "maxDiscount": 200,
  "usageLimit": 5
}

<!-- API: http://localhost:8080/api/cart    get -->
<!-- API: http://localhost:8080/api/cart/add    add to cart item  post-->
<!-- http://localhost:8080/api/cart/apply-coupon apply coupon on the cart post-->
<!-- http://localhost:8080/api/cart/remove/68e4a013d09f7f246e03b79c remove item from the cart  delete--> 
<!-- http://localhost:8080/api/cart/clear clear items from the cart delete-->

{
  "productId": "68e0d24329019fbcc7324e7d",
  "quantity": 2
}
{
  "code": "DIWALI1C012E"
}




+---------+          +-----------+          +-----------+
|  Users  | 1      * |   Carts   | 1      * | CartItems |
+---------+          +-----------+          +-----------+
| user_id |----------| cart_id   |----------| item_id   |
| name    |          | user_id   |          | cart_id   |
| email   |          | total     |          | product_id|
+---------+          | coupon_id |          | quantity  |
                     +-----------+          +-----------+
                           |
                           | * 
                           | 
                     +-----------+
                     |  Coupons  |
                     +-----------+
                     | coupon_id |
                     | code      |
                     | type      |  <-- ('percentage' or 'flat')
                     | value     |  <-- (10 = 10% or 100 = ₹100 off)
                     | expiry    |
                     | minAmount |
                     | maxDiscount|
                     +-----------+

+-----------+
| Products  | 
+-----------+
| product_id|
| name      |
| price     |
| stock     |
+-----------+

+-----------+
|  Orders   |
+-----------+
| order_id  |
| user_id   |
| cart_id   |
| total     |
| final_amt |
| coupon_id |
+-----------+
