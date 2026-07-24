"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import {
  advancePatrolSpeedState,
  computeGeometry,
  fallSeatDurationMs,
  fallSeatEase,
  stepFallMotion,
  idealStopTimeDeltaMs,
  MAX_BOARD_WIDTH,
  periodMsForPatrolSpeedLevel,
  randomPatrolPhaseMs,
  triangleWave,
  type PatrolSpeedState,
  type PlayGeometry,
} from "./engine";
import type { LoadedGameImage } from "./imageUtil";
import ImageChangeOverlay from "./ImageChangeOverlay";
import LifeDepletedOverlay from "./LifeDepletedOverlay";
import ParticleBurst from "./ParticleBurst";
import RecordsSideRails from "./RecordsSideRails";
import ResultOverlay from "./ResultOverlay";
import UploadGate from "./UploadGate";
import {
  ANTI_CHEAT_LOCKDOWN_MS,
  evaluateKeyAntiCheat,
  evaluatePointerAntiCheat,
  pushPointerSample,
  type PointerSample,
} from "./antiCheat";
import {
  FAIL_PARTICLE_BEFORE_RESULT_MS,
  IMPACT_HOLD_MS,
  lifeAfterDamage,
  periodMsForStage,
  resolveDropOutcome,
  shouldDelayFailResult,
  shouldHoldAtImpact,
  stageThemeStyle,
  toleranceForStage,
  type JudgeResult,
} from "./types";

type Phase = "patrolling" | "falling" | "merging" | "success" | "fail" | "depleted";

/** DROP 瞬間に確定した落下パラメータ（falling エフェクトへ受け渡す） */
type DropPayload = {
  x: number;
  /** 落下瞬間の周期内位相（ms）。時間差演出に使う */
  phaseMsAtDrop: number;
  /** 落下瞬間の実効往復周期（速度減衰反映後） */
  periodMsAtDrop: number;
  geometry: PlayGeometry;
};

/** パトロール時計（往復カウントと速度減衰。UI非表示の隠し仕様） */
type PatrolClock = PatrolSpeedState & { lastNow: number };

/** 成功時に枠・溝が溶けて1枚絵になる演出の長さ（ms）＝ガシャン＆溶解 */
const SUCCESS_MERGE_MS = 750;
/** 縁を光が一周する時間（ms） */
const SUCCESS_SWEEP_MS = 1300;

/** 互換：溶解トランジションに使う */
const MERGE_DURATION_MS = SUCCESS_MERGE_MS;

/** スマホ：1本指タップとスクロールを区別する移動上限（px） */
const TOUCH_DROP_MAX_MOVE_PX = 28;
/** スマホ：タップとして DROP する最大時間（ms） */
const TOUCH_DROP_MAX_MS = 450;

function isPlaySurfaceInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "button, a, input, label, textarea, select, [role='dialog']",
    ),
  );
}

function pointerCentroidY(
  positions: Map<number, { x: number; y: number }>,
): number | null {
  if (positions.size < 2) return null;
  let sum = 0;
  for (const p of positions.values()) sum += p.y;
  return sum / positions.size;
}

type SuccessFx = "idle" | "merge" | "sweep" | "done";

/**
 * 1回分の挑戦を管理するゲーム本体。
 * 親から `key={roundId}` で remount され、内部状態は毎回まっさらにリセットされる。
 *
 * 流れ:
 * 1. 上空で縦長の棒が左右往復（patrolling）
 * 2. DROP / タップでその瞬間のXをロックし真下へ落下（falling）
 * 3. 落下中はカメラが棒を追従して自動スクロール
 * 4. 成功 → 枠が溶けて完成絵へ / 失敗 → 粒子化（カメラ位置を親へ記憶）
 */
