const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const assetsRoot = path.join(root, "assets");
const backgroundsRoot = path.join(root, "bg");
const port = Number(process.env.PORT) || 4173;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
};

function listImages(directory, urlRoot, parent = "") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    const relativePath = path.posix.join(parent, entry.name);
    if (entry.isDirectory()) return listImages(filePath, urlRoot, relativePath);
    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    const url = `${urlRoot}/${relativePath.split(path.sep).map(encodeURIComponent).join("/")}`;
    return [{ name: relativePath.replaceAll(path.sep, "/"), url }];
  });
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  if (requestUrl.pathname === "/api/assets" || requestUrl.pathname === "/api/bg") {
    const isBackgrounds = requestUrl.pathname === "/api/bg";
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(listImages(
      isBackgrounds ? backgroundsRoot : assetsRoot,
      isBackgrounds ? "/bg" : "/assets"
    )));
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Length": stats.size,
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Tarjeta disponible en http://127.0.0.1:${port}`);
});