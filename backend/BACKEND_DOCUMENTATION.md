# TileBazaar Backend Documentation

This backend powers the TileBazaar ecommerce API. It is built with Express, TypeScript, Supabase, JWT authentication, Cloudinary image uploads, and Nodemailer email delivery.

## 1. Backend Purpose

The backend is responsible for:

- Handling user registration, login, profile updates, and password reset.
- Protecting private routes with JWT authentication.
- Protecting admin routes with role-based authorization.
- Managing products and product images.
- Managing customer carts.
- Creating orders from cart items.
- Giving admins dashboard stats, order management, customer management, and inventory management.
- Connecting the application to external services like Supabase, Cloudinary, and Gmail.

The frontend should call this backend through `/api/...` routes.

## 2. Main Technologies Used

| Technology         | Where Used                                 | Why It Is Used                                   | Purpose                                                     |
| ------------------ | ------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| Express            | `src/index.ts`, route files                | Lightweight Node.js API framework                | Creates HTTP routes and handles requests/responses          |
| TypeScript         | Entire `src` folder                        | Adds type checking and safer backend development | Helps catch mistakes before runtime                         |
| Supabase           | `src/config/supabase.ts`, controllers      | Database client for app data                     | Stores users, products, cart items, orders, and order items |
| JWT                | `authController.ts`, `authMiddleware.ts`   | Stateless authentication                         | Lets the backend identify logged-in users from a token      |
| bcryptjs           | `authController.ts`                        | Password hashing                                 | Stores secure hashed passwords instead of plain text        |
| Cloudinary         | `cloudinary.ts`, product/admin controllers | Image hosting                                    | Uploads and stores product images                           |
| Multer             | `cloudinary.ts`, `multer.ts`               | Handles file upload parsing                      | Reads uploaded product image files into memory              |
| Nodemailer         | `mail.ts`, `authController.ts`             | Email sending                                    | Sends password reset emails                                 |
| Helmet             | `index.ts`                                 | Security middleware                              | Adds safer HTTP headers                                     |
| CORS               | `index.ts`                                 | Frontend/backend communication                   | Allows the frontend URL to call this backend                |
| express-rate-limit | `index.ts`                                 | API abuse protection                             | Limits repeated API calls from the same IP                  |
| dotenv             | Config files and `index.ts`                | Environment variable loading                     | Keeps secrets and config outside code                       |

## 3. Project Structure

```text
backend/
  src/
    config/
      cloudinary.ts
      mail.ts
      multer.ts
      supabase.ts
    controllers/
      adminController.ts
      authController.ts
      cartController.ts
      orderController.ts
      productController.ts
    middlewares/
      authMiddleware.ts
    models/
      cartModel.ts
      orderModel.ts
      productModel.ts
      userModel.ts
    routes/
      adminRoutes.ts
      authRoutes.ts
      cartRoutes.ts
      orderRoutes.ts
      productRoutes.ts
    utils/
      slugify.ts
    index.ts
```

## 4. Application Entry Point

### `src/index.ts`

This file starts the Express server.

What it does:

- Loads environment variables using `dotenv`.
- Creates the Express app.
- Adds security middleware using `helmet`.
- Enables CORS for the configured frontend URL.
- Parses JSON and URL-encoded request bodies.
- Mounts route groups:
  - `/api/auth`
  - `/api/products`
  - `/api/cart`
  - `/api/orders`
  - `/api/admin`
- Adds rate limiting for `/api` routes.
- Adds a basic health route at `/`.
- Starts the server on `process.env.PORT` or port `5000`.

Important note: in the current code, route mounting happens before rate limiting. That means the limiter is added after the route handlers. Usually, rate limiting should be registered before routes if you want it to apply to all API routes.

## 5. Configuration Files

### `src/config/supabase.ts`

Creates and exports the Supabase client.

Used environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Purpose:

- Allows controllers to query Supabase tables.
- Centralizes the database client so all files reuse the same setup.

### `src/config/cloudinary.ts`

Configures Cloudinary and exports both:

- `cloudinary`: Cloudinary SDK instance.
- `upload`: Multer middleware using memory storage.

Used environment variables:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Purpose:

- Product images are first accepted by Multer.
- Multer keeps the file in memory as a buffer.
- The buffer is streamed to Cloudinary.
- Cloudinary returns a secure image URL.
- That URL is stored in Supabase.

### `src/config/multer.ts`

Also defines Multer memory storage with a 5 MB file limit.

Purpose:

- This is another upload configuration.
- In the current routes, `cloudinary.ts` is the upload config being used.
- This file may be kept for reuse or removed later if unused.

