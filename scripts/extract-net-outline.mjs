import sharp from "sharp";

const { data, info } = await sharp("public/robot-freethrow/goal.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width;
const H = info.height;

function isInk(x, y) {
  const i = (y * W + x) * 4;
  if (data[i + 3] < 20) return false;
  return (data[i] + data[i + 1] + data[i + 2]) / 3 > 45;
}

const lefts = [];
const rights = [];
const ys = [];

for (let y = 231; y <= 332; y++) {
  const xs = [];
  for (let x = 125; x <= 258; x++) if (isInk(x, y)) xs.push(x);
  if (!xs.length) continue;

  const clusters = [];
  let cur = [xs[0]];
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] - xs[i - 1] >= 6) {
      clusters.push(cur);
      cur = [xs[i]];
    } else cur.push(xs[i]);
  }
  clusters.push(cur);

  const netClusters = clusters.filter((c) => c[0] < 200 && c[c.length - 1] < 255);
  const best = netClusters.length
    ? netClusters.reduce((a, b) => (a.length >= b.length ? a : b))
    : clusters[0];

  lefts.push(best[0]);
  rights.push(best[best.length - 1]);
  ys.push(y);

  if (y % 4 === 0 || y === 231 || y === 332) {
    console.log(
      y,
      best[0],
      best[best.length - 1],
      clusters.map((c) => `${c[0]}-${c[c.length - 1]}`).join(" | "),
    );
  }
}

console.log("\nNET_PROFILE = [");
for (let i = 0; i < ys.length; i += 5) {
  console.log(
    `  { y: ${(ys[i] / H).toFixed(5)}, l: ${(lefts[i] / W).toFixed(5)}, r: ${(rights[i] / W).toFixed(5)} },`,
  );
}
const i = ys.length - 1;
console.log(
  `  { y: ${(ys[i] / H).toFixed(5)}, l: ${(lefts[i] / W).toFixed(5)}, r: ${(rights[i] / W).toFixed(5)} },`,
);
console.log("];");
