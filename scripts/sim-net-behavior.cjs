/**
 * 狭いネット下端（ボール直径より狭い）での挙動再現
 */
const Matter = require("matter-js");
const { Engine, Bodies, Body, Composite, Events, Vector } = Matter;

const NET_SOFT_E = 0.07;
const NET_KINETIC_MU = 0.62;
const NET_POS_SOFT = 0.4;
const BALL_R = 16;
const mid = 400;
const rimY = 200;

// 下端がボール直径より狭い（本番のすぼまりに近い）
const profile = [];
for (let i = 0; i <= 20; i++) {
  const t = i / 20;
  const y = rimY + 6 + t * 100;
  const half = 40 - 28 * Math.pow(t, 0.85); // top 80 → bottom 24 width
  profile.push({ y, l: mid - half, r: mid + half });
}
console.log(
  "top gap",
  (profile[0].r - profile[0].l).toFixed(1),
  "bot gap",
  (profile[profile.length - 1].r - profile[profile.length - 1].l).toFixed(1),
  "ball diam",
  BALL_R * 2,
);

function wallsAtY(y) {
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    if (y >= a.y && y <= b.y) {
      const t = (y - a.y) / Math.max(1e-6, b.y - a.y);
      return { l: a.l + (b.l - a.l) * t, r: a.r + (b.r - a.r) * t };
    }
  }
  const last = profile[profile.length - 1];
  return { l: last.l, r: last.r };
}

function makeNetSeg(x1, y1, x2, y2, sensor) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const len = Math.max(4, Math.hypot(x2 - x1, y2 - y1));
  return Bodies.rectangle(cx, cy, len, 2.8, {
    isStatic: true,
    isSensor: !!sensor,
    angle: Math.atan2(y2 - y1, x2 - x1),
    label: "net",
    restitution: 0,
    friction: 0,
    slop: 0.08,
  });
}

