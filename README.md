# SHOP.CO — Full-Stack E-Commerce Platform

A modern full-stack e-commerce clothing store inspired by the **SHOP.CO** design. Built with a **React 18 + Vite** frontend and a **Node.js + Express** backend REST API.

---

## 🚀 How to Run the Project

You can run the application in **two ways**:
- **Option 1**: From the root directory (simplest)
- **Option 2**: Using separate terminal windows for Frontend and Backend

---

### Prerequisites
Make sure you have **Node.js (v18 or higher)** installed on your machine.
Check by running:
```bash
node -v
npm -v
```

---

### Installation (First Time Setup)

If you are setting up the project for the first time, install dependencies in both folders:

```bash
# 1. Install frontend dependencies
cd frontend
npm install
cd ..

# 2. Install backend dependencies
cd backend
npm install
cd ..
```

---

### Option 1: Run From Root Directory (Recommended)

Open your terminal in the main `E-commernce` folder:

#### Start Frontend (Vite Client):
```bash
npm run dev
# or
npm run dev:frontend
```
> Opens at **`http://localhost:5173/`**

#### Start Backend (Express API):
Open a second terminal in the root folder and run:
```bash
npm run dev:backend
```
> Opens at **`http://localhost:5000/`**

---

### Option 2: Run in Separate Folders (Direct Terminal)

If you prefer to navigate into each directory individually:

#### Terminal 1 — Frontend:
```bash
cd frontend
npm run dev
```
- Local URL: **`http://localhost:5173/`**
- Network URL: Displayed in the terminal output

#### Terminal 2 — Backend:
```bash
cd backend
npm run dev
```
- Server API: **`http://localhost:5000/`**
- Health Check: **`http://localhost:5000/api/health`**

---

## 🌐 Application URLs

| Service | URL | Notes |
|---|---|---|
| **Frontend UI (Shop)** | [http://localhost:5173/](http://localhost:5173/) | Main store website |
| **Backend API Health** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | Status check |
| **Products API** | [http://localhost:5000/api/products](http://localhost:5000/api/products) | JSON products catalog |

> **Note**: The frontend has a built-in reverse proxy in `vite.config.js`. Calls made to `/api/*` in the browser automatically forward to `http://localhost:5000`.

---

## 🛍️ Interactive Features to Test

1. **Live Search**:
   - Type `"shirt"`, `"jeans"`, or `"dress"` in the top search bar to see instant autocompletion and thumbnails.
2. **Dress Styles**:
   - Click **Casual**, **Formal**, **Party**, or **Gym** on the homepage to view curated collections.
3. **Filtering & Sorting**:
   - Go to `/products` and filter by price range, size, or sort by *Lowest Price*, *Highest Price*, or *Top Rated*.
4. **Product Details**:
   - Click any item to select color swatches, choose sizes, view verified reviews, and click **"Add to Cart"** (with toast feedback).
5. **Checkout & Coupons**:
   - Open `/cart`, enter promo code **`SHOP20`** (20% off) or **`FREESHIP`** ($0 delivery), and click **"Go to Checkout"** to test the order placement modal and receipt confirmation.

---

## 📁 Project Structure

```
E-commernce/
├── frontend/               # React 18 + Vite client application
│   ├── src/
│   │   ├── components/     # UI Components (Header, Home, Products, Cart, etc.)
│   │   ├── data/           # Client-side product data layer & API helpers
│   │   ├── styles/         # CSS styling (Satoshi font, modular CSS, enhanced styles)
│   │   ├── App.jsx         # App router & global toast notification state
│   │   └── main.jsx        # Entry point
│   ├── public/             # Static images, icons, and logos
│   ├── vite.config.js      # Vite config with /api reverse proxy to backend
│   └── package.json
│
├── backend/                # Node.js + Express REST API
│   ├── src/
│   │   ├── routes/         # Modular API routes
│   │   │   ├── products.js # /api/products (filters, search, styles, pagination)
│   │   │   ├── orders.js   # /api/orders (checkout & order receipt confirmation)
│   │   │   └── coupons.js  # /api/coupons/validate (promo code validation)
│   │   ├── data/           # Backend product catalog
│   │   └── server.js       # Express server entry point (Port 5000)
│   ├── .env                # Environment variables
│   └── package.json
│
└── package.json            # Root scripts to orchestrate frontend & backend
```

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & uptime |
| `GET` | `/api/products` | All products (supports `?category=`, `?style=`, `?search=`, `?sort=`, `?page=`) |
| `GET` | `/api/products/:id` | Single product details & related products |
| `GET` | `/api/products/featured/new-arrivals` | New arrival items (limit 4) |
| `GET` | `/api/products/featured/best-sellers` | Best seller items (limit 4) |
| `GET` | `/api/products/meta/categories` | Categories metadata & item counts |
| `GET` | `/api/products/meta/styles` | Dress styles (Casual, Formal, Party, Gym) |
| `POST` | `/api/coupons/validate` | Validate promo code (`SHOP20`, `SAVE30`, `FREESHIP`) |
| `POST` | `/api/orders` | Place order & receive confirmed order receipt |
| `GET` | `/api/orders/:orderId` | Track placed order |

---

## 🛠️ Useful Commands

| Task | Command | Directory |
|---|---|---|
| Run Frontend | `npm run dev` | `frontend` or root |
| Run Backend | `npm run dev` | `backend` (or `npm run dev:backend` from root) |
| Build Frontend for Production | `npm run build` | `frontend` or root |
| Preview Production Build | `npm run preview` | `frontend` or root |
