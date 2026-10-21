# SHOP.CO — Frontend Client

React 18 + Vite frontend for the SHOP.CO e-commerce application.

---

## How to Run

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   Navigate to **`http://localhost:5173/`**

---

## Available Scripts

- `npm run dev`: Starts the Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Compiles the production bundle to the `dist/` directory.
- `npm run preview`: Locally previews the production build.

---

## Proxy to Backend
The Vite dev server is configured with a reverse proxy in `vite.config.js`:
All requests to `/api/*` are automatically forwarded to `http://localhost:5000`.
