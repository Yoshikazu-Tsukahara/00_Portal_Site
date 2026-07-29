const sharp = require("sharp");

(async () => {
  const { data, info } = await sharp("public/robot-freethrow/goal.png")
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;

  function isInk(x, y) {
    const i = (y * W + x) * 4;
    if (data[i + 3] < 20) return false;
    return (data[i] + data[i + 1] + data[i + 2]) / 3 > 40;
  }

  const rawL = [];
  const rawR = [];
  const ys = [];

  // 外郭：左=最小、右=最大（ボード手前まで）。メッシュ内部は無視
  for (let y = 230; y <= 331; y++) {
    let L = -1;
    let R = -1;
    for (let x = 125; x <= 252; x++) {
      if (isInk(x, y)) {
        if (L < 0) L = x;
        R = x;
      }
    }
    if (L < 0) continue;
    ys.push(y);
    rawL.push(L);
    rawR.push(R);
  }

  // 中央値フィルタでスパイク除去
  function median3(arr) {
    const out = arr.slice();
    for (let i = 1; i < arr.length - 1; i++) {
      const a = [arr[i - 1], arr[i], arr[i + 1]].sort((p, q) => p - q);
      out[i] = a[1];
    }
    return out;
  }
  let L = median3(median3(rawL));
  let R = median3(median3(rawR));

  // 上端付近の右外郭がボード接続で膨らむので、下半分の傾向で上を拘束
  const mid = Math.floor(ys.length * 0.35);
  for (let i = 0; i < mid; i++) {
    const t = i / Math.max(1, mid);
    // 下側の傾きから外挿した上限
    const ref = R[mid] + (R[mid] - R[Math.min(ys.length - 1, mid + 20)]) * (1 - t) * 0.3;
    // リム後端〜下端をなめらかに接続する天井
    const rimBack = 250;
    const ceiling = rimBack + (R[mid] - rimBack) * (i / mid);
    R[i] = Math.min(R[i], Math.max(ceiling, ref));
  }

  console.log("smoothed samples:");
  for (let i = 0; i < ys.length; i += 4) {
    console.log(ys[i], L[i], R[i], "w=" + (R[i] - L[i]));
  }

  console.log("\n  // goal.png 解析ベースのネット外郭（正規化座標）");
  console.log("  netProfile: [");
  for (let i = 0; i < ys.length; i += 6) {
    console.log(
      "    { y: " +
        (ys[i] / H).toFixed(5) +
        ", l: " +
        (L[i] / W).toFixed(5) +
        ", r: " +
        (R[i] / W).toFixed(5) +
        " },",
    );
  }
  const i = ys.length - 1;
  console.log(
    "    { y: " +
      (ys[i] / H).toFixed(5) +
      ", l: " +
      (L[i] / W).toFixed(5) +
      ", r: " +
      (R[i] / W).toFixed(5) +
      " },",
  );
  console.log("  ],");
})();
