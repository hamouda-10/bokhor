import { FLOWER_CROPS, FUNNEL_CROP, SPRITES } from '../data/emberleafAssets';

export interface FrameMetrics {
  vw: number;
  vh: number;
  isPort: boolean;
  W: number;
  H: number;
  u: number;
  ox: number;
  oy: number;
  spread: number;
  BELOW: number;
  ABOVE: number;
  sx: (x: number) => number;
  // Dunes dimensions & resting top
  dunesW: number;
  dunesH: number;
  dunesTopPx: number;
  dunesTopFrame: number;
  // Flowers dimensions & resting coords
  flLW: number;
  flLH: number;
  flLX: number;
  flLY: number;
  flRW: number;
  flRH: number;
  flRX: number;
  flRY: number;
  // Funnel dimensions in frame units
  funW: number;
  funH: number;
  // Type sizes in px
  headlineFs: number;
  blendsFs: number;
  blendsFsFrame: number;
  markFs: number;
  markFsFrame: number;
  labelFs: number;
  // Nav computed styles
  navPadX: number;
  navPadTop: number;
  navBrandSize: number;
  navLinkSize: number;
  navLinkGap: number;
}

export interface SpriteTransform {
  x: number; // centre x in frame units
  y: number; // centre y in frame units
  w: number; // displayed width in frame units
  r: number; // rotation in degrees
  o: number; // opacity 0..1
}

export interface TextTransform {
  x: number; // frame units (top-left for headline; centre for blends, mark, labels)
  y: number;
  o: number;
}

export interface BoxTransform {
  x: number; // centre x in frame units
  y: number; // top edge y in frame units
  o: number;
}

