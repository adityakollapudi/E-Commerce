import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PRODUCTS } from "./products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CATALOG_FILE = path.join(__dirname, "catalog.json");
export const CATALOG_FILE_PATH = CATALOG_FILE;
export const CATALOG_META_FILE = path.join(__dirname, "catalog_meta.json");
export const BACKUPS_DIR = path.join(__dirname, "backups");

// In-memory registry of import snapshots
const snapshots = new Map();
let lastImportId = null;

// Concurrency mutex tracking active mutation
let activeMutation = null; // null | { type: "import" | "rollback" | "crud", startedAt: number }

/**
 * Loads persistent catalog metadata (revision, last mutation type, timestamps).
 */
export const loadCatalogMeta = () => {
  try {
    if (fs.existsSync(CATALOG_META_FILE)) {
      const raw = fs.readFileSync(CATALOG_META_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.revision === "number" && parsed.revision >= 1) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[CatalogStore] Could not read catalog_meta.json, initializing fresh meta:", err.message);
  }

  const initialMeta = {
    revision: 1,
    lastMutationType: "init",
    lastMutationAt: new Date().toISOString(),
    lastImportId: null,
  };

  try {
    saveCatalogMeta(initialMeta);
  } catch (err) {
    console.warn("[CatalogStore] Could not persist initial catalog_meta.json:", err.message);
  }

  return initialMeta;
};

/**
 * Persists catalog metadata atomically.
 */
export const saveCatalogMeta = (meta) => {
  const tmpFile = path.join(
    __dirname,
    `.catalog_meta.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`
  );
  fs.writeFileSync(tmpFile, JSON.stringify(meta, null, 2), "utf8");

  try {
    fs.renameSync(tmpFile, CATALOG_META_FILE);
  } catch (err) {
    fs.copyFileSync(tmpFile, CATALOG_META_FILE);
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch (_) {}
  }
};

/**
 * Returns current durable catalogue revision number.
 */
export const getCatalogRevision = () => {
  const meta = loadCatalogMeta();
  return meta.revision;
};

/**
 * Advances the durable catalogue revision after any successful mutation.
 */
export const advanceCatalogRevision = (mutationType, importId = null) => {
  const meta = loadCatalogMeta();
  meta.revision = (Number(meta.revision) || 1) + 1;
  meta.lastMutationType = mutationType;
  meta.lastMutationAt = new Date().toISOString();
  if (importId) {
    meta.lastImportId = importId;
    lastImportId = importId;
  }
  saveCatalogMeta(meta);
  return meta.revision;
};

/**
 * Hydrates backup snapshots from disk on server startup.
 * Safely parses, validates structure, ignores corrupted files,
 * and restores the latest eligible import ID.
 */
export const hydrateBackupsFromDisk = () => {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      return;
    }

    const files = fs.readdirSync(BACKUPS_DIR).filter((f) => f.startsWith("backup_") && f.endsWith(".json"));
    const validSnapshots = [];

    for (const file of files) {
      try {
        const fullPath = path.join(BACKUPS_DIR, file);
        const content = fs.readFileSync(fullPath, "utf8");
        const data = JSON.parse(content);

        // Validate snapshot structure
        if (
          data &&
          typeof data.importId === "string" &&
          data.importId.trim() &&
          typeof data.timestamp === "string" &&
          (data.status === "active" || data.status === "rolled_back") &&
          Array.isArray(data.catalogData)
        ) {
          snapshots.set(data.importId, data);
          validSnapshots.push(data);
        } else {
          console.warn(`[CatalogStore] Ignoring malformed snapshot file: ${file}`);
        }
      } catch (fileErr) {
        console.warn(`[CatalogStore] Ignoring corrupted backup file ${file}:`, fileErr.message);
      }
    }

    // Determine the latest active import ID
    const activeImports = validSnapshots
      .filter((s) => s.status === "active")
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime() || 0;
        const timeB = new Date(b.timestamp).getTime() || 0;
        return timeA - timeB;
      });

    if (activeImports.length > 0) {
      lastImportId = activeImports[activeImports.length - 1].importId;
    }
  } catch (err) {
    console.warn("[CatalogStore] Failed to scan backups directory:", err.message);
  }
};

/**
 * Initializes the product catalogue:
 * 1. Loads from persistent catalog.json if available.
 * 2. Falls back to static seed PRODUCTS if catalog.json does not exist or is invalid.
 * 3. Restores durable metadata and backup snapshots from disk.
 */
