import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { PRODUCTS } from "./data/products.js";
import { INITIAL_USERS } from "./data/users.js";

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️ MONGODB_URI not set in .env. Skipping MongoDB connection.");
    return false;
  }

  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`🍃 MongoDB Atlas connected: ${conn.connection.host}/${conn.connection.name}`);

    // Seed initial collections if empty
    seedInitialData().catch((err) => {
      console.warn("MongoDB initial seed notice:", err.message);
    });

    return true;
  } catch (err) {
    console.error("❌ MongoDB Atlas connection error:", err.message);
    return false;
  }
};

/**
 * Check if MongoDB is connected
 */
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Synchronize product catalog array into MongoDB Atlas collection 'products'
 */
export const syncCatalogToMongo = async (catalog) => {
  if (!isMongoConnected() || !Array.isArray(catalog) || catalog.length === 0) return;
  try {
    const Product = mongoose.models.Product || (await import("./models/Product.js")).Product;
    const bulkOps = catalog.map((p) => {
      const doc = {
        ...p,
        id: String(p.id),
        rating: p.rating || { rate: 4.5, count: 1 },
        moq: p.moq || p.minQuantity || 1,
        image: p.image || p.img || (p.images && p.images[0]) || "/introImageCompressed.jfif",
      };
      return {
        updateOne: {
          filter: { id: String(p.id) },
          update: { $set: doc },
          upsert: true,
        },
      };
    });
    if (bulkOps.length > 0) {
      await Product.bulkWrite(bulkOps);
      console.log(`🍃 Synced ${bulkOps.length} products to MongoDB Atlas collection 'products'.`);
    }
  } catch (err) {
    console.warn("[MongoDB Catalog Sync Warning]:", err.message);
  }
};

/**
 * Seed initial data if collections are empty, and sync current catalog
 */
export const seedInitialData = async () => {
  try {
    const User = mongoose.models.User || (await import("./models/User.js")).User;

    // Synchronize all products from durable catalogStore into MongoDB
    try {
      const { loadInitialCatalog } = await import("./data/catalogStore.js");
      const currentCatalog = loadInitialCatalog();
      if (Array.isArray(currentCatalog) && currentCatalog.length > 0) {
        await syncCatalogToMongo(currentCatalog);
      }
    } catch (catErr) {
      console.warn("[MongoDB Startup Sync Notice]:", catErr.message);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0 && Array.isArray(INITIAL_USERS) && INITIAL_USERS.length > 0) {
      await User.insertMany(INITIAL_USERS);
      console.log(`✅ Seeded ${INITIAL_USERS.length} initial users to MongoDB Atlas collection 'users'.`);
    }
  } catch (err) {
    console.warn("[MongoDB Seed Notice]:", err.message);
  }
};

export default connectDB;