export interface StoryState {
  bgFieldO: number;
  bgProdO: number;
  dunesDy: number; // vertical shift in frame units from resting top
  flLDy: number; // vertical shift in frame units from resting top
  flRDy: number;
  headline: TextTransform;
  blends: TextTransform;
  mark: TextTransform;
  ingr: {
    i_rose: SpriteTransform;
    i_tea: SpriteTransform;
    i_peel: SpriteTransform;
    i_cassia: SpriteTransform;
    i_amber: SpriteTransform;
    i_card: SpriteTransform;
  };
  labels: {
    t_rose: TextTransform;
    t_tea: TextTransform;
    t_peel: TextTransform;
    t_cassia: TextTransform;
    t_amber: TextTransform;
    t_card: TextTransform;
  };
  drop: SpriteTransform;
  funnel: BoxTransform;
  p_l: SpriteTransform;
  p_m: SpriteTransform;
  p_r: SpriteTransform;
  tin_l: SpriteTransform;
  tin_m: SpriteTransform;
  tin_r: SpriteTransform;
  lid_l: SpriteTransform;
  lid_m: SpriteTransform;
  lid_r: SpriteTransform;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function computeFrame(vw: number, vh: number): FrameMetrics {
  const isPort = vw / Math.max(1, vh) < 0.9;
  const W = isPort ? 390 : 1440;
  const H = isPort ? 844 : 900;
  const u = Math.min(vw / W, vh / H);
  const ox = (vw - W * u) / 2;
  const oy = (vh - H * u) / 2;
  const spread = isPort ? clamp(((vw / u) / 390) * 0.92, 1, 1.55) : 1;
  const sx = (x: number) => (isPort ? W / 2 + (x - W / 2) * spread : x);
  const BELOW = (vh - oy) / u;
  const ABOVE = -oy / u;

  // Dunes sizing (Section 3)
  const hill = isPort ? 338 : 380;
  const hillPx = oy + hill * u;
  let dunesH = Math.max(vw * 0.5625, W * u * 0.5625, (vh - hillPx) / (1 - 0.3585) + 2);
  if (isPort) {
    dunesH = Math.max(dunesH, ((vh - hillPx) / (1 - 0.3585)) * 1.04);
  }
  const dunesW = dunesH / 0.5625;
  const dunesTopPx = hillPx - 0.3585 * dunesH;
  const dunesTopFrame = (dunesTopPx - oy) / u;

  // Marigold corners (Section 3)
  const flWBase = (isPort ? 130 : 300) * u;
  const flLAspect = FLOWER_CROPS.left.h / FLOWER_CROPS.left.w;
  const flRAspect = FLOWER_CROPS.right.h / FLOWER_CROPS.right.w;
  const flLW = flWBase;
  const flLH = flLW * flLAspect;
  const flLX = -0.06 * flLW;
  const flLY = vh - 0.86 * flLH;

  const flRW = flWBase;
  const flRH = flRW * flRAspect;
  const flRX = vw - 0.94 * flRW;
  const flRY = vh - 0.86 * flRH;

  // Funnel dimensions in frame units
  const funW = isPort ? 330 : 483;
  const funH = funW * FUNNEL_CROP.aspect;

  // Type sizes (Section 3)
  const headlineFs = (isPort ? 72 : 148) * u;
  const blendsFsFrame = isPort ? 84 : 252;
  const blendsFs = blendsFsFrame * u;
  const markFsFrame = isPort ? 54 : 80;
  const markFs = markFsFrame * u;
  const labelFs = isPort ? Math.max(11, 14 * u) : Math.max(11, 22 * u);

  // Nav sizing (Section 3)
  const n = Math.min(vw / 1440, vh / 900);
  const navPadX = isPort ? Math.max(16, vw * 0.055) : Math.max(16, (78 * vw) / 1440);
  const navPadTop = isPort ? Math.max(14, 22 * u) : Math.max(12, 30 * n);
  const navBrandSize = isPort ? Math.max(18, 22 * u) : Math.max(18, 30 * n);
  const navLinkSize = isPort ? Math.max(11, 11 * u) : Math.max(11, 14 * n);
  const navLinkGap = isPort ? 8 : Math.max(14, 40 * n);

  return {
    vw,
    vh,
    isPort,
    W,
    H,
    u,
    ox,
    oy,
    spread,
    BELOW,
    ABOVE,
    sx,
    dunesW,
    dunesH,
    dunesTopPx,
    dunesTopFrame,
    flLW,
    flLH,
    flLX,
    flLY,
    flRW,
    flRH,
    flRX,
    flRY,
    funW,
    funH,
    headlineFs,
    blendsFs,
    blendsFsFrame,
    markFs,
    markFsFrame,
    labelFs,
    navPadX,
    navPadTop,
    navBrandSize,
    navLinkSize,
    navLinkGap,
  };
}

export function buildStates(f: FrameMetrics, navBottomPx: number): StoryState[] {
  const { isPort, W, H, u, oy, BELOW, ABOVE, sx, dunesTopFrame, funH, blendsFsFrame, markFsFrame } = f;

  // Shared downward offset for dunes, marigolds, and headline in states >= 1
  const down = BELOW - dunesTopFrame + 40;
  const flLTopFrame = (f.flLY - oy) / u;
  const flRTopFrame = (f.flRY - oy) / u;
  const flLDown = Math.max(down, BELOW - flLTopFrame + 40);
  const flRDown = Math.max(down, BELOW - flRTopFrame + 40);

  // Headline centred across the upper sky above the dunes
  const headX = W / 2;
  const headY = Math.max(
    isPort ? 228 : 252,
    (navBottomPx + 20 - oy) / u + (isPort ? 44 : 92)
  );

  // State 0: hero ingredients tucked into hills
  const ingr0: StoryState['ingr'] = isPort
    ? {
        i_tea: { x: sx(70), y: 450, w: 62, r: -8, o: 1 },
        i_card: { x: sx(300), y: 430, w: 58, r: 6, o: 1 },
        i_rose: { x: sx(180), y: 520, w: 62, r: -4, o: 1 },
        i_peel: { x: sx(330), y: 560, w: 64, r: 10, o: 1 },
        i_cassia: { x: sx(120), y: 610, w: 66, r: -6, o: 1 },
        i_amber: { x: sx(250), y: 640, w: 50, r: 0, o: 1 },
      }
    : {
        i_tea: { x: 300, y: 560, w: 100, r: -8, o: 1 },
        i_card: { x: 1035, y: 520, w: 92, r: 6, o: 1 },
        i_rose: { x: 585, y: 628, w: 96, r: -4, o: 1 },
        i_peel: { x: 1215, y: 612, w: 104, r: 10, o: 1 },
        i_cassia: { x: 860, y: 575, w: 104, r: -6, o: 1 },
        i_amber: { x: 430, y: 720, w: 78, r: 0, o: 1 },
      };

  // State 1: ingredient grid
  // Order: rose, tea, peel / cassia, amber, card
  const gridSpots = isPort
    ? {
        i_rose: { x: sx(105), y: 232, ly: 140, w: 138 },
        i_tea: { x: sx(285), y: 232, ly: 140, w: 146 },
        i_peel: { x: sx(105), y: 440, ly: 348, w: 136 },
        i_cassia: { x: sx(285), y: 440, ly: 348, w: 146 },
        i_amber: { x: sx(105), y: 648, ly: 556, w: 110 },
        i_card: { x: sx(285), y: 648, ly: 556, w: 142 },
      }
    : {
        i_rose: { x: 292, y: 355, ly: 188, w: 230 },
        i_tea: { x: 720, y: 355, ly: 188, w: 240 },
        i_peel: { x: 1150, y: 355, ly: 188, w: 228 },
        i_cassia: { x: 292, y: 712, ly: 548, w: 240 },
        i_amber: { x: 720, y: 712, ly: 548, w: 180 },
        i_card: { x: 1150, y: 712, ly: 548, w: 236 },
      };

  const ingr1: StoryState['ingr'] = {
    i_rose: { x: gridSpots.i_rose.x, y: gridSpots.i_rose.y, w: gridSpots.i_rose.w, r: 0, o: 1 },
    i_tea: { x: gridSpots.i_tea.x, y: gridSpots.i_tea.y, w: gridSpots.i_tea.w, r: 0, o: 1 },
    i_peel: { x: gridSpots.i_peel.x, y: gridSpots.i_peel.y, w: gridSpots.i_peel.w, r: 0, o: 1 },
    i_cassia: { x: gridSpots.i_cassia.x, y: gridSpots.i_cassia.y, w: gridSpots.i_cassia.w, r: 0, o: 1 },
    i_amber: { x: gridSpots.i_amber.x, y: gridSpots.i_amber.y, w: gridSpots.i_amber.w, r: 0, o: 1 },
    i_card: { x: gridSpots.i_card.x, y: gridSpots.i_card.y, w: gridSpots.i_card.w, r: 0, o: 1 },
  };

  const labels0: StoryState['labels'] = {
    t_rose: { x: gridSpots.i_rose.x, y: gridSpots.i_rose.ly + 24, o: 0 },
    t_tea: { x: gridSpots.i_tea.x, y: gridSpots.i_tea.ly + 24, o: 0 },
    t_peel: { x: gridSpots.i_peel.x, y: gridSpots.i_peel.ly + 24, o: 0 },
    t_cassia: { x: gridSpots.i_cassia.x, y: gridSpots.i_cassia.ly + 24, o: 0 },
    t_amber: { x: gridSpots.i_amber.x, y: gridSpots.i_amber.ly + 24, o: 0 },
    t_card: { x: gridSpots.i_card.x, y: gridSpots.i_card.ly + 24, o: 0 },
  };

  const labels1: StoryState['labels'] = {
    t_rose: { x: gridSpots.i_rose.x, y: gridSpots.i_rose.ly, o: 1 },
    t_tea: { x: gridSpots.i_tea.x, y: gridSpots.i_tea.ly, o: 1 },
    t_peel: { x: gridSpots.i_peel.x, y: gridSpots.i_peel.ly, o: 1 },
    t_cassia: { x: gridSpots.i_cassia.x, y: gridSpots.i_cassia.ly, o: 1 },
    t_amber: { x: gridSpots.i_amber.x, y: gridSpots.i_amber.ly, o: 1 },
    t_card: { x: gridSpots.i_card.x, y: gridSpots.i_card.ly, o: 1 },
  };

  const labels2: StoryState['labels'] = {
    t_rose: { x: gridSpots.i_rose.x, y: gridSpots.i_rose.ly - 14, o: 0 },
    t_tea: { x: gridSpots.i_tea.x, y: gridSpots.i_tea.ly - 14, o: 0 },
    t_peel: { x: gridSpots.i_peel.x, y: gridSpots.i_peel.ly - 14, o: 0 },
    t_cassia: { x: gridSpots.i_cassia.x, y: gridSpots.i_cassia.ly - 14, o: 0 },
    t_amber: { x: gridSpots.i_amber.x, y: gridSpots.i_amber.ly - 14, o: 0 },
    t_card: { x: gridSpots.i_card.x, y: gridSpots.i_card.ly - 14, o: 0 },
  };

  // State 2: gather cluster
  const gcx = isPort ? 195 : 720;
  const gcy = isPort ? 190 : 175;
  const ingr2: StoryState['ingr'] = isPort
    ? {
        i_rose: { x: gcx - 70, y: gcy - 12, w: 92, r: -10, o: 1 },
        i_tea: { x: gcx + 6, y: gcy - 34, w: 100, r: 0, o: 1 },
        i_peel: { x: gcx + 74, y: gcy - 3, w: 86, r: 12, o: 1 },
        i_cassia: { x: gcx - 34, y: gcy + 34, w: 92, r: -14, o: 1 },
        i_amber: { x: gcx + 46, y: gcy + 36, w: 66, r: 8, o: 1 },
        i_card: { x: gcx + 0, y: gcy + 15, w: 86, r: 4, o: 1 },
      }
    : {
        i_rose: { x: gcx - 120, y: gcy - 20, w: 150, r: -10, o: 1 },
        i_tea: { x: gcx + 10, y: gcy - 55, w: 165, r: 0, o: 1 },
        i_peel: { x: gcx + 125, y: gcy - 5, w: 140, r: 12, o: 1 },
        i_cassia: { x: gcx - 55, y: gcy + 55, w: 150, r: -14, o: 1 },
        i_amber: { x: gcx + 75, y: gcy + 58, w: 108, r: 8, o: 1 },
        i_card: { x: gcx + 0, y: gcy + 25, w: 140, r: 4, o: 1 },
      };

  // State 3: inside glass funnel
  const ingr3: StoryState['ingr'] = isPort
    ? {
        i_rose: { x: 150, y: 200, w: 88, r: -8, o: 1 },
        i_tea: { x: 240, y: 196, w: 94, r: 4, o: 1 },
        i_cassia: { x: 160, y: 258, w: 84, r: -16, o: 1 },
        i_card: { x: 232, y: 262, w: 80, r: 10, o: 1 },
        i_peel: { x: 185, y: 316, w: 74, r: 6, o: 1 },
        i_amber: { x: 204, y: 368, w: 56, r: 0, o: 1 },
      }
    : {
        i_rose: { x: 636, y: 178, w: 160, r: -8, o: 1 },
        i_tea: { x: 806, y: 170, w: 168, r: 4, o: 1 },
        i_cassia: { x: 660, y: 262, w: 152, r: -16, o: 1 },
        i_card: { x: 790, y: 270, w: 148, r: 10, o: 1 },
        i_peel: { x: 716, y: 350, w: 132, r: 6, o: 1 },
        i_amber: { x: 724, y: 424, w: 96, r: 0, o: 1 },
      };

  const shift4 = isPort ? -330 : -560;
  const shift5 = isPort ? -610 : -810;

  const shiftIngr = (src: StoryState['ingr'], dy: number, o: number): StoryState['ingr'] => ({
    i_rose: { ...src.i_rose, y: src.i_rose.y + dy, o },
    i_tea: { ...src.i_tea, y: src.i_tea.y + dy, o },
    i_peel: { ...src.i_peel, y: src.i_peel.y + dy, o },
    i_cassia: { ...src.i_cassia, y: src.i_cassia.y + dy, o },
    i_amber: { ...src.i_amber, y: src.i_amber.y + dy, o },
    i_card: { ...src.i_card, y: src.i_card.y + dy, o },
  });

  const ingr4 = shiftIngr(ingr3, shift4, 1);
  const ingr5 = shiftIngr(ingr3, shift5 - 200, 0);

  // Funnel top positions
  const funTopWait = BELOW + 60;
  const funTop2 = isPort ? 640 : 660;
  const funTop3 = isPort ? 150 : 89;
  const funTop4 = funTop3 + shift4;
  const funTop5 = funTop3 + shift5 - 0.4 * funH;

  // BLENDS text
  const blendsWaitY = Math.max(isPort ? 960 : 1080, BELOW + blendsFsFrame * 0.7);
  const blendsY3 = isPort ? 548 : 600;
  const blendsY4 = blendsY3 + shift4;
  const blendsY5 = blendsY3 + shift5 - 300;

  // Drop
  const dropW = isPort ? 22 : 34;
  const dropH = dropW * SPRITES.drop.aspect;
  const spoutY3 = funTop3 + funH;
  const spoutY4 = funTop3 + funH + shift4;

  // Big middle tin (states 5 & 6)
  const bigTinW = isPort ? 330 : 600;
  const bigTinH = bigTinW * SPRITES.tin_m.aspect;
  const bigTinTop = isPort ? 470 : 480;
  const bigTinCy = bigTinTop + bigTinH / 2;
  const bigLidW = bigTinW * 0.45;
  const bigLidH = bigLidW * SPRITES.lid_m.aspect;
  const bigLidWaitCy = ABOVE - bigLidH * 0.9;
  const bigLidOnCy = bigTinTop + 0.05 * bigTinH - bigLidH / 2;

  const dropWaitAt = (funTop: number): SpriteTransform => ({
    x: W / 2,
    y: funTop + funH - 0.2 * dropH,
    w: dropW * 0.35,
    r: 0,
    o: 0,
  });
  const dropState3: SpriteTransform = {
    x: W / 2,
    y: spoutY3 - 0.2 * dropH,
    w: dropW * 0.35,
    r: 0,
    o: 0,
  };
  const dropState4: SpriteTransform = {
    x: W / 2,
    y: spoutY4 + dropH * 0.5,
    w: dropW,
    r: 0,
    o: 1,
  };
  const dropState5: SpriteTransform = {
    x: W / 2,
    y: bigTinTop + 0.2 * dropH,
    w: dropW * 0.8,
    r: 0,
    o: 0,
  };

  // Final product row (State 7)
  const colX = isPort ? [sx(76), sx(195), sx(314)] : [375, 720, 1065];
  const plinthTopY = isPort ? [620, 712, 620] : [600, 765, 600];
  const plinthWidths = isPort ? [148, 184, 148] : [340, 420, 340];
  const tinWidths = isPort ? [120, 140, 120] : [290, 320, 290];

  const makeRow = (riseOffset: number) => {
    const pLH = plinthWidths[0] * SPRITES.p_l.aspect;
    const pMH = plinthWidths[1] * SPRITES.p_m.aspect;
    const pRH = plinthWidths[2] * SPRITES.p_r.aspect;

    const tinLH = tinWidths[0] * SPRITES.tin_l.aspect;
    const tinMH = tinWidths[1] * SPRITES.tin_m.aspect;
    const tinRH = tinWidths[2] * SPRITES.tin_r.aspect;

    const lidLW = tinWidths[0] * 0.45;
    const lidMW = tinWidths[1] * 0.45;
    const lidRW = tinWidths[2] * 0.45;

    const lidLH = lidLW * SPRITES.lid_l.aspect;
    const lidMH = lidMW * SPRITES.lid_m.aspect;
    const lidRH = lidRW * SPRITES.lid_r.aspect;

    const ptL = plinthTopY[0] + riseOffset;
    const ptM = plinthTopY[1] + riseOffset;
    const ptR = plinthTopY[2] + riseOffset;

    const tinLTop = ptL + 6 - tinLH;
    const tinMTop = ptM + 6 - tinMH;
    const tinRTop = ptR + 6 - tinRH;

    return {
      p_l: { x: colX[0], y: ptL + pLH / 2, w: plinthWidths[0], r: 0, o: 1 },
      p_m: { x: colX[1], y: ptM + pMH / 2, w: plinthWidths[1], r: 0, o: 1 },
      p_r: { x: colX[2], y: ptR + pRH / 2, w: plinthWidths[2], r: 0, o: 1 },
      tin_l: { x: colX[0], y: tinLTop + tinLH / 2, w: tinWidths[0], r: 0, o: 1 },
      tin_m: { x: colX[1], y: tinMTop + tinMH / 2, w: tinWidths[1], r: 0, o: 1 },
      tin_r: { x: colX[2], y: tinRTop + tinRH / 2, w: tinWidths[2], r: 0, o: 1 },
      lid_l: { x: colX[0], y: tinLTop + 0.05 * tinLH - lidLH / 2, w: lidLW, r: 0, o: 1 },
      lid_m: { x: colX[1], y: tinMTop + 0.05 * tinMH - lidMH / 2, w: lidMW, r: 0, o: 1 },
      lid_r: { x: colX[2], y: tinRTop + 0.05 * tinRH - lidRH / 2, w: lidRW, r: 0, o: 1 },
    };
  };

  const finalRow = makeRow(0);
  const lowRise = (isPort ? 300 : 420) + Math.max(0, BELOW - H);
  const lowRow = makeRow(lowRise);

  const minPlinthTop = Math.min(...plinthTopY);
  const maxTinW = Math.max(...tinWidths);
  const goneRise =
    BELOW - minPlinthTop + maxTinW * (SPRITES.tin_m.aspect + 0.45 * SPRITES.lid_m.aspect) + 60;
  const goneRow = makeRow(goneRise);

  const bigTinWait: SpriteTransform = {
    x: W / 2,
    y: BELOW + 40 + bigTinH / 2,
    w: bigTinW,
    r: 0,
    o: 1,
  };
  const bigTinActive: SpriteTransform = {
    x: W / 2,
    y: bigTinCy,
    w: bigTinW,
    r: 0,
    o: 1,
  };
  const bigLidWait: SpriteTransform = {
    x: W / 2,
    y: bigLidWaitCy,
    w: bigLidW,
    r: 0,
    o: 1,
  };
  const bigLidOn: SpriteTransform = {
    x: W / 2,
    y: bigLidOnCy,
    w: bigLidW,
    r: 0,
    o: 1,
  };

  // Wordmark (State 7)
  const markY7 = Math.max(
    isPort ? 215 : 166,
    (navBottomPx + 6 - oy) / u + markFsFrame * 0.62
  );
  const markHidden: TextTransform = { x: W / 2, y: markY7 - 18, o: 0 };
  const markShown: TextTransform = { x: W / 2, y: markY7, o: 1 };

  // Assemble all 8 exact states (0..7)
  const states: StoryState[] = [
    // State 0: hero
    {
      bgFieldO: 0,
      bgProdO: 0,
      dunesDy: 0,
      flLDy: 0,
      flRDy: 0,
      headline: { x: headX, y: headY, o: 0.92 },
      blends: { x: W / 2, y: blendsWaitY, o: 1 },
      mark: markHidden,
      ingr: ingr0,
      labels: labels0,
      drop: dropWaitAt(funTopWait),
      funnel: { x: W / 2, y: funTopWait, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinWait,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 1: ingredient grid
    {
      bgFieldO: 0,
      bgProdO: 0,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0.92 },
      blends: { x: W / 2, y: blendsWaitY, o: 1 },
      mark: markHidden,
      ingr: ingr1,
      labels: labels1,
      drop: dropWaitAt(funTopWait),
      funnel: { x: W / 2, y: funTopWait, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinWait,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 2: gather
    {
      bgFieldO: 1,
      bgProdO: 0,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsWaitY, o: 1 },
      mark: markHidden,
      ingr: ingr2,
      labels: labels2,
      drop: dropWaitAt(funTop2),
      funnel: { x: W / 2, y: funTop2, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinWait,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 3: funnel / BLENDS
    {
      bgFieldO: 1,
      bgProdO: 0,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsY3, o: 1 },
      mark: markHidden,
      ingr: ingr3,
      labels: labels2,
      drop: dropState3,
      funnel: { x: W / 2, y: funTop3, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinWait,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 4: drip
    {
      bgFieldO: 1,
      bgProdO: 0,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsY4, o: 1 },
      mark: markHidden,
      ingr: ingr4,
      labels: labels2,
      drop: dropState4,
      funnel: { x: W / 2, y: funTop4, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinWait,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 5: big tin catches the drop
    {
      bgFieldO: 0,
      bgProdO: 1,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsY5, o: 0 },
      mark: markHidden,
      ingr: ingr5,
      labels: labels2,
      drop: dropState5,
      funnel: { x: W / 2, y: funTop5, o: 1 },
      p_l: goneRow.p_l,
      p_m: goneRow.p_m,
      p_r: goneRow.p_r,
      tin_l: goneRow.tin_l,
      tin_m: bigTinActive,
      tin_r: goneRow.tin_r,
      lid_l: goneRow.lid_l,
      lid_m: bigLidWait,
      lid_r: goneRow.lid_r,
    },
    // State 6: lid drops on
    {
      bgFieldO: 0,
      bgProdO: 1,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsY5, o: 0 },
      mark: markHidden,
      ingr: ingr5,
      labels: labels2,
      drop: dropState5,
      funnel: { x: W / 2, y: funTop5, o: 0 },
      p_l: lowRow.p_l,
      p_m: lowRow.p_m,
      p_r: lowRow.p_r,
      tin_l: lowRow.tin_l,
      tin_m: bigTinActive,
      tin_r: lowRow.tin_r,
      lid_l: lowRow.lid_l,
      lid_m: bigLidOn,
      lid_r: lowRow.lid_r,
    },
    // State 7: product line-up
    {
      bgFieldO: 0,
      bgProdO: 1,
      dunesDy: down,
      flLDy: flLDown,
      flRDy: flRDown,
      headline: { x: headX, y: headY + down, o: 0 },
      blends: { x: W / 2, y: blendsY5, o: 0 },
      mark: markShown,
      ingr: ingr5,
      labels: labels2,
      drop: dropState5,
      funnel: { x: W / 2, y: funTop5, o: 0 },
      p_l: finalRow.p_l,
      p_m: finalRow.p_m,
      p_r: finalRow.p_r,
      tin_l: finalRow.tin_l,
      tin_m: finalRow.tin_m,
      tin_r: finalRow.tin_r,
      lid_l: finalRow.lid_l,
      lid_m: finalRow.lid_m,
      lid_r: finalRow.lid_r,
    },
  ];

  return states;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpSprite(a: SpriteTransform, b: SpriteTransform, t: number): SpriteTransform {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    r: lerp(a.r, b.r, t),
    o: lerp(a.o, b.o, t),
  };
}

function lerpText(a: TextTransform, b: TextTransform, t: number): TextTransform {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    o: lerp(a.o, b.o, t),
  };
}

function lerpBox(a: BoxTransform, b: BoxTransform, t: number): BoxTransform {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    o: lerp(a.o, b.o, t),
  };
}

export function interpolateStates(states: StoryState[], P: number): StoryState {
  const clamped = clamp(P, 0, states.length - 1);
  const idx = Math.min(Math.floor(clamped), states.length - 2);
  const t = clamped - idx;
  const a = states[idx];
  const b = states[idx + 1];

  return {
    bgFieldO: lerp(a.bgFieldO, b.bgFieldO, t),
    bgProdO: lerp(a.bgProdO, b.bgProdO, t),
    dunesDy: lerp(a.dunesDy, b.dunesDy, t),
    flLDy: lerp(a.flLDy, b.flLDy, t),
    flRDy: lerp(a.flRDy, b.flRDy, t),
    headline: lerpText(a.headline, b.headline, t),
    blends: lerpText(a.blends, b.blends, t),
    mark: lerpText(a.mark, b.mark, t),
    ingr: {
      i_rose: lerpSprite(a.ingr.i_rose, b.ingr.i_rose, t),
      i_tea: lerpSprite(a.ingr.i_tea, b.ingr.i_tea, t),
      i_peel: lerpSprite(a.ingr.i_peel, b.ingr.i_peel, t),
      i_cassia: lerpSprite(a.ingr.i_cassia, b.ingr.i_cassia, t),
      i_amber: lerpSprite(a.ingr.i_amber, b.ingr.i_amber, t),
      i_card: lerpSprite(a.ingr.i_card, b.ingr.i_card, t),
    },
    labels: {
      t_rose: lerpText(a.labels.t_rose, b.labels.t_rose, t),
      t_tea: lerpText(a.labels.t_tea, b.labels.t_tea, t),
      t_peel: lerpText(a.labels.t_peel, b.labels.t_peel, t),
      t_cassia: lerpText(a.labels.t_cassia, b.labels.t_cassia, t),
      t_amber: lerpText(a.labels.t_amber, b.labels.t_amber, t),
      t_card: lerpText(a.labels.t_card, b.labels.t_card, t),
    },
    drop: lerpSprite(a.drop, b.drop, t),
    funnel: lerpBox(a.funnel, b.funnel, t),
    p_l: lerpSprite(a.p_l, b.p_l, t),
    p_m: lerpSprite(a.p_m, b.p_m, t),
    p_r: lerpSprite(a.p_r, b.p_r, t),
    tin_l: lerpSprite(a.tin_l, b.tin_l, t),
    tin_m: lerpSprite(a.tin_m, b.tin_m, t),
    tin_r: lerpSprite(a.tin_r, b.tin_r, t),
    lid_l: lerpSprite(a.lid_l, b.lid_l, t),
    lid_m: lerpSprite(a.lid_m, b.lid_m, t),
    lid_r: lerpSprite(a.lid_r, b.lid_r, t),
  };
}

/**
 * Exact cubic-bezier(0, 0, 0.58, 1) solver for Figma Ease-Out
 */
export function figmaEaseOut(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  // P0=(0,0), P1=(0,0), P2=(0.58, 1), P3=(1,1)
  // Bx(t) = 3(1-t)t^2 * 0.58 + t^3
  // By(t) = 3(1-t)t^2 * 1 + t^3 = 3t^2 - 2t^3
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 14; i++) {
    t = (lo + hi) / 2;
    const bx = 1.74 * (1 - t) * t * t + t * t * t;
    if (bx < x) lo = t;
    else hi = t;
  }
  return 3 * t * t - 2 * t * t * t;
}