### `src/config/mail.ts`

Creates a Nodemailer transporter using Gmail OAuth2.

Used environment variables:

- `MAIL_USER`
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `OAUTH_REFRESH_TOKEN`

Purpose:

- Sends password reset emails from the backend.
- Keeps email setup separate from controller logic.

## 6. Middleware

### `src/middlewares/authMiddleware.ts`

This file contains authentication and authorization middleware.

### `protect`

Purpose:

- Checks the `Authorization` header for a Bearer token.
- Verifies the token using `JWT_SECRET`.
- Stores decoded user data on `req.user`.
- Allows the request to continue if token is valid.

Expected header:

```text
Authorization: Bearer <token>
```

Used for:

- Cart routes.
- Order routes.
- Profile routes.
- Admin routes.

### `adminOnly`

Purpose:

- Checks whether `req.user.role` is `admin`.
- Allows only admin users to continue.
- Returns `403` for non-admin users.

Used for:

- All `/api/admin` routes.
- Product creation through `/api/products`.

Important note: `authController.ts` signs tokens using fallback secret `tile_secret_key`, but `authMiddleware.ts` verifies with fallback secret `secret`. If `JWT_SECRET` is missing, login tokens may not verify correctly. Always set `JWT_SECRET` in `.env`.

## 7. Utility Files

### `src/utils/slugify.ts`

Converts product text into a URL-friendly slug.

Example:

```text
"Glossy Tile 600/1200" -> "glossy-tile-600x1200"
```

Why it is used:

- Product URLs and identifiers should be readable.
- Spaces become hyphens.
- `/` becomes `x`, useful for tile sizes like `600/1200`.
- Special characters are removed.

## 8. Type Model Files

The files inside `src/models` are TypeScript interfaces. They are not database models like Mongoose schemas. Supabase stores the actual data.

### `userModel.ts`

Defines the shape of a user.

Main fields:

- `id`
- `email`
- `password`
- `role`
- `full_name`
- `phone_number`
- address fields
- `created_at`

Purpose:

- Helps TypeScript understand what a user object should look like.
- Makes controller responses safer and clearer.

### `productModel.ts`

Defines the shape of a product.

Main fields:

- product identity: `id`, `name`, `slug`
- pricing: `price`, `discount_price`
- inventory: `stock`
- tile details: `category`, `finish`, `size`, `thickness`, `material`
- image data: `image`, `gallery`
- status: `is_active`

Purpose:

- Documents product fields used by the API.
- Helps maintain product-related code.

### `cartModel.ts`

Defines cart item types.

Main fields:

- `id`
- `user_id`
- `product_id`
- `quantity`
- optional joined product data

Purpose:

- Describes what a customer cart item contains.

### `orderModel.ts`

Defines order and order item types.

Main fields:

- `Order`: customer, totals, VAT, shipping, status, address, payment status.
- `OrderItem`: product snapshot, quantity, unit, purchase price.

Purpose:

- Keeps order data predictable.
- Stores product snapshots so old orders still show correct product names/prices even if a product changes later.

## 9. Route Files

Route files connect HTTP endpoints to controller functions.

### `src/routes/authRoutes.ts`

Base path: `/api/auth`

| Method | Endpoint                 | Middleware | Controller       | Purpose                              |
| ------ | ------------------------ | ---------- | ---------------- | ------------------------------------ |
| POST   | `/register`              | None       | `register`       | Create a new user                    |
| POST   | `/login`                 | None       | `login`          | Login and return JWT                 |
| POST   | `/forgot-password`       | None       | `forgotPassword` | Send reset password email            |
| POST   | `/reset-password/:token` | None       | `resetPassword`  | Set a new password using reset token |
| PATCH  | `/profile/edit`          | `protect`  | `updateProfile`  | Update logged-in user's profile      |
| GET    | `/profile`               | `protect`  | `getProfile`     | Get logged-in user's profile         |

### `src/routes/productRoutes.ts`

Base path: `/api/products`

| Method | Endpoint | Middleware                                       | Controller       | Purpose                        |
| ------ | -------- | ------------------------------------------------ | ---------------- | ------------------------------ |
| GET    | `/`      | None                                             | `getAllProducts` | Public list of active products |
| GET    | `/:id`   | None                                             | `getProductById` | Public product detail by ID    |
| POST   | `/`      | `protect`, `adminOnly`, `upload.single('image')` | `createProduct`  | Admin creates a product        |

## 10. Supabase `project_inquiries` Table

This backend expects the following Supabase table for inquiry submissions:

