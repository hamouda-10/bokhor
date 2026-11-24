import type { CSSProperties } from 'react';

export function higgsProxy(rawUrl: string, width: number): string {
  return `https://images.higgs.ai/?default=1&output=webp&url=${encodeURIComponent(rawUrl)}&w=${width}&q=85`;
}

export const RAW_ASSETS = {
  dunes:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261124_025933_fa37857a-0e54-406c-ae1a-9983cf44beaa.png',
  flowers:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261124_025937_de627bd0-51ca-4cd2-bb18-42078b8b6ae8.png',
  ingr:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261124_030133_951f1e52-743a-4384-8e3b-b48d09875864.png',
  tins:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261124_030106_c6bd583e-b8e6-415e-97de-f03e46986ba5.png',
  funnel:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261124_025837_8a2d9b71-23b2-4369-b282-6a9fc7da56df.png',
} as const;

export const ASSET_URLS = {
  dunes: higgsProxy(RAW_ASSETS.dunes, 2048),
  flowers: higgsProxy(RAW_ASSETS.flowers, 2048),
  ingr: higgsProxy(RAW_ASSETS.ingr, 2048),
  tins: higgsProxy(RAW_ASSETS.tins, 2048),
  funnel: higgsProxy(RAW_ASSETS.funnel, 1440),
} as const;

export type SheetKey = 'ingr' | 'tins';

export const SHEET_SIZES: Record<SheetKey, { W: number; H: number }> = {
  ingr: { W: 2048, H: 1152 },
  tins: { W: 2048, H: 2048 },
};

export interface SpriteBox {
  sheet: SheetKey;
  x: number;
  y: number;
  w: number;
  h: number;
  aspect: number;
  mirror?: boolean;
}

function makeSprite(sheet: SheetKey, x: number, y: number, w: number, h: number, mirror?: boolean): SpriteBox {
  return { sheet, x, y, w, h, aspect: h / w, mirror };
}

export const SPRITES = {
  i_tea: makeSprite('ingr', 57, 144, 437, 343),
  i_card: makeSprite('ingr', 563, 158, 420, 290),
  i_cassia: makeSprite('ingr', 1054, 173, 435, 275),
  i_peel: makeSprite('ingr', 1561, 187, 410, 295),
  i_rose: makeSprite('ingr', 61, 655, 409, 346),
  i_amber: makeSprite('ingr', 616, 650, 338, 323),
  drop: makeSprite('ingr', 1151, 633, 219, 355),
  tin_l: makeSprite('tins', 64, 252, 582, 463),
  tin_m: makeSprite('tins', 734, 252, 582, 463),
  tin_r: makeSprite('tins', 1403, 251, 580, 463),
  lid_l: makeSprite('tins', 188, 902, 334, 329),
  lid_m: makeSprite('tins', 855, 903, 333, 328),
  lid_r: makeSprite('tins', 1528, 903, 333, 328),
  p_m: makeSprite('tins', 87, 1556, 537, 280),
  p_l: makeSprite('tins', 1449, 1355, 502, 480),
  p_r: makeSprite('tins', 1449, 1355, 502, 480, true),
} as const;

export type SpriteId = keyof typeof SPRITES;

export function getSpriteBgStyle(id: SpriteId): CSSProperties {
  const s = SPRITES[id];
  const { W, H } = SHEET_SIZES[s.sheet];
  const url = ASSET_URLS[s.sheet];
  const sizeX = (W / s.w) * 100;
  const sizeY = (H / s.h) * 100;
  const posX = (s.x / (W - s.w)) * 100;
  const posY = (s.y / (H - s.h)) * 100;
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: `${sizeX.toFixed(4)}% ${sizeY.toFixed(4)}%`,
    backgroundPosition: `${posX.toFixed(4)}% ${posY.toFixed(4)}%`,
    backgroundRepeat: 'no-repeat',
  };
}

export const FLOWER_CROPS = {
  left: { x: 0, y: 314, w: 579, h: 838 },
  right: { x: 1431, y: 363, w: 617, h: 789 },
} as const;

