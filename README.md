# SHOP.CO — Full-Stack E-Commerce & Store Management Platform

A modern, production-grade full-stack e-commerce clothing and lifestyle store inspired by the **SHOP.CO** design system. Featuring complete **Customer Authentication**, **Role-Based Admin Control**, an interactive **Admin Dashboard**, and a **Live Product Creation Suite** with real-time storefront card preview.

Built with a **React 18 + Vite** frontend and an **Express.js (Node.js)** REST API backend.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Default Credentials & Quick Logins](#-default-credentials--quick-logins)
3. [How to Run the Application](#-how-to-run-the-application)
4. [Application URLs & Routes](#-application-urls--routes)
5. [Authentication & Roles (RBAC)](#-authentication--roles-rbac)
6. [Admin Portal & Product Addition](#-admin-portal--product-addition)
7. [REST API Documentation](#-rest-api-documentation)
8. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
9. [Git & Deployment](#-git--deployment)

---

## ✨ Key Features

### 🛍️ Customer Experience
* **Customer Authentication**: Sign in with an existing account or register a new profile.
* **Instant 1-Click Demo Login**: Sign in as a test customer with a single click.
* **Dynamic Header & Profile Drawer**: Displays personalized user greeting, avatar initials, and customer account badge.
* **Live Catalog & Filtering**: Search products in real time, filter by price range, style (Casual, Formal, Party, Gym, Corporate), and sort by newest or rating.
* **Interactive Cart & Checkout**: Add items with size selection, apply discount coupons (`SHOP20`, `FREESHIP`), and simulate order placement with receipt confirmation.
* **Mobile-Responsive Drawer**: Accessible mobile navigation drawer with direct Customer and Admin login buttons.

### 🛡️ Store Administration & Management
* **Role-Based Access Control (RBAC)**: Protected `/admin` routes and backend endpoints guarded by JWT verification.
* **Admin Dashboard (`/admin`)**:
  * Real-time inventory KPI summary cards (Total Products, Active Categories, Drinkware, Apparel).
  * Catalog table with search filter and category selector.
  * Live storefront shortcut links and permanent product deletion.
* **Add New Product Suite (`/admin/add-product`)**:
  * **1-Click Starter Presets**: Instant form population for Ceramic Mugs, Heavyweight Hoodies, Oxford Shirts, Stainless Steel Flasks, and Oversized Tees.
  * **Comprehensive Product Fields**: Title, Brand, SKU, Category, Style, Selling Price, Original M.R.P. (auto-computes discount %), MOQ, Estimated Delivery, Media URL, Features, and Sizes.
  * **Live Storefront Card Preview**: Side-by-side sticky preview displaying exactly how shoppers will see the product on the site in real time.
  * **Instant Catalog Publishing**: Direct integration with `POST /api/products`, prepending new items so they immediately appear in customer searches and category filters.

---

## 🔑 Default Credentials & Quick Logins

Pre-configured accounts with `bcryptjs` password hashing are provided for instant testing:

| Role | Email | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@shop.co` | `admin123` | Full access to `/admin`, `/admin/add-product`, and product creation/edit/delete APIs |
| **Customer Account** | `user@shop.co` | `user123` | Browsing, cart management, checkout, order tracking (restricted from admin tools) |

> ⚡ **Quick Access**: Click the **"Customer Login"** button or profile icon in the header, then click **`1-Click Customer Login`** or **`⚡ 1-Click Admin Login`** for instant zero-typing authentication!

---

## 🚀 How to Run the Application

### Prerequisites
* **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
* **npm**: v9.0.0 or higher

Verify installation:
```bash
node -v
npm -v
```

---

### Step 1: Install Dependencies

Run this from the project root directory:
```bash
# Install frontend packages
cd frontend
npm install
cd ..

# Install backend packages
cd backend
npm install
cd ..
```

---

### Step 2: Start the Servers

You can run both servers simultaneously using either method:

#### Method A: From the Root Directory (Easiest)
Open two separate terminal windows in the project root:

* **Terminal 1 (Frontend):**
  ```bash
  npm run dev:frontend
  ```
  *(Starts Vite dev server on **`http://localhost:5173`**)*

* **Terminal 2 (Backend):**
  ```bash
  npm run dev:backend
  ```
  *(Starts Express API on **`http://localhost:5000`**)*

---

#### Method B: Direct Directory Commands

* **Terminal 1 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
* **Terminal 2 (Backend):**
  ```bash
  cd backend
  npm run dev
  ```

---

## 🌐 Application URLs & Routes

### Frontend Routes
| Route | Access | Description |
| :--- | :--- | :--- |
| **`/`** | Public | Storefront homepage with hero banner, categories, and customer reviews |
| **`/products`** | Public | Full product catalog with search, filters, and sorting |
| **`/products/:category/:id`** | Public | Dedicated product view with photo gallery, specs, and add-to-cart |
| **`/cart`** | Public | Shopping cart, coupon discounts, and order checkout |
| **`/login`** | Public | Full-page Customer Sign In and Admin Portal |
| **`/admin`** | **Admin Only** | Admin inventory table, KPI statistics, and product management |
| **`/admin/add-product`** | **Admin Only** | Product creation form with starter presets and live card preview |

### Backend Endpoints
| URL | Description |
| :--- | :--- |
| **`http://localhost:5000/api/health`** | Server health status check and uptime monitor |
| **`http://localhost:5000/api/products`** | Dynamic products catalog (filters, search, pagination) |
| **`http://localhost:5000/api/auth/login`** | JWT login endpoint for users and administrators |

> 🔄 **Vite Reverse Proxy**: The frontend proxies all requests starting with `/api` to `http://localhost:5000`, eliminating CORS issues during development.

---

## 🔒 Authentication & Roles (RBAC)

Authentication is handled securely via **JSON Web Tokens (JWT)** and **bcryptjs**:
1. When a user or administrator logs in via `/api/auth/login`, the backend verifies the hashed password and issues a signed JWT token containing `{ id, email, role, name }`.
2. The frontend (`AuthContext.jsx`) stores the token and user state in `localStorage` (`shop_auth_token`, `shop_auth_user`).
3. Administrative routes (`/admin`, `/admin/add-product`) are protected by the `<AdminRoute>` guard. Unauthenticated visitors or non-admin customers are redirected with a permissions notice and 1-click admin login option.
4. Administrative API endpoints (`POST /api/products`, `DELETE`, `PUT`) require `Authorization: Bearer <token>` and verify that `req.user.role === 'admin'`. Non-admins receive `403 Forbidden`.

---

## 📦 Admin Portal & Product Addition

### How to Add a New Product
1. Sign in as Admin (`admin@shop.co` / `admin123`) or click **"1-Click Admin Login"**.
2. Click the profile avatar in the header and select **"Admin Dashboard"** or go to **`http://localhost:5173/admin/add-product`**.
3. Choose a **1-Click Starter Preset** (e.g. *Ceramic Coffee Mug*, *Heavyweight Hoodie*, *Oxford Shirt*) or enter custom product details:
   * Title, Brand, Model SKU
   * Category (Drinkware, Men's Clothing, Women's Clothing, Accessories, Tech)
   * Style (Corporate Gifting, Casual, Formal, Party, Gym)
   * Selling Price & Original M.R.P. (discount % calculates automatically)
   * Minimum Order Quantity (MOQ) & Delivery Days
   * Image URL (supports direct web image links)
   * Description, Bullet Highlights, and Sizing options
4. Review the **Live Storefront Preview Card** on the right side to inspect exactly how the product will appear to buyers.
5. Click **"Publish Product to Catalog"**.
6. The product is immediately prepended to the catalog and is instantly searchable across the store!

---

## 🔌 REST API Documentation

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | `{ email, password, roleHint }` | Authenticates user/admin, returns JWT token & user object |
| `POST` | `/api/auth/register` | Public | `{ name, email, password, role }` | Registers a new account and returns token |
| `GET` | `/api/auth/me` | Protected | Header: `Authorization: Bearer <token>` | Returns verified user session data |
| `GET` | `/api/auth/demo-accounts`| Public | None | Returns sample login credentials |

### Product Routes (`/api/products`)
| Method | Endpoint | Access | Body / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Query: `search`, `category`, `style`, `minPrice`, `maxPrice`, `sort`, `page` | Returns filtered & paginated product catalog |
| `GET` | `/api/products/:id` | Public | `:id` | Returns single product details and related products |
| `GET` | `/api/products/featured/new-arrivals` | Public | Query: `limit` | Returns newest arrival items |
| `GET` | `/api/products/featured/best-sellers` | Public | Query: `limit` | Returns top-selling items |
| `GET` | `/api/products/meta/categories` | Public | None | Returns category list with item counts |
| `GET` | `/api/products/meta/styles` | Public | None | Returns styles (Casual, Formal, etc.) with item counts |
| `POST` | `/api/products` | **Admin Only** | `{ title, price, originalPrice, category, style, brand, image, ... }` | Creates and publishes a new product to the catalog |
| `PUT` | `/api/products/:id` | **Admin Only** | `{ price, title, ... }` | Updates an existing product |
| `DELETE` | `/api/products/:id` | **Admin Only** | `:id` | Permanently deletes a product from the catalog |

### Order & Coupon Routes (`/api/orders`, `/api/coupons`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/coupons/validate` | Public | Validates coupon codes (`SHOP20`, `SAVE30`, `FREESHIP`) |
| `POST` | `/api/orders` | Public | Creates an order and generates order receipt |
| `GET` | `/api/orders/:orderId` | Public | Retrieves confirmed order by ID |
| `POST` | `/api/quote` | Public | Corporate bulk quotation inquiries |

---

## 📁 Project Architecture & Directory Structure

```
E-commernce/
├── .gitignore                   # Root gitignore (excludes node_modules and .env)
├── README.md                    # Project documentation
├── package.json                 # Unified npm workspace scripts
│
├── frontend/                    # React 18 + Vite Frontend Application
│   ├── index.html               # Main HTML entry with FontAwesome and Satoshi
│   ├── vite.config.js           # Vite dev server configuration and /api proxy
│   ├── package.json             # Frontend dependencies
│   ├── public/                  # Static brand assets, icons, and hero photography
│   └── src/
│       ├── main.jsx             # React DOM root wrapped with <AuthProvider>
│       ├── App.jsx              # Router configuration, layout shell, and toast provider
│       ├── index.css            # Global CSS layer imports
│       ├── context/
│       │   └── AuthContext.jsx  # Global auth state, JWT handling, and user/admin methods
│       ├── components/
│       │   ├── Auth/
│       │   │   ├── AuthModal.jsx# Popup login/signup modal with 1-click demo buttons
│       │   │   └── LoginPage.jsx# Full-page authentication route (/login)
│       │   ├── Admin/
│       │   │   ├── AdminRoute.jsx     # Role-based route guard for administrators
│       │   │   ├── AdminHeader.jsx    # Administrative control navigation bar
│       │   │   ├── AdminDashboard.jsx # Inventory overview, KPI cards, catalog table
│       │   │   └── AddProduct.jsx     # Product creation form & live card preview
│       │   ├── Header/          # Header, SearchBar, ProfileBtn, Categories, Mobile menu
│       │   ├── Home/            # Hero section, reviews carousel, category grid
│       │   ├── Products/        # Catalog grid, filter sidebar, pagination
│       │   │   └── Product/     # Single product gallery, tabs, and bulk quote modal
│       │   ├── Cart/            # Shopping cart, coupon verification, order modal
│       │   └── Footer/          # Newsletter subscription and footer links
│       └── styles/
│           ├── auth-admin.css   # Styles for auth modal, admin dashboard, add-product
│           └── enhanced.css     # Luxury styling, Satoshi typography, micro-animations
│
└── backend/                     # Node.js + Express REST API Backend
    ├── .env.example             # Example environment configuration
    ├── .gitignore               # Backend gitignore
    ├── package.json             # Backend dependencies (express, cors, jwt, bcryptjs)
    └── src/
        ├── server.js            # Express server entry with automatic port recovery
        ├── middleware/
        │   └── auth.js          # JWT token verification and requireAdmin guard
        ├── routes/
        │   ├── auth.js          # Login, registration, and me endpoints
        │   ├── products.js      # Product catalog, admin CRUD endpoints
        │   ├── orders.js        # Checkout and order receipts
        │   └── coupons.js       # Promo code discounts
        └── data/
            ├── users.js         # User storage with pre-hashed credentials
            └── products.js      # Seed catalog items
```

---

## 🛠️ Useful Commands

| Action | Command | Where to Run |
| :--- | :--- | :--- |
| **Run Frontend** | `npm run dev` | `frontend` or root directory |
| **Run Backend** | `npm run dev` | `backend` (or `npm run dev:backend` from root) |
| **Build Frontend** | `npm run build` | `frontend` or root directory |
| **Check Backend Health** | `Invoke-RestMethod http://localhost:5000/api/health` | PowerShell Terminal |
| **Push Updates to GitHub**| `git push origin main` | Project root |

---

## 🚀 Git & Deployment

* **GitHub Repository**: [https://github.com/akhilkandibanda-14/E-commernce](https://github.com/akhilkandibanda-14/E-commernce)
* **Default Branch**: `main`

To push updates:
```bash
git add .
git commit -m "docs: comprehensive full-stack documentation and guides"
git push origin main
```

---

*Crafted with precision for SHOP.CO E-Commerce Platform.*
