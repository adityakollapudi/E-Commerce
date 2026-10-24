import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isMongoConnected } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const QUOTES_FILE = path.join(__dirname, "quotes.json");
export const ENQUIRIES_FILE = path.join(__dirname, "enquiries.json");

const quotesMap = new Map();
const enquiriesMap = new Map();

/**
 * Loads quotes and enquiries from disk on startup
 */
export const loadQuotesFromDisk = () => {
  try {
    if (fs.existsSync(QUOTES_FILE)) {
      const raw = fs.readFileSync(QUOTES_FILE, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        quotesMap.clear();
        for (const q of list) {
          if (q && q.quoteId) quotesMap.set(q.quoteId, q);
        }
      }
    }
  } catch (err) {
    console.warn("[QuotesStore] Could not read quotes.json:", err.message);
  }

  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, "utf8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        enquiriesMap.clear();
        for (const e of list) {
          if (e && e.enquiryId) enquiriesMap.set(e.enquiryId, e);
        }
      }
    }
  } catch (err) {
    console.warn("[QuotesStore] Could not read enquiries.json:", err.message);
  }
};

/**
 * Persists quotes atomically to disk
 */
export const saveQuotesToDisk = () => {
  try {
    const list = Array.from(quotesMap.values());
    const tmp = path.join(__dirname, `.quotes.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`);
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
    fs.renameSync(tmp, QUOTES_FILE);
  } catch (err) {
    console.error("[QuotesStore] Failed to persist quotes to disk:", err.message);
  }
};

/**
 * Persists enquiries atomically to disk
 */
export const saveEnquiriesToDisk = () => {
  try {
    const list = Array.from(enquiriesMap.values());
    const tmp = path.join(__dirname, `.enquiries.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`);
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
    fs.renameSync(tmp, ENQUIRIES_FILE);
  } catch (err) {
    console.error("[QuotesStore] Failed to persist enquiries to disk:", err.message);
  }
};

/**
 * Save new corporate quotation
 */
export const saveQuote = async (quoteData) => {
  quotesMap.set(quoteData.quoteId, quoteData);
  saveQuotesToDisk();

  if (isMongoConnected()) {
    try {
      const { Quote } = await import("../models/Quote.js");
      await Quote.findOneAndUpdate(
        { quoteId: quoteData.quoteId },
        { $set: quoteData },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn("[QuotesStore] MongoDB Quote sync notice:", err.message);
    }
  }
  return quoteData;
};

/**
 * Get all quotes sorted descending by date
 */
export const getAllQuotes = () => {
  return Array.from(quotesMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
};

/**
 * Update quote status and notes
 */
export const updateQuoteStatus = async (quoteId, { status, adminNotes }) => {
  const existing = quotesMap.get(quoteId);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...(status ? { status } : {}),
    ...(adminNotes !== undefined ? { adminNotes } : {}),
    updatedAt: new Date().toISOString(),
  };

  quotesMap.set(quoteId, updated);
  saveQuotesToDisk();

  if (isMongoConnected()) {
    try {
      const { Quote } = await import("../models/Quote.js");
      await Quote.findOneAndUpdate({ quoteId }, { $set: updated });
    } catch (err) {}
  }

  return updated;
};

/**
 * Save corporate bulk enquiry
 */
export const saveEnquiry = async (enquiryData) => {
  enquiriesMap.set(enquiryData.enquiryId, enquiryData);
  saveEnquiriesToDisk();

  if (isMongoConnected()) {
    try {
      const { BulkEnquiry } = await import("../models/BulkEnquiry.js");
      await BulkEnquiry.findOneAndUpdate(
        { enquiryId: enquiryData.enquiryId },
        { $set: enquiryData },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn("[QuotesStore] MongoDB Enquiry sync notice:", err.message);
    }
  }
  return enquiryData;
};

/**
 * Get all enquiries sorted descending by date
 */
export const getAllEnquiries = () => {
  return Array.from(enquiriesMap.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
};

/**
 * Filter quotes by user ID or contact email
 */
export const getQuotesByUserIdOrEmail = (userId, email) => {
  const all = getAllQuotes();
  return all.filter((q) => {
    const matchesId = userId && q.userId === userId;
    const matchesEmail =
      email && q.contactEmail && q.contactEmail.toLowerCase() === String(email).toLowerCase();
    return matchesId || matchesEmail;
  });
};

/**
 * Filter enquiries by user ID or contact email
 */
export const getEnquiriesByUserIdOrEmail = (userId, email) => {
  const all = getAllEnquiries();
  return all.filter((e) => {
    const matchesId = userId && e.userId === userId;
    const matchesEmail =
      email && e.email && e.email.toLowerCase() === String(email).toLowerCase();
    return matchesId || matchesEmail;
  });
};

loadQuotesFromDisk();