export const FUNNEL_CROP = {
  baseSize: 2880,
  x: 622,
  y: 184,
  w: 1636,
  h: 2578,
  aspect: 2578 / 1636,
} as const;

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Runtime White Key (Section 5)
 * For each pixel:
 *   m = max(255-R, 255-G, 255-B)
 *   alpha = clamp((m - 14) / 46, 0, 1)
 *   Where 0 < alpha < 1, un-mix white: C = 255 - (255 - C) / alpha
 */
export function renderWhiteKeyedCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  crop?: { x: number; y: number; w: number; h: number; refWidth: number }
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (crop) {
    const scale = img.naturalWidth / crop.refWidth;
    sx = Math.round(crop.x * scale);
    sy = Math.round(crop.y * scale);
    sw = Math.round(crop.w * scale);
    sh = Math.round(crop.h * scale);
  }

  canvas.width = sw;
  canvas.height = sh;
  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  try {
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const m = Math.max(255 - r, 255 - g, 255 - b);
      const alpha = clamp((m - 14) / 46, 0, 1);
      if (alpha <= 0) {
        d[i + 3] = 0;
      } else if (alpha < 1) {
        d[i] = clamp(Math.round(255 - (255 - r) / alpha), 0, 255);
        d[i + 1] = clamp(Math.round(255 - (255 - g) / alpha), 0, 255);
        d[i + 2] = clamp(Math.round(255 - (255 - b) / alpha), 0, 255);
        d[i + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Fallback if canvas tainted
  }
}

/**
 * Runtime Funnel Key (Section 5)
 * Average 24x24 patch at (4,4) as backdrop B.
 * Crop box (622, 184, 1636, 2578) scaled by naturalWidth / 2880.
 * dist = Euclidean RGB distance to B.
 * a = clamp((dist - 5) / 70, 0, 1); pixels at 0 become transparent.
 * Otherwise a = min(1, a * 1.05 + 0.04), un-premultiply C = B + (C - B) / a.
 */
export function renderFunnelKeyedCanvas(canvas: HTMLCanvasElement, img: HTMLImageElement): void {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return;

  // Sample 24x24 patch at (4,4) from source image
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 32;
  sampleCanvas.height = 32;
  const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sCtx) return;

  sCtx.drawImage(img, 0, 0, 32, 32, 0, 0, 32, 32);
  let br = 233;
  let bg = 161;
  let bb = 124;

  try {
    const patch = sCtx.getImageData(4, 4, 24, 24).data;
    let sr = 0;
    let sg = 0;
    let sb = 0;
    const count = 24 * 24;
    for (let i = 0; i < patch.length; i += 4) {
      sr += patch[i];
      sg += patch[i + 1];
      sb += patch[i + 2];
    }
    br = sr / count;
    bg = sg / count;
    bb = sb / count;
  } catch {
    // Keep default apricot fallback
  }

  const scale = nw / FUNNEL_CROP.baseSize;
  const sx = Math.round(FUNNEL_CROP.x * scale);
  const sy = Math.round(FUNNEL_CROP.y * scale);
  const sw = Math.round(FUNNEL_CROP.w * scale);
  const sh = Math.round(FUNNEL_CROP.h * scale);

  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, sw, sh);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  try {
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const dr = r - br;
      const dg = g - bg;
      const db = b - bb;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      let a = clamp((dist - 5) / 70, 0, 1);
      if (a <= 0) {
        d[i + 3] = 0;
      } else {
        a = Math.min(1, a * 1.05 + 0.04);
        d[i] = clamp(Math.round(br + (r - br) / a), 0, 255);
        d[i + 1] = clamp(Math.round(bg + (g - bg) / a), 0, 255);
        d[i + 2] = clamp(Math.round(bb + (b - bb) / a), 0, 255);
        d[i + 3] = Math.round(a * 255);
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } catch {
    // Keep unkeyed image if tainted
  }
}