- Table name: `public.project_inquiries`
- Used by: `backend/src/controllers/inquiryController.ts`
- Public API route: `POST /api/inquiries`
- Admin API route: `GET /api/admin/inquiries`

Use the SQL file `backend/SQL_CREATE_PROJECT_INQUIRIES_TABLE.sql` to create this table in Supabase.

Required columns:

- `id` — `uuid`, primary key, defaults to `gen_random_uuid()`
- `contact_name` — `text`, not null
- `company_name` — `text`, nullable
- `email` — `text`, not null
- `inquiry_type` — `text`, not null
- `area_sqm` — `numeric`, nullable
- `message` — `text`, nullable
- `created_at` — `timestamptz`, not null, defaults to `now()`

The controller currently also handles a fallback file if the Supabase table is missing, but creating this table ensures inquiries are stored persistently in the database.

### Recommended SQL

Run this in the Supabase SQL editor:

```sql
\set ON_ERROR_STOP on
create extension if not exists "pgcrypto";
create table if not exists public.project_inquiries (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  company_name text,
  email text not null,
  inquiry_type text not null,
  area_sqm numeric,
  message text,
  created_at timestamptz not null default now()
);
```

### After creation

- Confirm the table exists in Supabase.
- Re-submit the contact form from the frontend.
- Verify `GET /api/admin/inquiries` returns stored inquiries.

### `src/routes/cartRoutes.ts`

Base path: `/api/cart`

`router.use(protect)` means all cart endpoints require login.

| Method | Endpoint        | Controller           | Purpose                                  |
| ------ | --------------- | -------------------- | ---------------------------------------- |
| GET    | `/`             | `getMyCart`          | Get logged-in user's cart                |
| POST   | `/`             | `addToCart`          | Add product to cart or increase quantity |
| DELETE | `/:id`          | `removeFromCart`     | Remove a cart item                       |
| PATCH  | `/:id/quantity` | `updateCartQuantity` | Change cart item quantity                |

### `src/routes/orderRoutes.ts`

Base path: `/api/orders`

`router.use(protect)` means all order endpoints require login.

| Method | Endpoint     | Controller     | Purpose                                   |
| ------ | ------------ | -------------- | ----------------------------------------- |
| POST   | `/`          | `createOrder`  | Create an order from current cart         |
| GET    | `/my-orders` | `getMyOrders`  | Get logged-in user's orders               |
| GET    | `/:id`       | `getOrderById` | Get one order if user owns it or is admin |

### `src/routes/adminRoutes.ts`

Base path: `/api/admin`

`router.use(protect, adminOnly)` means every admin route requires login and admin role.

| Method | Endpoint        | Controller          | Purpose                               |
| ------ | --------------- | ------------------- | ------------------------------------- |
| GET    | `/stats`        | `getDashboardStats` | Admin dashboard totals                |
| GET    | `/products`     | `adminGetProducts`  | Get all products, active and inactive |
| POST   | `/products`     | `addProduct`        | Add product with image                |
| PATCH  | `/products/:id` | `updateProduct`     | Update product and optional image     |
| DELETE | `/products/:id` | `deleteProduct`     | Delete product and try deleting image |
| GET    | `/orders`       | `getAllOrders`      | Get all customer orders               |
| GET    | `/orders/:id`   | `adminGetOrderById` | Get full admin order detail           |
| PATCH  | `/orders/:id`   | `updateOrderStatus` | Update order/payment status           |
| GET    | `/users`        | `getAllUsers`       | Get customers with order stats        |
| GET    | `/users/:id`    | `getUserById`       | Get one customer with orders          |

## 10. Controller Files

Controllers contain the actual business logic for each route.

## Auth Controller

File: `src/controllers/authController.ts`

### `register`

Purpose:

- Creates a new customer account.

Flow:

1. Reads user details from `req.body`.
2. Validates required fields: `email`, `password`, `full_name`.
3. Checks Supabase to see if the email already exists.
4. Hashes the password using bcrypt.
5. Inserts the user into the `users` table.
6. Removes password from the response.
7. Returns created user data.

Why bcrypt is used:

- Passwords should never be stored directly.
- bcrypt converts the password into a secure hash.

### `login`

Purpose:

- Authenticates a user and returns a JWT token.

Flow:

1. Reads `email` and `password`.
2. Finds the user in Supabase.
3. Compares submitted password with hashed password using bcrypt.
4. Creates a JWT containing user `id` and `role`.
5. Returns token and user data without password.

Why JWT is used:

- The frontend can store the token and send it with future requests.
- The backend can verify the token without storing sessions.

### `forgotPassword`

Purpose:

- Starts password reset process.

Flow:

