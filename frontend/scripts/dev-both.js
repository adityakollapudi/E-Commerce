import { createServer } from "vite";

async function startBothServers() {
  console.log("====================================================");
  console.log("🛍️ GIFTINGWELLNESS DUAL-PORT FRONTEND SYSTEM");
  console.log("====================================================\n");

  try {
    // 1. Start User Storefront (Port 5173 -> API Port 5000)
    const userServer = await createServer({
      configFile: "./vite.config.js",
      server: { port: 5173 },
    });
    await userServer.listen();
    console.log("🛒 USER STOREFRONT running at:");
    console.log("   ➜ URL:     http://localhost:5173/");
    console.log("   ➜ Role:    Customer Browsing, Search, Cart, Checkout");
    console.log("   ➜ Backend: User API (http://localhost:5000) - View Only\n");

    // 2. Start Admin Management Portal (Port 5174 -> API Port 5001)
    const adminServer = await createServer({
      configFile: "./vite.admin.config.js",
      server: { port: 5174 },
    });
    await adminServer.listen();
    console.log("🛡️ ADMIN MANAGEMENT PORTAL running at:");
    console.log("   ➜ URL:     http://localhost:5174/");
    console.log("   ➜ Role:    Catalog Editing, Add Products, Bulk Import, Orders");
    console.log("   ➜ Backend: Admin API (http://localhost:5001) - Full CRUD");
    console.log("   ➜ DB:      Synchronized Shared database (catalog.json)\n");
    console.log("====================================================");
    console.log("Both frontend ports are active and ready!");
    console.log("====================================================\n");
  } catch (err) {
    console.error("Error starting dual frontend servers:", err);
    process.exit(1);
  }
}

startBothServers();
