import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================================");
console.log("🚀 STARTING FULL-STACK GIFTING WELLNESS APPLICATION");
console.log("==================================================================");
console.log("📦 Backend:  http://localhost:5000 (User API) & http://localhost:5001 (Admin API)");
console.log("🛍️ Frontend: http://localhost:5173 (Storefront) & http://localhost:5174 (Admin Portal)");
console.log("==================================================================\n");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

// 1. Spawn Backend
const backendProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.resolve(rootDir, "backend"),
  stdio: "inherit",
  shell: true,
});

// 2. Spawn Frontend
const frontendProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.resolve(rootDir, "frontend"),
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  console.log("\n🛑 Stopping all servers...");
  try {
    backendProcess.kill();
    frontendProcess.kill();
  } catch (e) {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
