import { spawnSync } from "node:child_process";
import path from "node:path";

function fail(message) {
  process.stderr.write(`Hosted build configuration error: ${message}\n`);
  process.exit(1);
}

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!configuredApiUrl) {
  fail("NEXT_PUBLIC_API_URL is required");
}

let apiUrl;
try {
  apiUrl = new URL(configuredApiUrl);
} catch {
  fail("NEXT_PUBLIC_API_URL must be a valid absolute URL");
}

if (apiUrl.protocol !== "https:") {
  fail("NEXT_PUBLIC_API_URL must use HTTPS");
}

const hostname = apiUrl.hostname.toLowerCase();
if (
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname.endsWith(".localhost")
) {
  fail("NEXT_PUBLIC_API_URL must not target a loopback host");
}

if (process.env.NEXT_PUBLIC_BLOCKCHAIN_ENABLED !== "false") {
  fail("NEXT_PUBLIC_BLOCKCHAIN_ENABLED must be false for the Web2 hosted baseline");
}

const nextBin = path.resolve("node_modules", "next", "dist", "bin", "next");
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_ENFORCE_PROD_API_URL: "true",
  },
});

process.exit(result.status ?? 1);
