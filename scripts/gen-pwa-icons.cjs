const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = process.cwd();
const apps = [
  "mail-template",
  "pdf-editor",
  "image-compressor",
  "invoice-maker",
  "pixel-drop-puzzle",
  "crypto-message",
  "palette-collector",
  "robot-freethrow",
  "link-stocker",
];

async function render(name) {
  const svgPath = path.join(root, "public", "icons", `${name}.svg`);
  let text = fs.readFileSync(svgPath, "utf8");
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  // strip non-svg leading junk
  const start = text.indexOf("<svg");
  if (start > 0) text = text.slice(start);
  const buf = Buffer.from(text, "utf8");
  for (const size of [192, 512]) {
    const out = path.join(root, "public", "icons", `${name}-${size}.png`);
    await sharp(buf, { density: 384 })
      .resize(size, size, {
        fit: "contain",
        background: { r: 244, g: 244, b: 245, alpha: 1 },
      })
      .png()
      .toFile(out);
    console.log("wrote", out, fs.statSync(out).size);
  }
}

(async () => {
  for (const name of apps) {
    console.log("rendering", name);
    await render(name);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
