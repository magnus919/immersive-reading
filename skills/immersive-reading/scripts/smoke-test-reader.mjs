#!/usr/bin/env node
import fs from "node:fs";
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.argv[2] || ".");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const required = [
  "index.html",
  "src/app.js",
  "src/frontier.js",
  "src/styles.css",
  "src/articles/index.js",
  "assets/door-entrance-8s-scrub.mp4",
  "assets/door-entrance-8s-poster.jpg"
];
const forbidden = [
  "createReaderMetrics",
  "/api/pulse",
  "/api/metrics",
  "READ_PAUL_GRAHAM",
  "great-work-eta",
  "ranli.me",
  "paulgraham.com/greatwork",
  "Cinematic Reader"
];

const errors = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
}

for (const file of walk(root)) {
  if (!/\.(html|js|css|json|md)$/.test(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (file.includes(`${path.sep}src${path.sep}articles${path.sep}`)) {
    checkLocalSourceMedia(file, text);
  }
  for (const needle of forbidden) {
    if (text.includes(needle)) {
      errors.push(`Forbidden string "${needle}" found in ${path.relative(root, file)}`);
    }
  }
}

await checkPreviewServerRange();

if (errors.length) {
  console.error("Reader smoke test failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, root }, null, 2));

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function checkLocalSourceMedia(file, text) {
  const matches = text.matchAll(/["'`](assets\/source\/[^"'`]+)["'`]/g);
  for (const match of matches) {
    const rel = match[1];
    if (!fs.existsSync(path.join(root, rel))) {
      errors.push(`Missing source media ${rel} referenced in ${path.relative(root, file)}`);
    }
  }
}

async function checkPreviewServerRange() {
  const serveScript = path.join(scriptDir, "serve-reader.mjs");
  const videoPath = "assets/door-entrance-8s-scrub.mp4";
  if (!fs.existsSync(path.join(root, videoPath))) return;

  const port = await getAvailablePort();
  const child = spawn(process.execPath, [serveScript, root, "--port", String(port)], {
    stdio: ["ignore", "pipe", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer(port, child);
    const response = await fetchWithTimeout(`http://127.0.0.1:${port}/${videoPath}`, {
      headers: { Range: "bytes=0-31" }
    });
    const bytes = await response.arrayBuffer();
    const contentRange = response.headers.get("content-range") || "";
    const acceptRanges = response.headers.get("accept-ranges") || "";

    if (response.status !== 206) {
      errors.push(`Preview server must return 206 for video Range requests; got ${response.status}`);
    }
    if (acceptRanges.toLowerCase() !== "bytes") {
      errors.push("Preview server must set Accept-Ranges: bytes for video files");
    }
    if (!/^bytes 0-31\/\d+$/.test(contentRange)) {
      errors.push(`Preview server returned invalid Content-Range for video: ${contentRange || "(missing)"}`);
    }
    if (bytes.byteLength !== 32) {
      errors.push(`Preview server returned ${bytes.byteLength} bytes for a 32-byte video Range request`);
    }
  } catch (error) {
    errors.push(`Preview server Range check failed: ${error.message}${stderr ? ` (${stderr.trim()})` : ""}`);
  } finally {
    child.kill("SIGTERM");
  }
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close(() => {
        if (port) resolve(port);
        else reject(new Error("Could not allocate a local port"));
      });
    });
  });
}

async function waitForServer(port, child) {
  const started = Date.now();
  while (Date.now() - started < 5000) {
    if (child.exitCode !== null) {
      throw new Error(`serve-reader exited with code ${child.exitCode}`);
    }
    try {
      const response = await fetchWithTimeout(`http://127.0.0.1:${port}/`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Timed out waiting for serve-reader on port ${port}`);
}

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
  });
}