1. Finds user by email.
2. Creates a random reset token using Node `crypto`.
3. Saves the token and expiry time in Supabase.
4. Builds a frontend reset URL.
5. Sends email using Nodemailer.

### `resetPassword`

Purpose:

- Sets a new password when the reset token is valid.

Flow:

1. Reads token from URL params.
2. Finds user with matching token that has not expired.
3. Hashes the new password.
4. Updates the password.
5. Clears reset token fields.

### `updateProfile`

Purpose:

- Updates the logged-in user's profile and address details.

Requires:

- `protect` middleware.

### `getProfile`

Purpose:

- Gets the logged-in user's profile without exposing password.

Requires:

- `protect` middleware.

### `deleteUser`

Purpose:

- Deletes a user by ID.

Current note:

- This function exists in the controller but is not currently used in `authRoutes.ts`.

## Product Controller

File: `src/controllers/productController.ts`

### `getAllProducts`

Purpose:

- Returns all active products for public storefront pages.

Flow:

1. Reads from Supabase `products`.
2. Filters `is_active = true`.
3. Orders newest products first.
4. Returns product list.

### `createProduct`

Purpose:

- Allows admin to create a new product.

Flow:

1. Reads product fields from `req.body`.
2. Requires an uploaded image file.
3. Builds a composite slug from product name, finish, and size.
4. Checks Supabase for slug conflict.
5. Uploads image buffer to Cloudinary.
6. Parses numeric fields like `price`, `discount_price`, and `stock`.
7. Inserts product into Supabase.
8. Returns created product.

Why composite slug is used:

- Tile products may have similar names.
- Adding finish and size makes slugs more unique and useful.

## Cart Controller

File: `src/controllers/cartController.ts`

All cart methods require a logged-in user.

### `addToCart`

Purpose:

- Adds a product to the user's cart.
- If product already exists in the cart, increases quantity.

Flow:

1. Reads `product_id`, `quantity`, and optional `unit`.
2. Gets `user_id` from `req.user`.
3. Checks if the cart item already exists.
4. Updates quantity or inserts a new cart item.

### `getMyCart`

Purpose:

- Returns the user's cart with joined product details.

Flow:

1. Reads cart items from Supabase.
2. Joins product details like name, price, image, and size.
3. Calculates cart total.
4. Calculates VAT estimate.

Current note:

- The calculation currently uses `discount_price || 0`. If a product has no discount price, the base price is not used in the cart total. Usually this should fall back to `price`.

### `removeFromCart`

Purpose:

- Removes a cart item.

Security:

- Deletes only when both cart item ID and current `user_id` match.

### `updateCartQuantity`

Purpose:

- Updates cart item quantity.

Validation:

- Quantity must be at least `1`.

Current note:

- It updates by cart item ID but does not filter by `user_id`. For stronger security, it should also include `.eq('user_id', user_id)`.

## Order Controller

File: `src/controllers/orderController.ts`

All order routes require a logged-in user.

### `createOrder`

Purpose:

- Converts the logged-in user's cart into an order.

Flow:

1. Reads current user's cart items.
2. Joins product snapshot data.
3. Calculates subtotal on the server.
4. Calculates 20% VAT.
5. Adds fixed shipping cost of `15.00`.
6. Creates a row in the `orders` table.
7. Creates related rows in the `order_items` table.
8. Clears the user's cart.
9. Returns order ID and total.

Why totals are calculated on the server:

- The frontend can be manipulated by users.
- Server-side calculation prevents customers from changing order totals manually.

### `getOrderById`

Purpose:

- Gets a single order with its items.

Security:

- A customer can only access their own order.
- An admin can access any order.

### `getMyOrders`

Purpose:

- Gets all orders for the logged-in user.

### `getUserOrders`

Purpose:

- Also gets user orders with a different selected shape.

Current note:

- This function exists in the controller but is not currently used in `orderRoutes.ts`.

## Admin Controller

File: `src/controllers/adminController.ts`

All admin controller functions are used behind `protect` and `adminOnly` in `adminRoutes.ts`.

### `getDashboardStats`

Purpose:

- Provides high-level admin dashboard numbers.

Returns:

- Total revenue.
- Total orders.
- Pending orders.
- Total users.
- Total products.

### `getAllOrders`

Purpose:

- Returns all orders with joined user and order item details.

Used for:

- Admin order list page.

### `updateOrderStatus`

Purpose:

- Lets admin update order status and payment status.

Flow:

1. Updates `orders` row.
2. Re-fetches updated order with user and item joins.
3. Returns updated order.

### `getAllUsers`

Purpose:

- Returns all users with order count and total spend.

