#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const root = path.resolve(args._[0] || ".");
const port = Number(args.port || 8791);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  fail(`Invalid port: ${args.port}`);
}

if (!fs.existsSync(path.join(root, "index.html"))) {
  fail(`Expected a generated reader folder with index.html: ${root}`);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
  const filePath = resolveFile(root, url.pathname);

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    serveFile(request, response, filePath, stat);
  });
});

server.on("error", (error) => {
  fail(`Could not start local preview server on 127.0.0.1:${port}: ${error.message}`);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${root}`);
  console.log(`Open http://127.0.0.1:${port}/`);
});

function resolveFile(rootDir, pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const full = path.resolve(rootDir, relative);
  const withIndex = fs.existsSync(full) && fs.statSync(full).isDirectory()
    ? path.join(full, "index.html")
    : full;
  return withIndex.startsWith(rootDir + path.sep) || withIndex === rootDir ? withIndex : null;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webm": "video/webm",
    ".webp": "image/webp"
  }[ext] || "application/octet-stream";
}

function serveFile(request, response, filePath, stat) {
  const type = contentType(filePath);
  const range = request.headers.range;

  if (!range) {
    response.writeHead(200, {
      "Content-Type": type,
      "Accept-Ranges": "bytes",
      "Content-Length": stat.size,
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(response);
    return;
  }

  const parsed = parseRange(range, stat.size);
  if (!parsed) {
    response.writeHead(416, {
      "Content-Range": `bytes */${stat.size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store"
    });
    response.end();
    return;
  }

  response.writeHead(206, {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Content-Range": `bytes ${parsed.start}-${parsed.end}/${stat.size}`,
    "Content-Length": parsed.end - parsed.start + 1,
    "Cache-Control": "no-store"
  });
  fs.createReadStream(filePath, parsed).pipe(response);
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || size < 1) return null;

  let start;
  let end;
  if (match[1] === "" && match[2] === "") return null;

  if (match[1] === "") {
    const suffixLength = Number(match[2]);
    if (!Number.isSafeInteger(suffixLength) || suffixLength < 1) return null;
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Number(match[2]);
  }

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
  if (start < 0 || end < start || start >= size) return null;
  return { start, end: Math.min(end, size - 1) };
}

function parseArgs(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }
  return result;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
