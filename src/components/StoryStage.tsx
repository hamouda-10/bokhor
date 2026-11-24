import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Lenis from 'lenis';
import {
  ASSET_URLS,
  FLOWER_CROPS,
  SPRITES,
  getSpriteBgStyle,
  loadImage,
  renderFunnelKeyedCanvas,
  renderWhiteKeyedCanvas,
  type SpriteId,
} from '../data/emberleafAssets';
import {
  buildStates,
  computeFrame,
  figmaEaseOut,
  interpolateStates,
  type FrameMetrics,
  type SpriteTransform,
  type StoryState,
  type TextTransform,
} from '../engine/storyStates';
import { PERFUMES, formatUsd, type PerfumeProduct } from '../data/perfumes';

export interface StoryStageHandle {
  jumpToState: (targetState: number) => void;
  getFrameMetrics: () => FrameMetrics;
}

interface StoryStageProps {
  active: boolean;
  navBottomPx: number;
  onFrameMetrics: (metrics: FrameMetrics) => void;
  onReadyChange: (ready: boolean) => void;
  onSelectPerfume: (perfume: PerfumeProduct) => void;
  onOpenShop: () => void;
}

const INGREDIENT_IDS = ['i_rose', 'i_tea', 'i_peel', 'i_cassia', 'i_amber', 'i_card'] as const;
const LABEL_ENTRIES = [
  { id: 't_rose', text: 'الورد' },
  { id: 't_tea', text: 'الشاي الأسود' },
  { id: 't_peel', text: 'قشر البرتقال' },
  { id: 't_cassia', text: 'القرفة' },
  { id: 't_amber', text: 'العنبر' },
  { id: 't_card', text: 'الهيل' },
] as const;

const STATE_NAMES = [
  'تلال الخريف',
  'المكونات الستة',
  'التجمّع العطري',
  'الخلطات',
  'القطرة الذهبية',
  'القارورة الطينية',
  'الختم الخزفي',
  'التشكيلة الكاملة',
];

