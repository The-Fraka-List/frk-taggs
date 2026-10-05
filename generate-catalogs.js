const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"]);

function collectImages(directory, urlRoot, parent = "") {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    const relativePath = path.posix.join(parent, entry.name);
    if (entry.isDirectory()) return collectImages(filePath, urlRoot, relativePath);
    if (!entry.isFile() || !imageExtensions.has(path.extname(entry.name).toLowerCase())) return [];

    const encodedPath = relativePath.split(path.sep).map(encodeURIComponent).join("/");
    return [{ name: relativePath.replaceAll(path.sep, "/"), url: `./${urlRoot}/${encodedPath}` }];
  });
}

[
  { folder: "assets", catalog: "catalog-assets.json" },
  { folder: "bg", catalog: "catalog-bg.json" },
].forEach(({ folder, catalog }) => {
  const images = collectImages(path.join(root, folder), folder);
  fs.writeFileSync(path.join(root, catalog), `${JSON.stringify(images, null, 2)}\n`);
  console.log(`${catalog}: ${images.length} imágenes`);
});