Used for:

- Admin customer management page.

### `getUserById`

Purpose:

- Returns one customer with their orders.

### `adminGetProducts`

Purpose:

- Returns every product for admin, including inactive products.

Difference from public product list:

- Public product route only returns active products.
- Admin product route returns everything.

### `addProduct`

Purpose:

- Admin product creation.

This is similar to `createProduct` in `productController.ts`.

### `updateProduct`

Purpose:

- Admin product update.

Features:

- Updates normal product fields.
- Uploads new Cloudinary image if a new file is provided.
- Regenerates slug if name, finish, or size changes.
- Parses price, discount price, and stock from form data.

### `getProductById`

Purpose:

- Gets one product by ID.

Current use:

- Imported into public `productRoutes.ts` for `GET /api/products/:id`.

### `deleteProduct`

Purpose:

- Deletes product record from Supabase.
- Attempts to delete associated Cloudinary image.

Current note:

- The Cloudinary public ID extraction only uses the file name. If images are inside a folder, Cloudinary deletion may need the folder path too.

### `adminGetOrderById`

Purpose:

- Gets detailed order data for admin order detail page.

Returns:

- Order.
- User details.
- Order items.
- Product details for each item.

## 11. Important Data Tables

The code expects these Supabase tables:

### `users`

Stores customers and admins.

Expected fields include:

- `id`
- `email`
- `password`
- `role`
- `full_name`
- `phone_number`
- `address_line1`
- `address_line2`
- `city`
- `postcode`
- `country`
- `reset_password_token`
- `reset_password_expires`
- `created_at`

### `products`

Stores tile inventory.

Expected fields include:

- `id`
- `name`
- `slug`
- `description`
- `price`
- `discount_price`
- `stock`
- `category`
- `finish`
- `size`
- `thickness`
- `material`
- `image`
- `is_active`
- `created_at`

### `cart_items`

Stores customer cart items.

Expected fields include:

- `id`
- `user_id`
- `product_id`
- `quantity`
- `unit`
- `created_at`

### `orders`

Stores main order records.

Expected fields include:

- `id`
- `user_id`
- `total_amount`
- `vat_amount`
- `shipping_cost`
- `currency`
- address fields
- `status`
- `payment_status`
- `created_at`

### `order_items`

Stores products inside an order.

Expected fields include:

- `id`
- `order_id`
- `product_id`
- `product_name`
- `product_image`
- `quantity`
- `unit`
- `price_at_purchase`

## 12. Authentication Flow

1. User registers with `/api/auth/register`.
2. Password is hashed using bcrypt.
3. User logs in with `/api/auth/login`.
4. Backend returns JWT token.
5. Frontend sends token on protected requests:

```text
Authorization: Bearer <token>
```

6. `protect` middleware verifies token.
7. If user is admin, `adminOnly` allows admin route access.

## 13. Product Image Upload Flow

1. Admin sends product data as `multipart/form-data`.
2. Route uses `upload.single('image')`.
3. Multer stores image in memory.
4. Controller streams buffer to Cloudinary.
5. Cloudinary returns image URL.
6. URL is saved in the `products.image` field.

## 14. Order Creation Flow

1. User adds products to cart.
2. User submits checkout address.
3. Backend reads cart from Supabase.
4. Backend calculates prices, VAT, shipping, and total.
5. Backend creates order.
6. Backend creates order items.
7. Backend clears cart.

This protects the order total because the backend does not trust frontend totals.

## 15. Environment Variables

The backend needs these environment variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=
SUPABASE_ANON_KEY=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

MAIL_USER=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_REFRESH_TOKEN=
```

## 16. Scripts

From the `backend` folder:

```bash
npm run dev
```

Starts development server using `nodemon` and `tsx`.

```bash
npm run build
```

Compiles TypeScript into `dist`.

```bash
npm start
```

Runs compiled JavaScript from `dist/index.js`.

## 17. Current Improvement Notes

These are not required to understand the backend, but they are useful for future cleanup:

- Move `app.use('/api', limiter)` before route registration in `index.ts`.
- Use the same JWT fallback secret in login and middleware, or better, require `JWT_SECRET`.
- In cart total calculation, fall back to product base price when `discount_price` is missing.
- In `updateCartQuantity`, also filter by `user_id` to prevent updating another user's cart item.
- Remove unused `multer.ts` or use it consistently.
- `createProduct` and `addProduct` share similar logic and could be combined later.
- `getUserOrders` and `deleteUser` exist but are not currently connected to routes.
- Cloudinary delete logic should include folder path when destroying images uploaded to `tilebazaar/products`.