export const StoryStage = forwardRef<StoryStageHandle, StoryStageProps>(function StoryStage(
  { active, navBottomPx, onFrameMetrics, onReadyChange, onSelectPerfume, onOpenShop },
  ref
) {
  const [ready, setReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showState7Ui, setShowState7Ui] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState<'left' | 'middle' | 'right' | null>(null);
  const [frameState, setFrameState] = useState<FrameMetrics>(() =>
    computeFrame(
      typeof window !== 'undefined' ? window.innerWidth : 1440,
      typeof window !== 'undefined' ? window.innerHeight : 900
    )
  );

  // Refs for DOM layers updated directly at 60-120fps
  const trackRef = useRef<HTMLDivElement>(null);
  const bgFieldRef = useRef<HTMLDivElement>(null);
  const bgProdRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const blendsRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const dunesCanvasRef = useRef<HTMLCanvasElement>(null);
  const flLCanvasRef = useRef<HTMLCanvasElement>(null);
  const flRCanvasRef = useRef<HTMLCanvasElement>(null);
  const funnelWrapRef = useRef<HTMLDivElement>(null);
  const funnelCanvasRef = useRef<HTMLCanvasElement>(null);

  const spriteRefs = useRef<Partial<Record<SpriteId, HTMLDivElement | null>>>({});
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Runtime engine refs
  const frameRef = useRef<FrameMetrics>(frameState);
  const statesRef = useRef<StoryState[]>(buildStates(frameState, navBottomPx));
  const stepPxRef = useRef<number>(
    typeof window !== 'undefined' ? Math.max(320, window.innerHeight) : 900
  );
  const lastWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const progressRef = useRef<number>(0);
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotionRef = useRef<boolean>(false);
  const activeRef = useRef<boolean>(active);
  const navBottomRef = useRef<number>(navBottomPx);

  // Story product references for State 7 clickable vessels
  const leftPerfume = PERFUMES.find((p) => p.storySlot === 'left') ?? PERFUMES[1];
  const midPerfume = PERFUMES.find((p) => p.storySlot === 'middle') ?? PERFUMES[0];
  const rightPerfume = PERFUMES.find((p) => p.storySlot === 'right') ?? PERFUMES[2];

  activeRef.current = active;
  navBottomRef.current = navBottomPx;

  // Apply a single interpolated StoryState directly to DOM layers
  const applyStateToDom = (st: StoryState, f: FrameMetrics) => {
    const { u, ox, oy } = f;

    if (bgFieldRef.current) {
      bgFieldRef.current.style.opacity = st.bgFieldO.toFixed(4);
    }
    if (bgProdRef.current) {
      bgProdRef.current.style.opacity = st.bgProdO.toFixed(4);
    }

    // Headline centred horizontally across the upper sky
    if (headlineRef.current) {
      const hx = ox + st.headline.x * u;
      const hy = oy + st.headline.y * u;
      headlineRef.current.style.transform = `translate3d(${hx.toFixed(2)}px, ${hy.toFixed(2)}px, 0) translate(-50%, -50%)`;
      headlineRef.current.style.opacity = st.headline.o.toFixed(4);
    }

    // BLENDS (centred)
    if (blendsRef.current) {
      const bx = ox + st.blends.x * u;
      const by = oy + st.blends.y * u;
      blendsRef.current.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0) translate(-50%, -50%)`;
      blendsRef.current.style.opacity = st.blends.o.toFixed(4);
    }

    // Wordmark (centred)
    if (markRef.current) {
      const mx = ox + st.mark.x * u;
      const my = oy + st.mark.y * u;
      markRef.current.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0) translate(-50%, -50%)`;
      markRef.current.style.opacity = st.mark.o.toFixed(4);
    }

    // Dunes canvas
    if (dunesCanvasRef.current) {
      const dyPx = f.dunesTopPx + st.dunesDy * u;
      dunesCanvasRef.current.style.transform = `translate3d(0, ${dyPx.toFixed(2)}px, 0)`;
    }

    // Marigold corner canvases
    if (flLCanvasRef.current) {
      const ly = f.flLY + st.flLDy * u;
      flLCanvasRef.current.style.transform = `translate3d(${f.flLX.toFixed(2)}px, ${ly.toFixed(2)}px, 0)`;
    }
    if (flRCanvasRef.current) {
      const ry = f.flRY + st.flRDy * u;
      flRCanvasRef.current.style.transform = `translate3d(${f.flRX.toFixed(2)}px, ${ry.toFixed(2)}px, 0)`;
    }

    // Funnel
    if (funnelWrapRef.current) {
      const fw = f.funW * u;
      const fx = ox + st.funnel.x * u - fw / 2;
      const fy = oy + st.funnel.y * u;
      funnelWrapRef.current.style.transform = `translate3d(${fx.toFixed(2)}px, ${fy.toFixed(2)}px, 0)`;
      funnelWrapRef.current.style.opacity = st.funnel.o.toFixed(4);
    }

    // 400-frame-unit base-box sprites
    const placeSprite = (id: SpriteId, tr: SpriteTransform) => {
      const el = spriteRefs.current[id];
      if (!el) return;
      const spec = SPRITES[id];
      const baseW = 400 * u;
      const baseH = baseW * spec.aspect;
      const px = ox + tr.x * u - baseW / 2;
      const py = oy + tr.y * u - baseH / 2;
      const sc = tr.w / 400;
      const sxVal = spec.mirror ? -sc : sc;
      el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0) rotate(${tr.r.toFixed(3)}deg) scale(${sxVal.toFixed(5)}, ${sc.toFixed(5)})`;
      el.style.opacity = tr.o.toFixed(4);
    };

    placeSprite('i_rose', st.ingr.i_rose);
    placeSprite('i_tea', st.ingr.i_tea);
    placeSprite('i_peel', st.ingr.i_peel);
    placeSprite('i_cassia', st.ingr.i_cassia);
    placeSprite('i_amber', st.ingr.i_amber);
    placeSprite('i_card', st.ingr.i_card);
    placeSprite('drop', st.drop);
    placeSprite('p_l', st.p_l);
    placeSprite('p_m', st.p_m);
    placeSprite('p_r', st.p_r);
    placeSprite('tin_l', st.tin_l);
    placeSprite('tin_m', st.tin_m);
    placeSprite('tin_r', st.tin_r);
    placeSprite('lid_l', st.lid_l);
    placeSprite('lid_m', st.lid_m);
    placeSprite('lid_r', st.lid_r);

    // Ingredient labels
    const placeLabel = (id: string, tr: TextTransform) => {
      const el = labelRefs.current[id];
      if (!el) return;
      const lx = ox + tr.x * u;
      const ly = oy + tr.y * u;
      el.style.transform = `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = tr.o.toFixed(4);
    };

    placeLabel('t_rose', st.labels.t_rose);
    placeLabel('t_tea', st.labels.t_tea);
    placeLabel('t_peel', st.labels.t_peel);
    placeLabel('t_cassia', st.labels.t_cassia);
    placeLabel('t_amber', st.labels.t_amber);
    placeLabel('t_card', st.labels.t_card);
  };

  // Sync static box dimensions for frame
  const applyFrameSizes = (f: FrameMetrics) => {
    const { u } = f;
    if (trackRef.current) {
      trackRef.current.style.height = `${7 * stepPxRef.current + f.vh}px`;
    }
    if (headlineRef.current) {
      const heroFontPx = f.isPort
        ? Math.min(f.vw * 0.165, f.headlineFs * 1.12)
        : Math.min(f.vw * 0.145, f.headlineFs * 1.38);
      headlineRef.current.style.fontSize = `${heroFontPx}px`;
    }
    if (blendsRef.current) {
      blendsRef.current.style.fontSize = `${f.blendsFs * 0.9}px`;
    }
    if (markRef.current) {
      markRef.current.style.fontSize = `${f.markFs}px`;
    }
    if (dunesCanvasRef.current) {
      dunesCanvasRef.current.style.width = `${f.dunesW}px`;
      dunesCanvasRef.current.style.height = `${f.dunesH}px`;
      dunesCanvasRef.current.style.marginLeft = `${-f.dunesW / 2}px`;
    }
    if (flLCanvasRef.current) {
      flLCanvasRef.current.style.width = `${f.flLW}px`;
      flLCanvasRef.current.style.height = `${f.flLH}px`;
    }
    if (flRCanvasRef.current) {
      flRCanvasRef.current.style.width = `${f.flRW}px`;
      flRCanvasRef.current.style.height = `${f.flRH}px`;
    }
    if (funnelWrapRef.current) {
      funnelWrapRef.current.style.width = `${f.funW * u}px`;
      funnelWrapRef.current.style.height = `${f.funH * u}px`;
    }

    (Object.keys(SPRITES) as SpriteId[]).forEach((id) => {
      const el = spriteRefs.current[id];
      if (!el) return;
      const baseW = 400 * u;
      const baseH = baseW * SPRITES[id].aspect;
      el.style.width = `${baseW}px`;
      el.style.height = `${baseH}px`;
    });

    LABEL_ENTRIES.forEach(({ id }) => {
      const el = labelRefs.current[id];
      if (!el) return;
      el.style.fontSize = `${Math.max(14, f.labelFs * 1.15)}px`;
    });
  };

  const jumpToStateInternal = (targetState: number) => {
    const clamped = Math.max(0, Math.min(7, targetState));
    const targetY = clamped * stepPxRef.current;
    const dist = Math.abs(clamped - progressRef.current);

    if (reducedMotionRef.current || !lenisRef.current) {
      window.scrollTo(0, targetY);
      return;
    }

    const duration = Math.min(1.6, Math.max(0.35, dist * 1.0));
    lenisRef.current.scrollTo(targetY, {
      duration,
      easing: figmaEaseOut,
    });
  };

  useImperativeHandle(ref, () => ({
    jumpToState: jumpToStateInternal,
    getFrameMetrics: () => frameRef.current,
  }));

  // Rebuild states if navBottomPx changes
  useEffect(() => {
    statesRef.current = buildStates(frameRef.current, navBottomPx);
    const st = interpolateStates(statesRef.current, progressRef.current);
    applyStateToDom(st, frameRef.current);
  }, [navBottomPx]);

  // Load images, run runtime canvas keys, wait for fonts (2.5s failsafe)
  useEffect(() => {
    let cancelled = false;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const failsafe = window.setTimeout(() => {
      if (!cancelled) {
        setReady(true);
        onReadyChange(true);
      }
    }, 2500);

    const fontsPromise = document.fonts ? document.fonts.ready : Promise.resolve();
    const imagesPromise = Promise.all([
      loadImage(ASSET_URLS.dunes).then((img) => {
        if (!cancelled && dunesCanvasRef.current) {
          renderWhiteKeyedCanvas(dunesCanvasRef.current, img);
        }
      }),
      loadImage(ASSET_URLS.flowers).then((img) => {
        if (!cancelled && flLCanvasRef.current && flRCanvasRef.current) {
          renderWhiteKeyedCanvas(flLCanvasRef.current, img, {
            ...FLOWER_CROPS.left,
            refWidth: 2048,
          });
          renderWhiteKeyedCanvas(flRCanvasRef.current, img, {
            ...FLOWER_CROPS.right,
            refWidth: 2048,
          });
        }
      }),
      loadImage(ASSET_URLS.funnel).then((img) => {
        if (!cancelled && funnelCanvasRef.current) {
          renderFunnelKeyedCanvas(funnelCanvasRef.current, img);
        }
      }),
      loadImage(ASSET_URLS.ingr),
      loadImage(ASSET_URLS.tins),
    ]);

    Promise.allSettled([fontsPromise, imagesPromise]).then(() => {
      if (!cancelled) {
        window.clearTimeout(failsafe);
        setReady(true);
        onReadyChange(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
    };
  }, [onReadyChange]);

  // Frame initialization & resize listener (independent of Lenis lifecycle)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    const initialFrame = computeFrame(window.innerWidth, window.innerHeight);
    frameRef.current = initialFrame;
    setFrameState(initialFrame);
    onFrameMetrics(initialFrame);
    stepPxRef.current = Math.max(320, window.innerHeight);
    lastWidthRef.current = window.innerWidth;
    statesRef.current = buildStates(initialFrame, navBottomRef.current);
    applyFrameSizes(initialFrame);
    applyStateToDom(interpolateStates(statesRef.current, progressRef.current), initialFrame);

    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const prevP = progressRef.current;

      if (Math.abs(vw - lastWidthRef.current) > 1) {
        stepPxRef.current = Math.max(320, vh);
        lastWidthRef.current = vw;
      }

      const nextFrame = computeFrame(vw, vh);
      frameRef.current = nextFrame;
      setFrameState(nextFrame);
      onFrameMetrics(nextFrame);
      statesRef.current = buildStates(nextFrame, navBottomRef.current);
      applyFrameSizes(nextFrame);

      if (activeRef.current) {
        const nextY = prevP * stepPxRef.current;
        window.scrollTo(0, nextY);
      }

      applyStateToDom(interpolateStates(statesRef.current, prevP), nextFrame);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onFrameMetrics]);

  /**
   * CRITICAL FIX: Mount Lenis + story scroll/settle/keyboard engine ONLY while `active` is true!
   * When the user enters Shopping / Blends / Harvests / Stores or opens a modal,
   * Lenis is completely destroyed so native browser scrolling works smoothly without interference.
   */
  useEffect(() => {
    if (!active) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
      return;
    }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;

    let lenis: Lenis | null = null;
    if (!reducedMotionRef.current) {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
      });
      lenisRef.current = lenis;
    }

    let rafId = 0;
    let lastScrollY = window.scrollY;
    let scrollDir = 1;
    let isTouching = false;
    let isSettling = false;
    let wheelTimer: number | null = null;
    let scrollTimer: number | null = null;
    let lastReportedStep = Math.round(progressRef.current);
    let lastState7Visible = progressRef.current >= 6.82;
    let lastHintVisible = progressRef.current < 0.08;

    const clearTimers = () => {
      if (wheelTimer !== null) {
        window.clearTimeout(wheelTimer);
        wheelTimer = null;
      }
      if (scrollTimer !== null) {
        window.clearTimeout(scrollTimer);
        scrollTimer = null;
      }
    };

    const runSettle = () => {
      if (!activeRef.current || isTouching) return;
      const stepPx = stepPxRef.current;
      const P = Math.max(0, Math.min(7, window.scrollY / stepPx));
      const base = Math.floor(P);
      const frac = P - base;

      if (frac < 0.002 || frac > 0.998) return;

      let target: number;
      if (scrollDir >= 0) {
        target = frac > 0.12 ? Math.min(7, base + 1) : base;
      } else {
        const invFrac = 1 - frac;
        target = invFrac > 0.12 ? base : Math.min(7, base + 1);
      }

      const remaining = Math.abs(target - P);
      if (remaining < 0.002) return;

      isSettling = true;
      const targetY = target * stepPx;

      if (reducedMotionRef.current || !lenis) {
        window.scrollTo(0, targetY);
        isSettling = false;
      } else {
        lenis.scrollTo(targetY, {
          duration: Math.max(0.25, remaining * 1.0),
          easing: figmaEaseOut,
          onComplete: () => {
            isSettling = false;
          },
        });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0.5) {
        scrollDir = e.deltaY > 0 ? 1 : -1;
      }
      if (isSettling) {
        isSettling = false;
      }
      clearTimers();
      wheelTimer = window.setTimeout(() => {
        runSettle();
      }, 140);
    };

    const onTouchStart = () => {
      isTouching = true;
      isSettling = false;
      clearTimers();
    };

    const onTouchEnd = () => {
      isTouching = false;
      clearTimers();
      scrollTimer = window.setTimeout(() => {
        runSettle();
      }, 140);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastScrollY;
      if (Math.abs(dy) > 0.5) {
        scrollDir = dy > 0 ? 1 : -1;
      }
      lastScrollY = y;

      if (!isTouching && !isSettling && wheelTimer === null) {
        if (scrollTimer !== null) window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(() => {
          runSettle();
        }, 140);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const P = progressRef.current;
      const cur = Math.round(P);
      let target: number | null = null;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        target = Math.min(7, cur + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        target = Math.max(0, cur - 1);
      } else if (e.key === 'Home') {
        target = 0;
      } else if (e.key === 'End') {
        target = 7;
      }

      if (target !== null) {
        e.preventDefault();
        clearTimers();
        isSettling = false;
        jumpToStateInternal(target);
      }
    };

    const tick = (now: number) => {
      if (lenis) {
        lenis.raf(now);
      }

      const P = Math.max(0, Math.min(7, window.scrollY / stepPxRef.current));
      progressRef.current = P;
      const st = interpolateStates(statesRef.current, P);
      applyStateToDom(st, frameRef.current);

      const rounded = Math.round(P);
      if (rounded !== lastReportedStep) {
        lastReportedStep = rounded;
        setCurrentStep(rounded);
      }

      const s7 = P >= 6.82;
      if (s7 !== lastState7Visible) {
        lastState7Visible = s7;
        setShowState7Ui(s7);
      }

      const hint = P < 0.08;
      if (hint !== lastHintVisible) {
        lastHintVisible = hint;
        setShowScrollHint(hint);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      clearTimers();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKeyDown);
      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
    };
  }, [active]);

  // Compute exact pixel hitboxes for the 3 tins in State 7
  const state7 = statesRef.current[7];
  const { u, ox, oy } = frameState;
  const tinHitbox = (tr: SpriteTransform, aspect: number) => {
    const wPx = tr.w * u;
    const hPx = wPx * aspect * 1.45;
    return {
      left: ox + tr.x * u - wPx / 2,
      top: oy + tr.y * u - hPx * 0.65,
      width: wPx,
      height: hPx,
    };
  };

  const leftBox = tinHitbox(state7.tin_l, SPRITES.tin_l.aspect);
  const midBox = tinHitbox(state7.tin_m, SPRITES.tin_m.aspect);
  const rightBox = tinHitbox(state7.tin_r, SPRITES.tin_r.aspect);

  return (
    <>
      {/* Scroll track provides exact 7 * stepPx + vh scroll length ONLY in story mode */}
      <div
        id="track"
        ref={trackRef}
        aria-hidden="true"
        style={{
          width: '1px',
          height: `${7 * stepPxRef.current + frameState.vh}px`,
          pointerEvents: 'none',
          display: active ? 'block' : 'none',
        }}
      />

      {/* Fixed full-viewport editorial stage */}
      <div id="stage" aria-label="قصة إمبرليف الخريفية">
        <div id="bgSky" />
        <div id="bgField" ref={bgFieldRef} style={{ opacity: 0 }} />
        <div id="bgProd" ref={bgProdRef} style={{ opacity: 0 }} />

        {/* z 3: Arabic Ruq'ah headline, BLENDS, wordmark */}
        <h1
          id="headline"
          ref={headlineRef}
          dir="rtl"
          className="layer m-0 font-normal select-none font-ruqaa whitespace-nowrap text-center"
          style={{
            zIndex: 3,
            color: 'var(--head)',
            lineHeight: 1.08,
            wordSpacing: '0.16em',
            fontSize: `${
              frameState.isPort
                ? Math.min(frameState.vw * 0.165, frameState.headlineFs * 1.12)
                : Math.min(frameState.vw * 0.145, frameState.headlineFs * 1.38)
            }px`,
          }}
        >
          <span
            className={`headline-reveal-inner inline-block ${ready ? 'is-revealed' : 'is-hidden-load'}`}
          >
            تذوّق الخريف
          </span>
        </h1>

        <div
          id="blends"
          ref={blendsRef}
          dir="rtl"
          className="layer select-none whitespace-nowrap text-center font-ruqaa"
          style={{
            zIndex: 3,
            color: 'var(--white)',
            lineHeight: 1.05,
            fontSize: `${frameState.blendsFs * 0.9}px`,
          }}
        >
          الخلطات
        </div>

        <div
          id="mark"
          ref={markRef}
          dir="rtl"
          className="layer select-none whitespace-nowrap text-center font-ruqaa"
          style={{
            zIndex: 3,
            color: 'var(--ink)',
            lineHeight: 1.1,
            fontSize: `${frameState.markFs}px`,
            opacity: 0,
          }}
        >
          إمبرليف
        </div>

        {/* z 4: dunes canvas */}
        <canvas
          id="dunes"
          ref={dunesCanvasRef}
          className="layer"
          style={{
            zIndex: 4,
            left: '50%',
            width: `${frameState.dunesW}px`,
            height: `${frameState.dunesH}px`,
            marginLeft: `${-frameState.dunesW / 2}px`,
          }}
        />

        {/* z 5: 6 ingredient sprites + 6 Arabic Ruq'ah labels */}
        {INGREDIENT_IDS.map((id) => (
          <div
            key={id}
            id={id}
            ref={(el) => {
              spriteRefs.current[id] = el;
            }}
            className="layer"
            style={{
              zIndex: 5,
              ...getSpriteBgStyle(id),
            }}
          />
        ))}

        {LABEL_ENTRIES.map(({ id, text }) => (
          <div
            key={id}
            id={id}
            dir="rtl"
            ref={(el) => {
              labelRefs.current[id] = el;
            }}
            className="layer select-none whitespace-nowrap text-center font-ruqaa"
            style={{
              zIndex: 5,
              color: 'var(--ink)',
              fontSize: `${Math.max(14, frameState.labelFs * 1.15)}px`,
              opacity: 0,
            }}
          >
            {text}
          </div>
        ))}

        {/* z 6: amber drop */}
        <div
          id="drop"
          ref={(el) => {
            spriteRefs.current.drop = el;
          }}
          className="layer"
          style={{
            zIndex: 6,
            opacity: 0,
            ...getSpriteBgStyle('drop'),
          }}
        />

        {/* z 7: glass funnel */}
        <div
          id="funnel"
          ref={funnelWrapRef}
          className="layer"
          style={{
            zIndex: 7,
            width: `${frameState.funW * u}px`,
            height: `${frameState.funH * u}px`,
          }}
        >
          <canvas
            ref={funnelCanvasRef}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* z 8: p_l, p_r */}
        <div
          id="p_l"
          ref={(el) => {
            spriteRefs.current.p_l = el;
          }}
          className="layer"
          style={{ zIndex: 8, ...getSpriteBgStyle('p_l') }}
        />
        <div
          id="p_r"
          ref={(el) => {
            spriteRefs.current.p_r = el;
          }}
          className="layer"
          style={{ zIndex: 8, ...getSpriteBgStyle('p_r') }}
        />

        {/* z 9: tin_l, tin_r, lid_l, lid_r */}
        <div
          id="tin_l"
          ref={(el) => {
            spriteRefs.current.tin_l = el;
          }}
          className="layer"
          style={{ zIndex: 9, ...getSpriteBgStyle('tin_l') }}
        />
        <div
          id="tin_r"
          ref={(el) => {
            spriteRefs.current.tin_r = el;
          }}
          className="layer"
          style={{ zIndex: 9, ...getSpriteBgStyle('tin_r') }}
        />
        <div
          id="lid_l"
          ref={(el) => {
            spriteRefs.current.lid_l = el;
          }}
          className="layer"
          style={{ zIndex: 9, ...getSpriteBgStyle('lid_l') }}
        />
        <div
          id="lid_r"
          ref={(el) => {
            spriteRefs.current.lid_r = el;
          }}
          className="layer"
          style={{ zIndex: 9, ...getSpriteBgStyle('lid_r') }}
        />

        {/* z 10: p_m */}
        <div
          id="p_m"
          ref={(el) => {
            spriteRefs.current.p_m = el;
          }}
          className="layer"
          style={{ zIndex: 10, ...getSpriteBgStyle('p_m') }}
        />

        {/* z 11: tin_m, lid_m */}
        <div
          id="tin_m"
          ref={(el) => {
            spriteRefs.current.tin_m = el;
          }}
          className="layer"
          style={{ zIndex: 11, ...getSpriteBgStyle('tin_m') }}
        />
        <div
          id="lid_m"
          ref={(el) => {
            spriteRefs.current.lid_m = el;
          }}
          className="layer"
          style={{ zIndex: 11, ...getSpriteBgStyle('lid_m') }}
        />

        {/* z 12: marigold corner canvases */}
        <canvas
          id="fl_l"
          ref={flLCanvasRef}
          className="layer"
          style={{
            zIndex: 12,
            width: `${frameState.flLW}px`,
            height: `${frameState.flLH}px`,
          }}
        />
        <canvas
          id="fl_r"
          ref={flRCanvasRef}
          className="layer"
          style={{
            zIndex: 12,
            width: `${frameState.flRW}px`,
            height: `${frameState.flRH}px`,
          }}
        />
      </div>

      {/* Subtle left-edge chapter index (RTL side margin) */}
      {active && ready && (
        <aside
          aria-label="فصول القصة"
          className="fixed left-4 md:left-7 top-1/2 -translate-y-1/2 z-30 flex flex-col items-start gap-2.5"
        >
          {STATE_NAMES.map((label, idx) => {
            const isCurrent = currentStep === idx;
            return (
              <button
                key={label}
                type="button"
                onClick={() => jumpToStateInternal(idx)}
                aria-label={`الانتقال إلى المشهد ${idx + 1}: ${label}`}
                aria-current={isCurrent ? 'step' : undefined}
                className="group flex items-center gap-2.5 py-0.5 cursor-pointer bg-transparent border-0"
              >
                <span
                  className={`block h-[1.5px] transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 bg-[#5a2e1f]'
                      : 'w-2.5 bg-[#5a2e1f]/30 group-hover:w-4 group-hover:bg-[#5a2e1f]/65'
                  }`}
                />
                <span
                  className={`hidden md:inline text-xs font-ruqaa transition-opacity duration-200 ${
                    isCurrent
                      ? 'opacity-85 text-[#5a2e1f]'
                      : 'opacity-0 group-hover:opacity-70 text-[#5a2e1f]'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </aside>
      )}

      {/* Whisper-quiet initial scroll prompt on State 0 */}
      {active && ready && showScrollHint && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1.5 opacity-85 transition-opacity duration-500">
          <span className="text-sm font-ruqaa text-[#fff8f0] drop-shadow-[0_1px_5px_rgba(90,46,31,0.65)]">
            مرّر للأسفل للاستكشاف
          </span>
          <span className="block w-px h-5 bg-[#fff8f0]/80" />
        </div>
      )}

      {/* State 7 Interactive Vessel Hitboxes & Boutique CTA */}
      {active && showState7Ui && (
        <div className="fixed inset-0 z-25 pointer-events-none" dir="ltr">
          {[
            { slot: 'left' as const, perfume: leftPerfume, box: leftBox },
            { slot: 'middle' as const, perfume: midPerfume, box: midBox },
            { slot: 'right' as const, perfume: rightPerfume, box: rightBox },
          ].map(({ slot, perfume, box }) => (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectPerfume(perfume)}
              onMouseEnter={() => setHoveredSlot(slot)}
              onMouseLeave={() => setHoveredSlot(null)}
              aria-label={`استعرض عطر ${perfume.name} — ${formatUsd(perfume.sizes[1]?.priceUsd ?? perfume.sizes[0].priceUsd)}`}
              className="pointer-events-auto absolute cursor-pointer bg-transparent border-0 group flex flex-col items-center justify-end pb-2 transition-transform duration-200"
              style={{
                left: `${box.left}px`,
                top: `${box.top}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
              }}
            >
              <span
                dir="rtl"
                className={`px-3.5 py-1.5 bg-[#fbeee3]/95 border border-[#5a2e1f]/20 text-[#5a2e1f] text-sm font-ruqaa whitespace-nowrap transition-all duration-200 shadow-sm ${
                  hoveredSlot === slot
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-1.5 md:group-hover:opacity-100'
                }`}
              >
                {perfume.name} ·{' '}
                <span className="font-sans-editorial tabular-nums text-xs font-semibold">
                  {formatUsd(perfume.sizes[1]?.priceUsd ?? perfume.sizes[0].priceUsd)}
                </span>
              </span>
            </button>
          ))}

          <div
            dir="rtl"
            className="fixed bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-4"
          >
            <button
              type="button"
              onClick={onOpenShop}
              className="px-7 py-3 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors duration-200 cursor-pointer whitespace-nowrap shadow-[0_8px_24px_rgba(90,46,31,0.22)]"
            >
              تسوّق عطور الخريف · ابتداءً من{' '}
              <span className="font-sans-editorial tabular-nums text-sm">$115</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
});