export default function PlayField({
  imageDataUrl,
  naturalWidth,
  naturalHeight,
  stage,
  lifePt,
  nearHitStreak,
  lifeRecoveredAtMs,
  playActive,
  copy,
  restoreScrollY,
  records,
  usingDefaultImage,
  onImageChange,
  onRestoreDefaultImage,
  onResetProgress,
  onSettled,
  onRememberFailScroll,
  onRetry,
  onNext,
}: {
  imageDataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  stage: number;
  /** 現在ステージの残りライフ（pt） */
  lifePt: number;
  /** ステージ7以降の連続ニアピン（≤5px）カウント */
  nearHitStreak: number;
  /** ニアピン5連続でライフ回復した時刻（演出用。null なら未発生） */
  lifeRecoveredAtMs: number | null;
  /** false の間はパトロール・DROP を停止（ルール説明中など） */
  playActive: boolean;
  copy: PixelDropPuzzleDict;
  /** 失敗リトライ時に復元するスクロール位置（null ならステージ上端） */
  restoreScrollY: number | null;
  /** 盤面グリッド上に薄く表示する記録 */
  records: {
    highestClearedStage: number;
    bestAbsErrorPx: number | null;
    totalAttempts: number;
  };
  onResetProgress: () => void;
  /** 同梱デフォルト画像を使用中 */
  usingDefaultImage: boolean;
  /** 画像変更確定時（全面オーバーレイから） */
  onImageChange: (image: LoadedGameImage) => void;
  /** デフォルト画像へ戻す */
  onRestoreDefaultImage: () => void;
  onSettled: (judge: JudgeResult) => void;
  /** 失敗確定時のカメラ位置を親へ渡す */
  onRememberFailScroll: (scrollY: number) => void;
  onRetry: () => void;
  onNext: () => void;
}) {
  const failResultTimerRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const groundGuideRef = useRef<HTMLDivElement | null>(null);
  const patrolRafRef = useRef<number | null>(null);
  const fallRafRef = useRef<number | null>(null);
  const patrolClockRef = useRef<PatrolClock | null>(null);
  const geometryRef = useRef<PlayGeometry | null>(null);
  const phaseRef = useRef<Phase>("patrolling");
  const settledRef = useRef(false);
  const dropPayloadRef = useRef<DropPayload | null>(null);
  /** ステージ基本周期（最速）。速度減衰の基準 */
  const basePeriodMsRef = useRef(periodMsForStage(stage));
  /** 落下中のカメラ追従状態（STOP時のスクロール位置を保持し、跳ばない） */
  const cameraFollowRef = useRef<{ active: boolean; scrollAtDrop: number }>({
    active: false,
    scrollAtDrop: 0,
  });

  const [geometry, setGeometry] = useState<PlayGeometry | null>(null);
  const [phase, setPhase] = useState<Phase>("patrolling");
  /** 着地直後の「惜しい」溜め中（棒は地表上端で静止） */
  const [impactHolding, setImpactHolding] = useState(false);
  /** 画像変更フロー中はパトロール・DROP を停止 */
  const [imageChangeOpen, setImageChangeOpen] = useState(false);
  /** 降格前ステージ（警告 UI 用） */
  const [depleteFromStage, setDepleteFromStage] = useState(stage);
  /** 不正検知ロックダウン中 */
  const [lockdown, setLockdown] = useState(false);
  const lockdownTimerRef = useRef<number | null>(null);
  const pointerHistoryRef = useRef<PointerSample[]>([]);
  const lastKeyDropMsRef = useRef<number | null>(null);
  const playSurfaceRef = useRef<HTMLDivElement | null>(null);
  /** アクティブなタッチ／ポインタ位置（2本指スクロール用） */
  const activePointersRef = useRef(
    new Map<number, { x: number; y: number }>(),
  );
  const lastTwoFingerCentroidYRef = useRef<number | null>(null);
  /** 現在のタッチジェスチャ（1本指 DROP 判定用） */
  const touchGestureRef = useRef<{
    startX: number;
    startY: number;
    startT: number;
    /** 2本指以上が一度でも使われた */
    multiTouch: boolean;
  } | null>(null);

  const playBlocked = !playActive || imageChangeOpen || lockdown;
  const playBlockedRef = useRef(playBlocked);
  useEffect(() => {
    playBlockedRef.current = playBlocked;
  }, [playBlocked]);

  const triggerLockdown = useCallback(() => {
    setLockdown(true);
    if (lockdownTimerRef.current !== null) {
      window.clearTimeout(lockdownTimerRef.current);
    }
    lockdownTimerRef.current = window.setTimeout(() => {
      lockdownTimerRef.current = null;
      setLockdown(false);
      // ロック解除後は履歴を捨て、誤検知の連鎖を防ぐ
      pointerHistoryRef.current = [];
      lastKeyDropMsRef.current = null;
    }, ANTI_CHEAT_LOCKDOWN_MS);
  }, []);

  const changeImageControl = useMemo(
    () => (
      <UploadGate
        copy={copy.upload}
        sideRail
        stage={stage}
        onRequestChangeFlow={() => setImageChangeOpen(true)}
      />
    ),
    [copy.upload, stage],
  );
  const [judge, setJudge] = useState<JudgeResult | null>(null);
  const [lockedX, setLockedX] = useState(0);
  const [impactY, setImpactY] = useState(0);
  /** 成功時：枠・溝が溶けて完成絵になる演出中 */
  const [merging, setMerging] = useState(false);
  /** 成功セレブレーション段階（溶解→縁光一周→リザルト） */
  const [successFx, setSuccessFx] = useState<SuccessFx>("idle");
  const pendingSuccessRef = useRef<{
    x: number;
    g: PlayGeometry;
    phaseMsAtDrop: number;
    periodMsAtDrop: number;
  } | null>(null);

  const basePeriodMs = useMemo(() => periodMsForStage(stage), [stage]);
  const tolerancePx = useMemo(() => toleranceForStage(stage), [stage]);

  useEffect(() => {
    basePeriodMsRef.current = basePeriodMs;
  }, [basePeriodMs]);

  useEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // ステージ幅いっぱいでジオメトリを再計算
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setGeometry(computeGeometry(rect.width, naturalWidth, naturalHeight));
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [naturalWidth, naturalHeight]);

  // ラウンド開始時のカメラ:
  // - 失敗リトライなら前回位置を復元
  // - それ以外はステージ上端へ
  useLayoutEffect(() => {
    if (!geometry || !stageRef.current) return;
    if (restoreScrollY !== null) {
      window.scrollTo({ top: restoreScrollY, behavior: "auto" });
      return;
    }
    const top =
      stageRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  }, [geometry, restoreScrollY]);

  /**
   * 落下中のカメラ更新。
   * - STOP直後はカメラを一切動かさない
   * - 棒がビューポート中央付近まで降りてきてから、はじめて一緒に追従スクロール
   */
  const updateFallCamera = useCallback(
    (blockTopInStage: number, blockHeight: number) => {
      const stageEl = stageRef.current;
      if (!stageEl) return;

      const stageDocTop = stageEl.getBoundingClientRect().top + window.scrollY;
      // 棒の「注視点」（やや上寄り＝落下感が伝わりやすい）
      const focusDocY = stageDocTop + blockTopInStage + blockHeight * 0.28;
      const viewCenterDocY = window.scrollY + window.innerHeight * 0.42;

      if (!cameraFollowRef.current.active) {
        // 棒がまだカメラ中央より上 → カメラはそのまま待機
        if (focusDocY < viewCenterDocY) return;
        cameraFollowRef.current.active = true;
      }

      const target = focusDocY - window.innerHeight * 0.42;
      window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
    },
    [],
  );

  /**
   * 棒が画面上方にいるとき、ビューポート上端にX位置ガイドを出す。
   * 盤面が画面下より下にあるときは、下端に盤面上辺・溝位置のアシストを出す。
   */
  const updateViewportGuides = useCallback(
    (blockLeftX: number, blockTopInStage: number, g: PlayGeometry) => {
      const guide = guideRef.current;
      const groundGuide = groundGuideRef.current;
      const column = columnRef.current;
      if (!column) return;

      const stageDocTop =
        (stageRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
      const blockDocTop = stageDocTop + blockTopInStage;
      const blockDocBottom = blockDocTop + g.groundHeight;
      const groundDocTop = stageDocTop + g.groundTopY;
      const viewTop = window.scrollY;
      const viewBottom = window.scrollY + window.innerHeight;
      const activePhase =
        phaseRef.current === "patrolling" || phaseRef.current === "falling";

      // --- 上方：落ちる棒のX位置 ---
      if (guide) {
        const blockAboveViewport = blockDocBottom < viewTop + 8;
        const showBlock = blockAboveViewport && activePhase;

        if (!showBlock) {
          guide.style.opacity = "0";
          guide.style.visibility = "hidden";
        } else {
          const colRect = column.getBoundingClientRect();
          guide.style.visibility = "visible";
          guide.style.opacity = "1";
          guide.style.left = `${colRect.left + blockLeftX}px`;
          guide.style.width = `${g.gapWidth}px`;
        }
      }

      // --- 下方：盤面（溝含む上辺）の位置 ---
      if (groundGuide) {
        const groundBelowView = groundDocTop > viewBottom - 6;
        const showGround = groundBelowView && activePhase;

        if (!showGround) {
          groundGuide.style.opacity = "0";
          groundGuide.style.visibility = "hidden";
        } else {
          const colRect = column.getBoundingClientRect();
          groundGuide.style.visibility = "visible";
          groundGuide.style.opacity = "1";
          groundGuide.style.left = `${colRect.left}px`;
          groundGuide.style.width = `${g.width}px`;
          const gapMarker = groundGuide.querySelector<HTMLElement>(
            "[data-pxd-ground-gap]",
          );
          if (gapMarker) {
            gapMarker.style.left = `${g.gapX}px`;
            gapMarker.style.width = `${g.gapWidth}px`;
          }
        }
      }
    },
    [],
  );

  /** 失敗／枯渇のジャッジ結果を組み立てる */
  const presentFail = useCallback(
    (
      x: number,
      g: PlayGeometry,
      phaseMsAtDrop: number,
      periodMsAtDrop: number,
      _impactTopY: number,
      options?: { lifeDepleted?: boolean },
    ): JudgeResult => {
      const deltaPx = x - g.gapX;
      const absErrorPx = Math.abs(deltaPx);
      const timeDeltaMs = idealStopTimeDeltaMs(
        phaseMsAtDrop,
        periodMsAtDrop,
        g.maxX,
        g.gapX,
      );

      return {
        success: false,
        lifeDepleted: options?.lifeDepleted === true,
        lifeAfterPt: lifeAfterDamage(lifePt, absErrorPx),
        deltaPx,
        absErrorPx,
        tolerancePx,
        timeDeltaMs,
        maxX: g.maxX,
      };
    },
    [tolerancePx, lifePt],
  );

  const finalizeFailResult = useCallback(
    (result: JudgeResult) => {
      setJudge(result);
      onSettled(result);
    },
    [onSettled],
  );

  /** 失敗を確定（カメラ位置を記憶して粒子→リザルト） */
  const settleFail = useCallback(
    (
      x: number,
      g: PlayGeometry,
      phaseMsAtDrop: number,
      periodMsAtDrop: number,
      impactTopY: number,
    ) => {
      if (settledRef.current) return;
      settledRef.current = true;

      const result = presentFail(
        x,
        g,
        phaseMsAtDrop,
        periodMsAtDrop,
        impactTopY,
      );

      // リトライ時はDROPした瞬間の画面位置に戻す（落下追従後の位置ではない）
      onRememberFailScroll(cameraFollowRef.current.scrollAtDrop);

      setImpactY(impactTopY);
      setLockedX(x);
      setPhase("fail");
      if (guideRef.current) {
        guideRef.current.style.opacity = "0";
        guideRef.current.style.visibility = "hidden";
      }
      if (groundGuideRef.current) {
        groundGuideRef.current.style.opacity = "0";
        groundGuideRef.current.style.visibility = "hidden";
      }

      if (shouldDelayFailResult(result.absErrorPx, tolerancePx)) {
        failResultTimerRef.current = window.setTimeout(() => {
          failResultTimerRef.current = null;
          finalizeFailResult(result);
        }, FAIL_PARTICLE_BEFORE_RESULT_MS);
      } else {
        finalizeFailResult(result);
      }
    },
    [
      tolerancePx,
      presentFail,
      finalizeFailResult,
      onRememberFailScroll,
    ],
  );

  /** ライフ枯渇 → 粒子のあと降格警告 */
  const settleLifeDeplete = useCallback(
    (
      x: number,
      g: PlayGeometry,
      phaseMsAtDrop: number,
      periodMsAtDrop: number,
      impactTopY: number,
    ) => {
      if (settledRef.current) return;
      settledRef.current = true;

      const result = presentFail(x, g, phaseMsAtDrop, periodMsAtDrop, impactTopY, {
        lifeDepleted: true,
      });

      // リトライ時はDROPした瞬間の画面位置に戻す（落下追従後の位置ではない）
      onRememberFailScroll(cameraFollowRef.current.scrollAtDrop);
      setDepleteFromStage(stage);
      setImpactY(impactTopY);
      setLockedX(x);
      setPhase("depleted");

      if (guideRef.current) {
        guideRef.current.style.opacity = "0";
        guideRef.current.style.visibility = "hidden";
      }
      if (groundGuideRef.current) {
        groundGuideRef.current.style.opacity = "0";
        groundGuideRef.current.style.visibility = "hidden";
      }

      failResultTimerRef.current = window.setTimeout(() => {
        failResultTimerRef.current = null;
        setJudge(result);
        onSettled(result);
      }, FAIL_PARTICLE_BEFORE_RESULT_MS);
    },
    [presentFail, onRememberFailScroll, stage, onSettled],
  );

  /** 成功：まず枠溶解→完成絵を見せ、その後オーバーレイ */
  const beginSuccessMerge = useCallback(
    (
      x: number,
      g: PlayGeometry,
      phaseMsAtDrop: number,
      periodMsAtDrop: number,
    ) => {
      if (settledRef.current) return;
      settledRef.current = true;
      pendingSuccessRef.current = { x, g, phaseMsAtDrop, periodMsAtDrop };

      if (guideRef.current) {
        guideRef.current.style.opacity = "0";
        guideRef.current.style.visibility = "hidden";
      }
      if (groundGuideRef.current) {
        groundGuideRef.current.style.opacity = "0";
        groundGuideRef.current.style.visibility = "hidden";
      }

      // リザルト切替時にカメラを動かさない（現在位置のまま）
      setSuccessFx("merge");
      setPhase("merging");
      setMerging(true);
    },
    [],
  );

  // リザルト表示中はスクロール位置を固定（フォーカス移動などによるズレを防ぐ）
  useEffect(() => {
    if (!judge) return;
    const lockedY = window.scrollY;
    function lockScroll() {
      if (window.scrollY !== lockedY) {
        window.scrollTo({ top: lockedY, behavior: "auto" });
      }
    }
    window.addEventListener("scroll", lockScroll, { passive: true });
    return () => window.removeEventListener("scroll", lockScroll);
  }, [judge]);

  // 成功セレブレーション：溶解 → 縁光一周 → フラッシュ → リザルト
  useEffect(() => {
    if (phase !== "merging") return;
    const pending = pendingSuccessRef.current;
    if (!pending) return;

    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setSuccessFx("sweep");
      }, SUCCESS_MERGE_MS),
    );

    // 縁光一周のあと、全面フラッシュなしでリザルトへ
    timers.push(
      window.setTimeout(() => {
        const { x, g, phaseMsAtDrop, periodMsAtDrop } = pending;
        const deltaPx = x - g.gapX;
        const absErrorPx = Math.abs(deltaPx);
        const timeDeltaMs = idealStopTimeDeltaMs(
          phaseMsAtDrop,
          periodMsAtDrop,
          g.maxX,
          g.gapX,
        );
        const result: JudgeResult = {
          success: true,
          lifeAfterPt: lifeAfterDamage(lifePt, absErrorPx),
          deltaPx,
          absErrorPx,
          tolerancePx,
          timeDeltaMs,
          maxX: g.maxX,
        };
        setSuccessFx("done");
        setJudge(result);
        setPhase("success");
        onSettled(result);
      }, SUCCESS_MERGE_MS + SUCCESS_SWEEP_MS),
    );

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, tolerancePx, onSettled, lifePt]);

  // 往復パトロール（専用 rAF。falling 用とは分離してクリーンアップの衝突を防ぐ）
  // 隠し仕様: 10往復ごとに速度を1段階遅くする（最大5段階）。UIには出さない。
  useLayoutEffect(() => {
    if (phase !== "patrolling" || playBlocked) return;
    const now = performance.now();
    const periodMs = periodMsForPatrolSpeedLevel(basePeriodMsRef.current, 1);
    const g = geometryRef.current;
    // 初期X・進行方向を毎回ランダム化（タイミング予測マクロ対策）
    const phaseMs = g
      ? randomPatrolPhaseMs(periodMs, g.maxX)
      : Math.random() * periodMs;
    patrolClockRef.current = {
      periodMs,
      phaseMs,
      completedTrips: 0,
      speedLevel: 1,
      lastNow: now,
    };
    settledRef.current = false;
    dropPayloadRef.current = null;

    function tick() {
      const g = geometryRef.current;
      const clock = patrolClockRef.current;
      if (g && clock && blockRef.current && phaseRef.current === "patrolling") {
        const now = performance.now();
        const dt = now - clock.lastNow;
        clock.lastNow = now;
        advancePatrolSpeedState(clock, dt, basePeriodMsRef.current);

        const x = triangleWave(clock.phaseMs, clock.periodMs, g.maxX);
        blockRef.current.style.left = `${x}px`;
        blockRef.current.style.top = `${g.blockStartY}px`;
        updateViewportGuides(x, g.blockStartY, g);
      }
      patrolRafRef.current = requestAnimationFrame(tick);
    }
    patrolRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (patrolRafRef.current !== null) {
        cancelAnimationFrame(patrolRafRef.current);
        patrolRafRef.current = null;
      }
    };
  }, [phase, basePeriodMs, updateViewportGuides, playBlocked]);

  // 手動スクロール時もビューポートガイドを更新
  useEffect(() => {
    if (phase !== "patrolling" && phase !== "falling") return;
    function onScroll() {
      const g = geometryRef.current;
      const block = blockRef.current;
      if (!g || !block) return;
      const left = Number.parseFloat(block.style.left);
      const top = Number.parseFloat(block.style.top);
      if (!Number.isFinite(left) || !Number.isFinite(top)) return;
      updateViewportGuides(left, top, g);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, updateViewportGuides]);

  /**
   * 落下演出:
   * 1) 上空 → 地表上端に棒の下端が触れるまで落下
   * 2a) ずれている → 惜しい時は溜めてから粒子化→失敗リザルト
   * 2b) 成功 → 惜しい時は溜めてから隙間へゆっくりハマる
   */
  useLayoutEffect(() => {
    if (phase !== "falling") return;
    const payload = dropPayloadRef.current;
    if (!payload) return;

    const { x, phaseMsAtDrop, periodMsAtDrop, geometry: g } = payload;
    const absErrorPx = Math.abs(x - g.gapX);
    const outcome = resolveDropOutcome(lifePt, absErrorPx, tolerancePx);
    const success = outcome === "success";
    const depleted = outcome === "depleted";

    const contactTopY = g.groundTopY - g.groundHeight;
    const seatedTopY = g.groundTopY;

    let fallY = g.blockStartY;
    let fallVy = 0;
    let fallLastNow = performance.now();
    let holdTimer: number | null = null;

    if (blockRef.current) {
      blockRef.current.style.left = `${x}px`;
      blockRef.current.style.top = `${g.blockStartY}px`;
    }

    function runInsertPhase() {
      const insertDistance = seatedTopY - contactTopY;
      const insertDuration = Math.max(
        420,
        fallSeatDurationMs(insertDistance) * 0.55,
      );
      const insertStart = performance.now();

      function insertTick() {
        const t = (performance.now() - insertStart) / insertDuration;
        const p = fallSeatEase(t);
        const y = contactTopY + insertDistance * p;

        if (blockRef.current) {
          blockRef.current.style.top = `${y}px`;
          blockRef.current.style.left = `${x}px`;
        }
        updateFallCamera(y, g.groundHeight);
        updateViewportGuides(x, y, g);

        if (t < 1) {
          fallRafRef.current = requestAnimationFrame(insertTick);
        } else {
          fallRafRef.current = null;
          if (blockRef.current) {
            blockRef.current.style.top = `${seatedTopY}px`;
            blockRef.current.style.left = `${g.gapX}px`;
          }
          beginSuccessMerge(x, g, phaseMsAtDrop, periodMsAtDrop);
        }
      }

      fallRafRef.current = requestAnimationFrame(insertTick);
    }

    function afterImpactHold() {
      setImpactHolding(false);
      if (depleted) {
        settleLifeDeplete(x, g, phaseMsAtDrop, periodMsAtDrop, contactTopY);
        return;
      }
      if (!success) {
        settleFail(x, g, phaseMsAtDrop, periodMsAtDrop, contactTopY);
        return;
      }
      runInsertPhase();
    }

    function onContact() {
      fallY = contactTopY;
      if (blockRef.current) {
        blockRef.current.style.top = `${contactTopY}px`;
        blockRef.current.style.left = `${x}px`;
      }
      updateFallCamera(fallY, g.groundHeight);
      updateViewportGuides(x, fallY, g);
      fallRafRef.current = null;

      const hold =
        shouldHoldAtImpact(absErrorPx, tolerancePx, success) ||
        (depleted && shouldDelayFailResult(absErrorPx, tolerancePx));
      if (hold) {
        setImpactHolding(true);
        holdTimer = window.setTimeout(afterImpactHold, IMPACT_HOLD_MS);
        return;
      }
      afterImpactHold();
    }

    function fallTick() {
      const now = performance.now();
      const dt = now - fallLastNow;
      fallLastNow = now;

      const stepped = stepFallMotion(fallY, fallVy, dt);
      fallY = stepped.y;
      fallVy = stepped.vy;

      if (fallY >= contactTopY) {
        onContact();
        return;
      }

      if (blockRef.current) {
        blockRef.current.style.top = `${fallY}px`;
        blockRef.current.style.left = `${x}px`;
      }
      updateFallCamera(fallY, g.groundHeight);
      updateViewportGuides(x, fallY, g);

      fallRafRef.current = requestAnimationFrame(fallTick);
    }

    fallRafRef.current = requestAnimationFrame(fallTick);
    return () => {
      if (fallRafRef.current !== null) {
        cancelAnimationFrame(fallRafRef.current);
        fallRafRef.current = null;
      }
      if (holdTimer !== null) {
        window.clearTimeout(holdTimer);
        holdTimer = null;
      }
    };
  }, [
    phase,
    tolerancePx,
    lifePt,
    updateFallCamera,
    updateViewportGuides,
    settleFail,
    settleLifeDeplete,
    beginSuccessMerge,
  ]);

  const startFall = useCallback(() => {
    if (phaseRef.current !== "patrolling" || playBlockedRef.current) return;
    const g = geometryRef.current;
    const clock = patrolClockRef.current;
    if (!g || !clock) return;

    // DROP直前にもう一度位相を進め、表示位置と判定位置を一致させる
    const now = performance.now();
    const dt = now - clock.lastNow;
    clock.lastNow = now;
    advancePatrolSpeedState(clock, dt, basePeriodMsRef.current);

    const phaseMsAtDrop = clock.phaseMs;
    const periodMsAtDrop = clock.periodMs;
    const x = triangleWave(phaseMsAtDrop, periodMsAtDrop, g.maxX);

    // DROP瞬間のカメラ位置をロック（この時点ではスクロールしない）
    cameraFollowRef.current = {
      active: false,
      scrollAtDrop: window.scrollY,
    };

    dropPayloadRef.current = {
      x,
      phaseMsAtDrop,
      periodMsAtDrop,
      geometry: g,
    };
    setLockedX(x);
    phaseRef.current = "falling";
    setPhase("falling");
  }, []);

  // スペースキーで DROP
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" && e.key !== " ") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (phaseRef.current !== "patrolling" || playBlockedRef.current) return;
      e.preventDefault();

      const now = performance.now();
      const verdict = evaluateKeyAntiCheat(
        now,
        lastKeyDropMsRef.current,
        e.isTrusted,
      );
      if (!verdict.ok) {
        triggerLockdown();
        return;
      }
      lastKeyDropMsRef.current = now;
      startFall();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [startFall, triggerLockdown]);

  /** スマホ：1本指＝DROP、2本指＝縦スクロール。マウスは従来どおり押下で DROP */
  useEffect(() => {
    const el = playSurfaceRef.current;
    if (!el) return;

    function tryDropFromPointer(clientX: number, clientY: number, isTrusted: boolean) {
      if (phaseRef.current !== "patrolling" || playBlockedRef.current) return;
      const sample = {
        x: clientX,
        y: clientY,
        t: performance.now(),
      };
      const verdict = evaluatePointerAntiCheat(
        sample,
        pointerHistoryRef.current,
        isTrusted,
      );
      if (!verdict.ok) {
        triggerLockdown();
        return;
      }
      pushPointerSample(pointerHistoryRef.current, sample);
      startFall();
    }

    function onPointerDown(e: PointerEvent) {
      if (isPlaySurfaceInteractiveTarget(e.target)) return;

      const map = activePointersRef.current;
      map.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.pointerType === "touch") {
        if (map.size === 1) {
          touchGestureRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startT: performance.now(),
            multiTouch: false,
          };
        } else if (map.size >= 2) {
          if (touchGestureRef.current) {
            touchGestureRef.current.multiTouch = true;
          }
          lastTwoFingerCentroidYRef.current = pointerCentroidY(map);
        }
        e.preventDefault();
        return;
      }

      if (phaseRef.current !== "patrolling" || playBlockedRef.current) return;
      e.preventDefault();
      tryDropFromPointer(e.clientX, e.clientY, e.isTrusted);
    }

    function onPointerMove(e: PointerEvent) {
      const map = activePointersRef.current;
      const prev = map.get(e.pointerId);
      if (!prev) return;
      map.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (e.pointerType !== "touch") return;

      if (map.size >= 2) {
        e.preventDefault();
        const cy = pointerCentroidY(map);
        const lastY = lastTwoFingerCentroidYRef.current;
        if (cy !== null && lastY !== null) {
          window.scrollBy({ top: lastY - cy, left: 0, behavior: "auto" });
        }
        lastTwoFingerCentroidYRef.current = cy;
        return;
      }

      if (map.size === 1) {
        e.preventDefault();
      }
    }

    function releasePointer(e: PointerEvent) {
      const map = activePointersRef.current;
      map.delete(e.pointerId);

      if (e.pointerType === "touch") {
        if (map.size >= 2) {
          lastTwoFingerCentroidYRef.current = pointerCentroidY(map);
        } else {
          lastTwoFingerCentroidYRef.current = null;
        }

        if (map.size === 0) {
          const g = touchGestureRef.current;
          touchGestureRef.current = null;
          if (
            g &&
            !g.multiTouch &&
            phaseRef.current === "patrolling" &&
            !playBlockedRef.current
          ) {
            const dx = e.clientX - g.startX;
            const dy = e.clientY - g.startY;
            const dist = Math.hypot(dx, dy);
            const dt = performance.now() - g.startT;
            if (dist <= TOUCH_DROP_MAX_MOVE_PX && dt <= TOUCH_DROP_MAX_MS) {
              tryDropFromPointer(e.clientX, e.clientY, e.isTrusted);
            }
          }
        }
        return;
      }

      if (map.size === 0) {
        lastTwoFingerCentroidYRef.current = null;
      }
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", releasePointer);
    el.addEventListener("pointercancel", releasePointer);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", releasePointer);
      el.removeEventListener("pointercancel", releasePointer);
    };
  }, [startFall, triggerLockdown]);

  useEffect(() => {
    return () => {
      if (patrolRafRef.current !== null) cancelAnimationFrame(patrolRafRef.current);
      if (fallRafRef.current !== null) cancelAnimationFrame(fallRafRef.current);
      if (failResultTimerRef.current !== null) {
        window.clearTimeout(failResultTimerRef.current);
        failResultTimerRef.current = null;
      }
      if (lockdownTimerRef.current !== null) {
        window.clearTimeout(lockdownTimerRef.current);
        lockdownTimerRef.current = null;
      }
    };
  }, []);

  const g = geometry;
  const showBlock =
    phase === "patrolling" ||
    phase === "falling" ||
    phase === "merging" ||
    phase === "success";
  const showSeams = !merging && phase !== "success";

  const stageTheme = useMemo(() => stageThemeStyle(stage), [stage]);

  return (
    <div
      ref={playSurfaceRef}
      className="pxd-play-surface relative w-full"
      style={stageTheme}
    >
      {lockdown ? (
        <div
          className="pxd-anticheat-lock fixed inset-0 z-[90] flex items-center justify-center p-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="pxd-anticheat-lock__text max-w-xl text-center font-mono text-[11px] font-bold tracking-[0.08em] text-red-500 sm:text-sm">
            {copy.anticheat.warning}
          </p>
        </div>
      ) : null}
      {/* 画面外上方の棒X位置ガイド（ヘッダー下に表示・文字なし） */}
      <div
        ref={guideRef}
        className="pxd-block-guide pointer-events-none fixed z-40"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden
      >
        <div className="pxd-block-guide__cap" />
        <div className="pxd-block-guide__stem" />
      </div>

      {/* 盤面が画面下に隠れているとき：下辺アシスト（上辺ライン＋溝位置） */}
      <div
        ref={groundGuideRef}
        className="pxd-ground-guide pointer-events-none fixed z-40"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden
      >
        <div className="pxd-ground-guide__rail" />
        <div data-pxd-ground-gap className="pxd-ground-guide__gap" />
      </div>

      {/* 記録：ビューポート中央固定＋盤面左右余白（スクロール追従） */}
      {g && !judge ? (
        <RecordsSideRails
          copy={copy}
          boundsRef={stageRef}
          boardAnchorRef={columnRef}
          stage={stage}
          tolerancePx={tolerancePx}
          lifePt={lifePt}
          nearHitStreak={nearHitStreak}
          lifeRecoveredAtMs={lifeRecoveredAtMs}
          records={records}
          changeImageControl={changeImageControl}
          onResetProgress={onResetProgress}
          usingDefaultImage={usingDefaultImage}
          onRestoreDefaultImage={onRestoreDefaultImage}
        />
      ) : null}

      {/* 縦長ステージ本体（DROP：1本指タップ／クリック／Space・スクロール：2本指） */}
      <div
        ref={stageRef}
        className="pxd-stage relative w-full select-none"
        style={{ height: g?.stageHeight ?? "260vh", minHeight: "260vh" }}
        role="presentation"
      >
        {/* 1px単位の極薄デジタルグリッド */}
        <div className="pxd-grid pointer-events-none absolute inset-0" aria-hidden />

        {/* 棒と地表を同じ座標系に載せるカラム（適度な幅で中央寄せ） */}
        <div
          ref={columnRef}
          className="relative mx-auto h-full"
          style={{ width: g?.width ? `${g.width}px` : "100%", maxWidth: `${MAX_BOARD_WIDTH}px` }}
        >
          {g ? (
            <>
              {/* 地表：グリッドの上に左右ピースだけ貼り付け、溝は透過 */}
              <div
                className={`pxd-ground absolute left-0 ${
                  merging || phase === "success" ? "pxd-ground--merged" : ""
                } ${successFx === "sweep" ? "pxd-ground--celebrate" : ""}`}
                style={{
                  top: g.groundTopY,
                  width: g.width,
                  height: g.groundHeight,
                }}
                aria-hidden
              >
                <div
                  className={`absolute left-0 top-0 overflow-hidden ${
                    showSeams
                      ? "border border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
                      : ""
                  }`}
                  style={{
                    width: g.gapX,
                    height: g.groundHeight,
                    backgroundImage: `url(${imageDataUrl})`,
                    backgroundSize: `${g.width}px ${g.groundHeight}px`,
                    backgroundPosition: "0px 0px",
                    backgroundRepeat: "no-repeat",
                    opacity: merging || phase === "success" ? 0 : 1,
                    transition: `opacity ${MERGE_DURATION_MS}ms ease`,
                  }}
                />
                <div
                  className={`absolute top-0 overflow-hidden ${
                    showSeams
                      ? "border border-zinc-800 shadow-[0_0_40px_rgba(0,0,0,0.45)]"
                      : ""
                  }`}
                  style={{
                    left: g.gapX + g.gapWidth,
                    width: g.width - g.gapX - g.gapWidth,
                    height: g.groundHeight,
                    backgroundImage: `url(${imageDataUrl})`,
                    backgroundSize: `${g.width}px ${g.groundHeight}px`,
                    backgroundPosition: `${-(g.gapX + g.gapWidth)}px 0px`,
                    backgroundRepeat: "no-repeat",
                    opacity: merging || phase === "success" ? 0 : 1,
                    transition: `opacity ${MERGE_DURATION_MS}ms ease`,
                  }}
                />
                {/* 溝：背景色なし（ステージのグリッドが見える）。端だけ薄い影 */}
                <div
                  className={`pxd-ground-gap absolute top-0 ${
                    showSeams ? "pxd-ground-gap--open" : ""
                  }`}
                  style={{
                    left: g.gapX,
                    width: g.gapWidth,
                    height: g.groundHeight,
                    opacity: merging || phase === "success" ? 0 : 1,
                    transition: `opacity ${MERGE_DURATION_MS}ms ease`,
                  }}
                />

                {/* 完成した1枚絵（成功時にじわっと浮かび上がる） */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${imageDataUrl})`,
                    backgroundSize: `${g.width}px ${g.groundHeight}px`,
                    backgroundPosition: "0px 0px",
                    backgroundRepeat: "no-repeat",
                    opacity: merging || phase === "success" ? 1 : 0,
                    transition: `opacity ${MERGE_DURATION_MS}ms ease`,
                  }}
                />

                {/* 縁を光が一周する（完璧ハマり後） */}
                {(successFx === "sweep" || successFx === "done") && (
                  <div
                    className={`pxd-success-ring ${
                      successFx === "sweep" ? "pxd-success-ring--active" : ""
                    }`}
                  >
                    <div className="pxd-success-ring__spin" aria-hidden />
                  </div>
                )}
              </div>

              {/* 落ちる棒：画像中央帯を切り出した縦長長方形 */}
              {showBlock ? (
                <div
                  ref={blockRef}
                  className={`absolute z-10 ${
                    merging || phase === "success" ? "pxd-block--merged" : ""
                  } ${impactHolding ? "pxd-block--impact-hold" : ""}`}
                  style={{
                    left:
                      phase === "merging" || phase === "success"
                        ? g.gapX
                        : undefined,
                    top:
                      phase === "merging" || phase === "success"
                        ? g.groundTopY
                        : g.blockStartY,
                    width: g.gapWidth,
                    height: g.groundHeight,
                    backgroundImage: `url(${imageDataUrl})`,
                    backgroundSize: `${g.width}px ${g.groundHeight}px`,
                    backgroundPosition: `${-g.gapX}px 0px`,
                    backgroundRepeat: "no-repeat",
                    opacity: merging || phase === "success" ? 0 : 1,
                    transition: `opacity ${MERGE_DURATION_MS}ms ease, box-shadow ${MERGE_DURATION_MS}ms ease`,
                    boxShadow:
                      merging || phase === "success"
                        ? "none"
                        : phase === "patrolling"
                          ? "0 0 0 1px rgb(var(--pxd-accent-rgb) / 0.35), 0 8px 28px rgba(0,0,0,0.55)"
                          : "0 0 0 1px rgba(0,0,0,0.8), 0 12px 32px rgba(0,0,0,0.65)",
                  }}
                  aria-hidden
                />
              ) : null}

              {phase === "fail" || phase === "depleted" ? (
                <ParticleBurst
                  imageDataUrl={imageDataUrl}
                  bgWidth={g.width}
                  bgHeight={g.groundHeight}
                  bgOffsetX={g.gapX}
                  left={lockedX}
                  top={impactY}
                  width={g.gapWidth}
                  height={g.groundHeight}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {judge?.lifeDepleted ? (
        <LifeDepletedOverlay
          copy={copy.deplete}
          fromStage={depleteFromStage}
          toStage={Math.max(1, depleteFromStage - 1)}
          onContinue={onRetry}
        />
      ) : judge ? (
        <ResultOverlay
          judge={judge}
          stage={stage}
          copy={copy}
          imageDataUrl={imageDataUrl}
          onRetry={onRetry}
          onNext={onNext}
        />
      ) : null}

      <ImageChangeOverlay
        open={imageChangeOpen}
        copy={copy.upload}
        themeStyle={stageTheme}
        usingDefaultImage={usingDefaultImage}
        onClose={() => setImageChangeOpen(false)}
        onConfirm={(image) => {
          setImageChangeOpen(false);
          onImageChange(image);
        }}
        onRestoreDefault={() => {
          setImageChangeOpen(false);
          onRestoreDefaultImage();
        }}
      />
    </div>
  );
}
