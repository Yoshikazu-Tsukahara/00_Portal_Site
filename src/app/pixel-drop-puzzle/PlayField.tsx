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
  COMPACT_HUD_RESERVE_PX,
  computeGeometry,
  fallSeatDurationMs,
  fallSeatEase,
  PATROL_MAX_DT_MS,
  stepFallMotion,
  idealStopTimeDeltaMs,
  MAX_BOARD_WIDTH,
  periodMsForPatrolSpeedLevel,
  randomPatrolPhaseMs,
  samplePatrolAt,
  triangleWave,
  type PatrolClockState,
  type PlayGeometry,
} from "./engine";
import { useCompactLayout } from "@/lib/useCompactLayout";
import type { LoadedGameImage } from "./imageUtil";
import ImageChangeOverlay from "./ImageChangeOverlay";
import LifeDepletedOverlay from "./LifeDepletedOverlay";
import ParticleBurst from "./ParticleBurst";
import RecordsSideRails from "./RecordsSideRails";
import ResultOverlay from "./ResultOverlay";
import {
  getScrollParent,
  getScrollTop,
  setScrollTop,
} from "./scrollParent";
import UploadGate from "./UploadGate";
import {
  ANTI_CHEAT_LOCKDOWN_MS,
  evaluateKeyAntiCheat,
  evaluatePointerAntiCheat,
  pushPointerSample,
  type PointerSample,
} from "./antiCheat";
import {
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
type PatrolClock = PatrolClockState;

/** 成功時に枠・溝が溶けて1枚絵になる演出の長さ（ms）＝ガシャン＆溶解 */
const SUCCESS_MERGE_MS = 750;
/** 縁を光が一周する時間（ms） */
const SUCCESS_SWEEP_MS = 1300;
/** 縁光一周後のシャインスイープ時間（ms）。全面フラッシュは使わない */
const SUCCESS_SHINE_MS = 720;

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
      "button, a, input, label, textarea, select, [role='dialog'], [data-pxd-no-drop]",
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

type SuccessFx = "idle" | "merge" | "sweep" | "shine" | "done";

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
  failLifeBonusPt,
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
  /** 失敗リザルトに表示するコンボボーナス（pt） */
  failLifeBonusPt: number | null;
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
  /** 粉砕演出完了後に出す失敗ジャッジ（タイマーではなく ParticleBurst.onComplete 待ち） */
  const pendingFailResultRef = useRef<JudgeResult | null>(null);
  /** 粉砕中は親へ渡さず、完了後に记忆（初回 null→値 でカメラ復元 effect が粉砕を潰すのを防ぐ） */
  const pendingFailScrollRef = useRef<number | null>(null);
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

  const { compact: shellCompact } = useCompactLayout();
  /** 落下 rAF 中に identity が変わると演出が巻き戻るのを防ぐ */
  const shellCompactRef = useRef(shellCompact);
  shellCompactRef.current = shellCompact;
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
  /** 成功セレブレーション段階（溶解→縁光一周→シャインスイープ→リザルト） */
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

  // 粉砕用ビットマップを先に温め、初回失敗時のデコード待ちを減らす
  useEffect(() => {
    const img = new Image();
    img.src = imageDataUrl;
    void img.decode?.().catch(() => undefined);
  }, [imageDataUrl]);

  // ステージ幅いっぱいでジオメトリを再計算（compact 時は HUD 分だけ棒を下げる）
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function measure() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = computeGeometry(rect.width, naturalWidth, naturalHeight, {
        compactHud: shellCompactRef.current,
      });
      // 落下〜リザルト中に寸法が変わると着地／粉砕位置がズレるのでロックする
      setGeometry((prev) => {
        const phaseNow = phaseRef.current;
        const lockGeometry =
          phaseNow === "falling" ||
          phaseNow === "merging" ||
          phaseNow === "fail" ||
          phaseNow === "depleted" ||
          phaseNow === "success";
        const applied = prev && lockGeometry ? prev : next;
        geometryRef.current = applied;
        return applied;
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [naturalWidth, naturalHeight, shellCompact]);

  // ラウンド開始時のカメラ（patrolling のときだけ）。
  // 失敗確定で restoreScrollY が null→値になると粉砕中にここが走り、
  // 初回だけ演出が消える／見えない原因になっていた。
  useLayoutEffect(() => {
    if (!geometry || !stageRef.current) return;
    if (phaseRef.current !== "patrolling") return;
    const scroller = getScrollParent(stageRef.current);
    if (restoreScrollY !== null) {
      setScrollTop(scroller, restoreScrollY);
      return;
    }
    const stageTop = stageRef.current.getBoundingClientRect().top;
    const current = getScrollTop(scroller);
    setScrollTop(scroller, current + stageTop - 80);
  }, [geometry, restoreScrollY]);

  /**
   * 落下中のカメラ更新。
   * - STOP直後はカメラを一切動かさない
   * - 棒がビューポート中央付近まで降りてきてから、はじめて一緒に追従スクロール
   * - compact 時は棒上の HUD が画面上端ではみ出さないよう注視点を下げ、
   *   スクロール上限も HUD 高さ分だけ抑える
   * - deps を空に保ち、落下 useLayoutEffect の途中再起動を防ぐ
   */
  const updateFallCamera = useCallback(
    (blockTopInStage: number, blockHeight: number) => {
      const stageEl = stageRef.current;
      if (!stageEl) return;

      const compact = shellCompactRef.current;
      const scroller = getScrollParent(stageEl);
      const scrollTop = getScrollTop(scroller);
      const stageViewTop = stageEl.getBoundingClientRect().top;
      // scroller 内容座標でのステージ上端
      const stageContentTop =
        scroller instanceof HTMLElement
          ? stageViewTop + scrollTop - scroller.getBoundingClientRect().top
          : stageViewTop + window.scrollY;
      const viewH =
        scroller instanceof HTMLElement
          ? scroller.clientHeight
          : window.innerHeight;
      // compact：HUD 分の余白を確保するため注視点を下げる
      const focusRatio = compact ? 0.58 : 0.42;
      const blockFocusOffset = compact ? blockHeight * 0.18 : blockHeight * 0.28;
      const focusContentY = stageContentTop + blockTopInStage + blockFocusOffset;
      const viewCenterContentY = scrollTop + viewH * focusRatio;

      if (!cameraFollowRef.current.active) {
        // 棒がまだカメラ中央より上 → カメラはそのまま待機
        if (focusContentY < viewCenterContentY) return;
        cameraFollowRef.current.active = true;
      }

      let target = focusContentY - viewH * focusRatio;
      if (compact) {
        // 棒上端 − HUD 予約が画面内に残るよう、追従スクロールを抑える
        const maxScrollKeepHud =
          stageContentTop + blockTopInStage - COMPACT_HUD_RESERVE_PX - 8;
        target = Math.min(target, maxScrollKeepHud);
      }
      setScrollTop(scroller, target);
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

  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  const finalizeFailResult = useCallback((result: JudgeResult) => {
    setJudge(result);
    onSettledRef.current(result);
  }, []);

  /** ParticleBurst 完了 → スクロール位置を親へ渡してからリザルト */
  const handleBurstComplete = useCallback(() => {
    const result = pendingFailResultRef.current;
    if (!result) return;
    pendingFailResultRef.current = null;
    const scrollY = pendingFailScrollRef.current;
    pendingFailScrollRef.current = null;
    if (scrollY !== null) {
      onRememberFailScroll(scrollY);
    }
    finalizeFailResult(result);
  }, [finalizeFailResult, onRememberFailScroll]);

  /** 失敗を確定（粉砕中は親の restoreScrollY を更新しない） */
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

      pendingFailScrollRef.current = cameraFollowRef.current.scrollAtDrop;
      pendingFailResultRef.current = result;
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
    },
    [presentFail],
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

      pendingFailScrollRef.current = cameraFollowRef.current.scrollAtDrop;
      setDepleteFromStage(stage);
      pendingFailResultRef.current = result;
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
    },
    [presentFail, stage],
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
    const scroller = getScrollParent(stageRef.current);
    const lockedY = getScrollTop(scroller);
    function lockScroll() {
      if (getScrollTop(scroller) !== lockedY) {
        setScrollTop(scroller, lockedY);
      }
    }
    const target: EventTarget = scroller === window ? window : scroller;
    target.addEventListener("scroll", lockScroll, { passive: true });
    return () => target.removeEventListener("scroll", lockScroll);
  }, [judge]);

  // 成功セレブレーション：溶解 → 縁光一周 → シャインスイープ → リザルト
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

    timers.push(
      window.setTimeout(() => {
        setSuccessFx("shine");
      }, SUCCESS_MERGE_MS + SUCCESS_SWEEP_MS),
    );

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
        onSettledRef.current(result);
      }, SUCCESS_MERGE_MS + SUCCESS_SWEEP_MS + SUCCESS_SHINE_MS),
    );

    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [phase, tolerancePx, lifePt]);

  // 棒の left/top は React 管理外のため、geometry 確定時に位置を載せる
  useLayoutEffect(() => {
    if (phase !== "patrolling" || playBlocked || !geometry) return;
    const block = blockRef.current;
    if (!block) return;
    const clock = patrolClockRef.current;
    const periodMs =
      clock?.periodMs ??
      periodMsForPatrolSpeedLevel(basePeriodMsRef.current, 1);
    const phaseMs = clock?.phaseMs ?? 0;
    const x = triangleWave(phaseMs, periodMs, geometry.maxX);
    block.style.left = `${x}px`;
    block.style.top = `${geometry.blockStartY}px`;
  }, [phase, playBlocked, geometry]);

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

    // React は left/top を触らないので、rAF 前に初回位置を載せる
    if (g && blockRef.current) {
      const x0 = triangleWave(phaseMs, periodMs, g.maxX);
      blockRef.current.style.left = `${x0}px`;
      blockRef.current.style.top = `${g.blockStartY}px`;
    }

    function tick() {
      const gNow = geometryRef.current;
      const clock = patrolClockRef.current;
      if (
        gNow &&
        clock &&
        blockRef.current &&
        phaseRef.current === "patrolling"
      ) {
        const nowTick = performance.now();
        const dt = Math.min(
          Math.max(0, nowTick - clock.lastNow),
          PATROL_MAX_DT_MS,
        );
        // 落下と同様、lastNow は壁時計にスナップする（タブ復帰時の追い込みを防ぐ）。
        // STOP 判定の精度は samplePatrolAt が atNowMs - lastNow で担保する。
        advancePatrolSpeedState(
          clock,
          dt,
          basePeriodMsRef.current,
          null,
        );
        clock.lastNow = nowTick;

        const x = triangleWave(clock.phaseMs, clock.periodMs, gNow.maxX);
        blockRef.current.style.left = `${x}px`;
        blockRef.current.style.top = `${gNow.blockStartY}px`;
        updateViewportGuides(x, gNow.blockStartY, gNow);
      }
      patrolRafRef.current = requestAnimationFrame(tick);
    }

    /** タブ非表示／復帰時に時計基準をリセットし、隠れていた時間を位相に反映しない */
    function onVisibilityChange() {
      const clock = patrolClockRef.current;
      if (!clock || phaseRef.current !== "patrolling") return;
      clock.lastNow = performance.now();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    patrolRafRef.current = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
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

  // 落下演出から呼ぶ確定処理（identity 変化で落下 effect を再起動させない）
  const settleFailRef = useRef(settleFail);
  settleFailRef.current = settleFail;
  const settleLifeDepleteRef = useRef(settleLifeDeplete);
  settleLifeDepleteRef.current = settleLifeDeplete;
  const beginSuccessMergeRef = useRef(beginSuccessMerge);
  beginSuccessMergeRef.current = beginSuccessMerge;
  const lifePtRef = useRef(lifePt);
  lifePtRef.current = lifePt;
  const tolerancePxRef = useRef(tolerancePx);
  tolerancePxRef.current = tolerancePx;

  /**
   * 落下演出:
   * 1) 上空 → 地表上端に棒の下端が触れるまで落下
   * 2a) ずれている → 惜しい時は溜めてから粒子化→失敗リザルト
   * 2b) 成功 → 惜しい時は溜めてから隙間へゆっくりハマる
   *
   * deps は phase のみ。途中再起動すると棒が開始位置へ巻き戻る。
   */
  useLayoutEffect(() => {
    if (phase !== "falling") return;
    const payload = dropPayloadRef.current;
    if (!payload) return;

    const { x, phaseMsAtDrop, periodMsAtDrop, geometry: g } = payload;
    const lifeAtDrop = lifePtRef.current;
    const tolAtDrop = tolerancePxRef.current;
    const absErrorPx = Math.abs(x - g.gapX);
    const outcome = resolveDropOutcome(lifeAtDrop, absErrorPx, tolAtDrop);
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
          beginSuccessMergeRef.current(x, g, phaseMsAtDrop, periodMsAtDrop);
        }
      }

      fallRafRef.current = requestAnimationFrame(insertTick);
    }

    function afterImpactHold() {
      setImpactHolding(false);
      if (depleted) {
        settleLifeDepleteRef.current(
          x,
          g,
          phaseMsAtDrop,
          periodMsAtDrop,
          contactTopY,
        );
        return;
      }
      if (!success) {
        settleFailRef.current(x, g, phaseMsAtDrop, periodMsAtDrop, contactTopY);
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
        shouldHoldAtImpact(absErrorPx, tolAtDrop, success) ||
        (depleted && shouldDelayFailResult(absErrorPx, tolAtDrop));
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
  }, [phase, updateFallCamera, updateViewportGuides]);

  const startFall = useCallback(() => {
    if (phaseRef.current !== "patrolling" || playBlockedRef.current) return;
    const g = geometryRef.current;
    const clock = patrolClockRef.current;
    if (!g || !clock) return;

    // STOP 瞬間の高精度タイムスタンプから、連続関数で理論Xを逆算する。
    // DOM の見た目（フレーム量子化）は使わず、詰み（飛び越え不能）を防ぐ。
    const stopNow = performance.now();
    const sampled = samplePatrolAt(
      clock,
      stopNow,
      basePeriodMsRef.current,
      g.maxX,
    );
    clock.periodMs = sampled.periodMs;
    clock.phaseMs = sampled.phaseMs;
    clock.completedTrips = sampled.completedTrips;
    clock.speedLevel = sampled.speedLevel;
    clock.lastNow = sampled.lastNow;

    const phaseMsAtDrop = sampled.phaseMs;
    const periodMsAtDrop = sampled.periodMs;
    const x = sampled.x;

    // DROP瞬間のカメラ位置をロック（この時点ではスクロールしない）
    const scroller = getScrollParent(stageRef.current);
    cameraFollowRef.current = {
      active: false,
      scrollAtDrop: getScrollTop(scroller),
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
          const scroller = getScrollParent(stageRef.current);
          const delta = lastY - cy;
          if (scroller instanceof HTMLElement) {
            scroller.scrollTop += delta;
          } else {
            window.scrollBy({ top: delta, left: 0, behavior: "auto" });
          }
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
      pendingFailResultRef.current = null;
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
          blockRef={blockRef}
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
                } ${
                  successFx === "sweep" || successFx === "shine"
                    ? "pxd-ground--celebrate"
                    : ""
                }`}
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
                {(successFx === "sweep" ||
                  successFx === "shine" ||
                  successFx === "done") && (
                  <div
                    className={`pxd-success-ring ${
                      successFx === "sweep" ? "pxd-success-ring--active" : ""
                    }`}
                  >
                    <div className="pxd-success-ring__spin" aria-hidden />
                  </div>
                )}

                {/* 縁光一周後：斜めシャインスイープのみ（全面フラッシュなし） */}
                {successFx === "shine" || successFx === "done" ? (
                  <div
                    className={`pxd-success-shine ${
                      successFx === "shine" ? "pxd-success-shine--active" : ""
                    }`}
                    aria-hidden
                  />
                ) : null}
              </div>

              {/* 落ちる棒：画像中央帯を切り出した縦長長方形
                  patrolling/falling 中の left/top は rAF が DOM 直書きする。
                  React が top: blockStartY を渡すと着地溜め再レンダーで上空へ巻き戻る */}
              {showBlock ? (
                <div
                  ref={blockRef}
                  className={`absolute z-10 ${
                    merging || phase === "success" ? "pxd-block--merged" : ""
                  } ${impactHolding ? "pxd-block--impact-hold" : ""}`}
                  style={{
                    ...(phase === "merging" || phase === "success"
                      ? { left: g.gapX, top: g.groundTopY }
                      : {}),
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
                  key={`burst-${lockedX.toFixed(3)}-${impactY.toFixed(1)}`}
                  imageDataUrl={imageDataUrl}
                  bgWidth={g.width}
                  bgHeight={g.groundHeight}
                  bgOffsetX={g.gapX}
                  left={lockedX}
                  top={impactY}
                  width={g.gapWidth}
                  height={g.groundHeight}
                  onComplete={handleBurstComplete}
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
          lifeBonusPt={failLifeBonusPt}
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