export const loadInitialCatalog = () => {
  loadCatalogMeta();
  hydrateBackupsFromDisk();

  try {
    if (fs.existsSync(CATALOG_FILE)) {
      const raw = fs.readFileSync(CATALOG_FILE, "utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[CatalogStore] Failed to read ${CATALOG_FILE}, falling back to seed products:`, err.message);
  }

  // Fallback to initial seed products
  const seed = JSON.parse(JSON.stringify(PRODUCTS));
  try {
    saveCatalogToDisk(seed);
  } catch (err) {
    console.warn("[CatalogStore] Could not write initial seed to disk:", err.message);
  }
  return seed;
};

/**
 * Safely and atomically saves the catalogue to disk using a temporary file and atomic rename.
 */
export const saveCatalogToDisk = (catalog) => {
  if (!Array.isArray(catalog)) {
    throw new Error("Invalid catalogue data. Expected an array of products.");
  }

  const tmpFile = path.join(
    __dirname,
    `.catalog.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`
  );

  const serialized = JSON.stringify(catalog, null, 2);
  fs.writeFileSync(tmpFile, serialized, "utf8");

  // On Windows NTFS, background file watchers or active handles can momentarily
  // lock catalog.json. We perform a brief retry loop, with safe copy+unlink fallback.
  let renamed = false;
  let lastErr = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.renameSync(tmpFile, CATALOG_FILE);
      renamed = true;
      break;
    } catch (err) {
      lastErr = err;
      if (err.code === "EPERM" || err.code === "EBUSY" || err.code === "EACCES") {
        const waitTill = Date.now() + 10 * (attempt + 1);
        while (Date.now() < waitTill) {
          /* spin wait */
        }
      } else {
        break;
      }
    }
  }

  if (!renamed) {
    try {
      fs.copyFileSync(tmpFile, CATALOG_FILE);
      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch (_) {}
      renamed = true;
    } catch (copyErr) {
      try {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      } catch (_) {}
      throw lastErr || copyErr;
    }
  }

  return true;
};

/**
 * Concurrency Coordination & Mutation Locks
 */
export const isImportInProgress = () => activeMutation?.type === "import" || activeMutation?.type === "rollback";
export const isMutationLocked = () => activeMutation !== null;

export const acquireMutationLock = (type = "crud") => {
  if (activeMutation !== null) {
    let reason = "Another catalogue mutation is currently in progress. Please retry.";
    if (activeMutation.type === "import") {
      reason = "Another catalogue import is currently in progress. Product modifications are temporarily locked.";
    } else if (activeMutation.type === "rollback") {
      reason = "A catalogue rollback is currently in progress. Product modifications are temporarily locked.";
    }
    return { acquired: false, reason };
  }

  activeMutation = { type, startedAt: Date.now() };
  return { acquired: true };
};

export const releaseMutationLock = () => {
  activeMutation = null;
};

export const setImportLock = (locked) => {
  if (locked) {
    acquireMutationLock("import");
  } else {
    releaseMutationLock();
  }
};

/**
 * Creates an immutable backup snapshot of the catalogue prior to committing an import.
 * Saves in-memory and persists to the backups directory on disk.
 */
export const createBackupSnapshot = (importId, adminEmail, catalog) => {
  const currentRev = getCatalogRevision();
  const snapshot = {
    importId,
    timestamp: new Date().toISOString(),
    adminEmail,
    itemCount: catalog.length,
    status: "active", // "active" | "rolled_back"
    preImportRevision: currentRev,
    postImportRevision: null,
    catalogData: JSON.parse(JSON.stringify(catalog)),
  };

  snapshots.set(importId, snapshot);
  lastImportId = importId;

  // Persist backup snapshot to disk
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }
    const backupFile = path.join(BACKUPS_DIR, `backup_${importId}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), "utf8");
  } catch (err) {
    console.error(`[CatalogStore] Failed to write backup file for import ${importId}:`, err.message);
  }

  return snapshot;
};

/**
 * Updates a snapshot's postImportRevision once the import commit succeeds.
 */
export const updateSnapshotPostImport = (importId, postImportRevision) => {
  const snapshot = getBackupSnapshot(importId);
  if (snapshot) {
    snapshot.postImportRevision = postImportRevision;
    snapshots.set(importId, snapshot);
    try {
      const backupFile = path.join(BACKUPS_DIR, `backup_${importId}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), "utf8");
    } catch (err) {
      console.warn(`[CatalogStore] Failed to update postImportRevision for ${importId}:`, err.message);
    }
  }
};

/**
 * Retrieves a backup snapshot by import ID (from memory or disk).
 */
