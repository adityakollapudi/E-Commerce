# SHOP.CO — Backend API

Node.js + Express REST API for the SHOP.CO e-commerce platform.

---

## How to Run

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the development server** (with automatic reload):
   ```bash
   npm run dev
   ```

3. **Start in production mode**:
   ```bash
   npm start
   ```

The server runs on **`http://localhost:5000`** by default.

---

## API Endpoints

- `GET /api/health` — Server health check
- `GET /api/products` — Filter, search, and paginate products
- `GET /api/products/:id` — Single product details
- `GET /api/products/featured/new-arrivals` — New arrivals
- `GET /api/products/featured/best-sellers` — Best sellers
- `POST /api/coupons/validate` — Validate promo code (`SHOP20`, `FREESHIP`)
- `POST /api/orders` — Create new order and generate confirmation receipt