function run(name, opts) {
  const eng = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
  let netSway = 0;
  const nets = [];
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i];
    const b = profile[i + 1];
    // 本番同様に区間を2分割
    for (let s = 0; s < 2; s++) {
      const t0 = s / 2;
      const t1 = (s + 1) / 2;
      const lx0 = a.l + (b.l - a.l) * t0;
      const ly0 = a.y + (b.y - a.y) * t0;
      const lx1 = a.l + (b.l - a.l) * t1;
      const ly1 = a.y + (b.y - a.y) * t1;
      const rx0 = a.r + (b.r - a.r) * t0;
      const ry0 = a.y + (b.y - a.y) * t0;
      const rx1 = a.r + (b.r - a.r) * t1;
      const ry1 = a.y + (b.y - a.y) * t1;
      nets.push(makeNetSeg(lx0, ly0, lx1, ly1, opts.sensor));
      nets.push(makeNetSeg(rx0, ry0, rx1, ry1, opts.sensor));
    }
  }
  const ball = Bodies.circle(mid + 2, rimY - 10, BALL_R, {
    restitution: 0.72,
    friction: 0.55,
    frictionAir: 0.01,
    density: 0.0032,
    label: "ball",
  });
  Composite.add(eng.world, [...nets, ball]);
  Body.setVelocity(ball, { x: opts.vx || 1.2, y: 4 });

  function respond(ballBody, pair, isImpact) {
    if (opts.geomNormal) {
      const w = wallsAtY(ballBody.position.y);
      const m = (w.l + w.r) / 2;
      let nx = ballBody.position.x < m ? 1 : -1;
      let ny = 0;
      // めり込み量を幾何で
      let depth = 0;
      if (ballBody.position.x - BALL_R < w.l) depth = w.l - (ballBody.position.x - BALL_R);
      if (ballBody.position.x + BALL_R > w.r)
        depth = Math.max(depth, ballBody.position.x + BALL_R - w.r);
      // 幅不足時は下方向へ逃がす
      const gap = w.r - w.l;
      if (gap < BALL_R * 2 + 2) {
        ny = 0.65;
        nx *= 0.35;
        const nLen = Math.hypot(nx, ny) || 1;
        nx /= nLen;
        ny /= nLen;
      }
      if (depth > 0.01) {
        Body.translate(ballBody, {
          x: nx * depth * (opts.soft || 0.35),
          y: ny * depth * (opts.soft || 0.35),
        });
      }
      let vx = ballBody.velocity.x * 0.85;
      let vy = ballBody.velocity.y;
      if (gap < BALL_R * 2 + 2) {
        vy = Math.max(vy, opts.exitBoost || 1.2);
        vx *= 0.5;
      } else {
        vy = Math.max(vy * 0.98, 0.15);
      }
      Body.setVelocity(ballBody, { x: vx + (m - ballBody.position.x) * 0.02, y: vy });
      return;
    }

    const col = pair.collision;
    if (!col) return;
    let nx = col.normal.x;
    let ny = col.normal.y;
    if (pair.bodyA === ballBody) {
      nx = -nx;
      ny = -ny;
    }
    const nLen = Math.hypot(nx, ny) || 1;
    nx /= nLen;
    ny /= nLen;
    const depth = Math.max(0, col.depth || 0);
    if (depth > 0.01) {
      Body.translate(ballBody, {
        x: nx * depth * NET_POS_SOFT,
        y: ny * depth * NET_POS_SOFT,
      });
    }
    const vx = ballBody.velocity.x;
    const vy = ballBody.velocity.y;
    const vn = vx * nx + vy * ny;
    const vtx = vx - vn * nx;
    const vty = vy - vn * ny;
    let vnOut = vn < 0 ? -vn * NET_SOFT_E : vn * 0.35;
    let nvx = vnOut * nx + vtx * NET_KINETIC_MU;
    let nvy = vnOut * ny + vty * NET_KINETIC_MU;
    if (ballBody.position.y > rimY + 4) {
      if (nvy < 0) nvy *= 0.45;
      if (opts.forceDown) nvy = Math.max(nvy, 0.35);
      nvx += (mid - ballBody.position.x) * 0.012;
    }
    Body.setVelocity(ballBody, { x: nvx, y: nvy });
  }

  if (!opts.tickOnly) {
    Events.on(eng, "collisionStart", (ev) => {
      for (const pair of ev.pairs) {
        const ballBody =
          pair.bodyA.label === "ball"
            ? pair.bodyA
            : pair.bodyB.label === "ball"
              ? pair.bodyB
              : null;
        if (!ballBody) continue;
        const other = ballBody === pair.bodyA ? pair.bodyB : pair.bodyA;
        if (other.label === "net") respond(ballBody, pair, true);
      }
    });
    Events.on(eng, "collisionActive", (ev) => {
      for (const pair of ev.pairs) {
        const ballBody =
          pair.bodyA.label === "ball"
            ? pair.bodyA
            : pair.bodyB.label === "ball"
              ? pair.bodyB
              : null;
        if (!ballBody) continue;
        const other = ballBody === pair.bodyA ? pair.bodyB : pair.bodyA;
        if (other.label === "net") respond(ballBody, pair, false);
      }
    });
  }

  let stuck = 0;
  let maxAbsVx = 0;
  let zigZag = 0;
  let prevVx = 0;
  const log = [];
  for (let i = 0; i < 240; i++) {
    Engine.update(eng, 1000 / 60);

    if (opts.tickGeom) {
      // 毎tick幾何ベースのナイロン応答（センサーネット想定）
      const w = wallsAtY(ball.position.y);
      const gap = w.r - w.l;
      let depthL = w.l - (ball.position.x - BALL_R);
      let depthR = ball.position.x + BALL_R - w.r;
      // 幅不足時はネットがしなる（仮想的に広げる）
      let half = gap / 2;
      if (gap < BALL_R * 2 + 2) {
        const need = BALL_R + 1;
        half = need;
        netSway = Math.min(1, netSway + 0.08);
      }
      const m = (w.l + w.r) / 2;
      const softL = m - half;
      const softR = m + half;
      depthL = softL - (ball.position.x - BALL_R);
      depthR = ball.position.x + BALL_R - softR;
      let vx = ball.velocity.x;
      let vy = ball.velocity.y;
      if (depthL > 0) {
        Body.translate(ball, { x: depthL * 0.5, y: 0 });
        vx = Math.abs(vx) * 0.3;
      }
      if (depthR > 0) {
        Body.translate(ball, { x: -depthR * 0.5, y: 0 });
        vx = -Math.abs(vx) * 0.3;
      }
      if (ball.position.y > rimY + 4 && ball.position.y < profile[profile.length - 1].y + 5) {
        vx *= 0.92;
        vx += (m - ball.position.x) * 0.015;
        if (gap < BALL_R * 2 + 4) {
          // すぼまりで噛んだら下へ抜ける（しなり出口）
          vy = Math.max(vy * 0.95, 1.5 + netSway);
        } else {
          vy = Math.max(vy, 0.2);
        }
      }
      Body.setVelocity(ball, { x: vx, y: vy });
      netSway *= 0.96;
    } else if (opts.interiorDrag) {
      const y = ball.position.y;
      if (y > rimY + 4 && y < profile[profile.length - 1].y + 10) {
        const w = wallsAtY(y);
        let wallL = w.l;
        let wallR = w.r;
        const m = (wallL + wallR) / 2;
        let half = ((wallR - wallL) * 0.5) * (1 + netSway * 0.28);
        half = Math.max(half, BALL_R * 0.85);
        wallL = m - half;
        wallR = m + half;
        if (ball.position.x >= wallL - BALL_R && ball.position.x <= wallR + BALL_R) {
          let vx = ball.velocity.x * 0.9;
          let vy = ball.velocity.y;
          if (vy > 0) vy = Math.max(vy * 0.93, 0.4);
          else vy *= 0.7;
          vx += (m - ball.position.x) * 0.01;
          Body.setVelocity(ball, { x: vx, y: vy });
        }
        netSway *= 0.965;
      }
    }

    const sp = Vector.magnitude(ball.velocity);
    maxAbsVx = Math.max(maxAbsVx, Math.abs(ball.velocity.x));
    if (prevVx * ball.velocity.x < 0 && Math.abs(ball.velocity.x) > 0.5) zigZag++;
    prevVx = ball.velocity.x;
    if (sp < 0.2 && ball.position.y > rimY + 15 && ball.position.y < 320) stuck++;
    if (i % 20 === 0) {
      const w = wallsAtY(ball.position.y);
      log.push({
        i,
        x: +ball.position.x.toFixed(1),
        y: +ball.position.y.toFixed(1),
        vx: +ball.velocity.x.toFixed(2),
        vy: +ball.velocity.y.toFixed(2),
        gap: +(w.r - w.l).toFixed(1),
      });
    }
    if (ball.position.y > 380) break;
  }
  console.log("\n===", name, "===");
  console.log(
    "exit",
    ball.position.y > profile[profile.length - 1].y + 15,
    "y",
    ball.position.y.toFixed(1),
    "stuck",
    stuck,
    "zigZag",
    zigZag,
    "max|vx|",
    maxAbsVx.toFixed(2),
  );
  console.table(log);
}

run("CURRENT solid+forceDown+interior", {
  sensor: false,
  forceDown: true,
  interiorDrag: true,
});
run("solid only (no interior) — jitter?", {
  sensor: false,
  forceDown: true,
  interiorDrag: false,
});
run("FIX: sensor + tick geometric soft exit", {
  sensor: true,
  tickGeom: true,
  tickOnly: true,
});