export const getBackupSnapshot = (importId) => {
  if (snapshots.has(importId)) {
    return snapshots.get(importId);
  }

  // Try reading from disk
  try {
    const backupFile = path.join(BACKUPS_DIR, `backup_${importId}.json`);
    if (fs.existsSync(backupFile)) {
      const data = JSON.parse(fs.readFileSync(backupFile, "utf8"));
      if (
        data &&
        typeof data.importId === "string" &&
        Array.isArray(data.catalogData) &&
        (data.status === "active" || data.status === "rolled_back")
      ) {
        snapshots.set(importId, data);
        return data;
      }
    }
  } catch (err) {
    console.error(`[CatalogStore] Error reading backup ${importId} from disk:`, err.message);
  }

  return null;
};

/**
 * Validates whether an import can be rolled back safely.
 * Prevents rollback from overwriting newer legitimate catalogue changes.
 */
export const isRollbackAllowed = (importId) => {
  hydrateBackupsFromDisk();
  const snapshot = getBackupSnapshot(importId);

  if (!snapshot) {
    return { allowed: false, reason: `Import snapshot '${importId}' not found.` };
  }

  if (snapshot.status === "rolled_back") {
    return { allowed: false, reason: `Import '${importId}' has already been rolled back.` };
  }

  if (!Array.isArray(snapshot.catalogData)) {
    return { allowed: false, reason: `Import snapshot '${importId}' is corrupted or missing valid catalogue data.` };
  }

  const currentRev = getCatalogRevision();

  // If the snapshot recorded a postImportRevision, verify no subsequent changes occurred
  if (snapshot.postImportRevision !== undefined && snapshot.postImportRevision !== null) {
    if (snapshot.postImportRevision !== currentRev) {
      return {
        allowed: false,
        reason: `Cannot rollback import '${importId}' because newer catalogue modifications have occurred (current revision: ${currentRev}, import revision: ${snapshot.postImportRevision}). Rollback is refused to protect newer catalogue changes.`,
      };
    }
  } else {
    // Fallback if postImportRevision was not recorded (legacy snapshot)
    if (lastImportId && lastImportId !== importId) {
      return {
        allowed: false,
        reason: `Cannot rollback import '${importId}' because newer catalogue imports or modifications have occurred. Only the most recent import can be rolled back.`,
      };
    }
  }

  return { allowed: true, snapshot };
};

export class RollbackEligibilityError extends Error {
  constructor(reason) {
    super(reason);
    this.name = "RollbackEligibilityError";
    this.reason = reason;
    this.isEligibilityConflict = true;
  }
}

/**
 * Restores the catalogue to the pre-import snapshot state.
 */
export const rollbackToSnapshot = (importId) => {
  const check = isRollbackAllowed(importId);
  if (!check.allowed) {
    throw new RollbackEligibilityError(check.reason);
  }

  const { snapshot } = check;
  const restoredCatalog = JSON.parse(JSON.stringify(snapshot.catalogData));

  // 1. Persist restored catalogue to disk
  saveCatalogToDisk(restoredCatalog);

  // 2. Advance catalogue revision
  advanceCatalogRevision("rollback", importId);

  // 3. Update snapshot status
  snapshot.status = "rolled_back";
  snapshot.rolledBackAt = new Date().toISOString();
  snapshots.set(importId, snapshot);

  try {
    const backupFile = path.join(BACKUPS_DIR, `backup_${importId}.json`);
    if (fs.existsSync(backupFile)) {
      fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2), "utf8");
    }
  } catch (err) {
    console.error(`[CatalogStore] Failed to update backup file for ${importId}:`, err.message);
  }

  return restoredCatalog;
};

/**
 * Returns metadata summary of import history without leaking internal paths or full catalog payloads.
 */
export const getImportHistory = () => {
  if (snapshots.size === 0) {
    hydrateBackupsFromDisk();
  }

  const currentRev = getCatalogRevision();

  return Array.from(snapshots.values()).map((s) => ({
    importId: s.importId,
    timestamp: s.timestamp,
    adminEmail: s.adminEmail,
    itemCount: s.itemCount,
    status: s.status,
    postImportRevision: s.postImportRevision || null,
    isRollbackEligible: Boolean(s.status === "active" && s.postImportRevision === currentRev),
    rolledBackAt: s.rolledBackAt || null,
  }));
};

/**
 * Testing Isolation Helper
 */
export const resetStoreForTesting = (seed = PRODUCTS) => {
  snapshots.clear();
  lastImportId = null;
  activeMutation = null;

  const catalog = JSON.parse(JSON.stringify(seed));
  saveCatalogToDisk(catalog);

  const initialMeta = {
    revision: 1,
    lastMutationType: "reset_testing",
    lastMutationAt: new Date().toISOString(),
    lastImportId: null,
  };
  saveCatalogMeta(initialMeta);

  return catalog;
};
