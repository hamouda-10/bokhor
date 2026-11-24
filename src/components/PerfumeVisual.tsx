import { SPRITES, getSpriteBgStyle, type SpriteId } from '../data/emberleafAssets';
import type { PerfumeProduct } from '../data/perfumes';

interface PerfumeVisualProps {
  perfume: PerfumeProduct;
  size?: 'card' | 'detail' | 'thumb';
  className?: string;
}

export function PerfumeVisual({ perfume, size = 'card', className = '' }: PerfumeVisualProps) {
  const isTrio = perfume.id === 'autumn-trio-coffret';
  const isExtrait = perfume.category === 'إكستريت دو بارفان';

  const spriteDiv = (id: SpriteId, extraStyle: React.CSSProperties) => {
    const spec = SPRITES[id];
    return (
      <div
        aria-hidden="true"
        style={{
          ...getSpriteBgStyle(id),
          aspectRatio: `${spec.w} / ${spec.h}`,
          transform: spec.mirror ? 'scaleX(-1)' : undefined,
          ...extraStyle,
        }}
      />
    );
  };

  if (size === 'thumb') {
    return (
      <div
        dir="ltr"
        className={`relative overflow-hidden flex items-center justify-center shrink-0 ${className}`}
        style={{ backgroundColor: perfume.backdropHex }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, rgba(255,248,240,0.45) 0%, transparent 72%)',
          }}
        />
        <div className="relative w-[68%] h-[78%] flex flex-col items-center justify-end">
          {spriteDiv(perfume.lidSprite, {
            width: '38%',
            marginBottom: '-10%',
            zIndex: 2,
          })}
          {spriteDiv(perfume.vesselSprite, {
            width: '84%',
            zIndex: 1,
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      className={`relative overflow-hidden select-none ${className}`}
      style={{ backgroundColor: perfume.backdropHex }}
    >
      {/* Soft sunlit editorial studio lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 32% 18%, rgba(255,248,240,0.52) 0%, rgba(255,248,240,0) 64%), linear-gradient(180deg, rgba(255,248,240,0.12) 0%, rgba(90,46,31,0.06) 100%)',
        }}
      />

      {/* Quiet Arabic edition mark top-right */}
      <div
        dir="rtl"
        className="absolute top-3.5 right-4 z-20 pointer-events-none flex items-center gap-2 text-xs font-ruqaa text-[#5a2e1f]/75"
      >
        <span>{perfume.editionNumber}</span>
        {isExtrait && (
          <>
            <span aria-hidden="true">·</span>
            <span>إكستريت</span>
          </>
        )}
      </div>

      {/* Botanical ingredients arranged organically around the vessel */}
      {perfume.accentSprites[0] && (
        <div
          className="absolute z-10 pointer-events-none transition-transform duration-500 group-hover:scale-105"
          style={{
            width: perfume.accentSprites[0] === 'drop' ? '9%' : '26%',
            left: perfume.accentSprites[0] === 'drop' ? '45.5%' : '10%',
            top: perfume.accentSprites[0] === 'drop' ? '12%' : '56%',
            filter: 'drop-shadow(0 8px 14px rgba(90,46,31,0.14))',
          }}
        >
          {spriteDiv(perfume.accentSprites[0], { width: '100%' })}
        </div>
      )}

      {perfume.accentSprites[1] && (
        <div
          className="absolute z-10 pointer-events-none transition-transform duration-500 group-hover:scale-105"
          style={{
            width: perfume.accentSprites[1] === 'drop' ? '8%' : '24%',
            right: '10%',
            top: perfume.accentSprites[1] === 'drop' ? '16%' : '58%',
            filter: 'drop-shadow(0 8px 14px rgba(90,46,31,0.14))',
          }}
        >
          {spriteDiv(perfume.accentSprites[1], { width: '100%' })}
        </div>
      )}

      {perfume.accentSprites[2] && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            width: perfume.accentSprites[2] === 'drop' ? '7.5%' : '19%',
            right: perfume.accentSprites[2] === 'drop' ? '46%' : '14%',
            top: perfume.accentSprites[2] === 'drop' ? '11%' : '20%',
            opacity: 0.92,
            filter: 'drop-shadow(0 6px 12px rgba(90,46,31,0.12))',
          }}
        >
          {spriteDiv(perfume.accentSprites[2], { width: '100%' })}
        </div>
      )}

      {/* Main vessel(s) & travertine plinth composition */}
      {isTrio ? (
        <div className="absolute inset-0 flex items-end justify-center pb-[6%] px-[6%]">
          <div className="relative w-full h-full flex items-end justify-center gap-1">
            {(
              [
                { tin: 'tin_l', lid: 'lid_l', plinth: 'p_l', w: '27%', lift: 'pb-[6%]' },
                { tin: 'tin_m', lid: 'lid_m', plinth: 'p_m', w: '32%', lift: 'pb-[0%]' },
                { tin: 'tin_r', lid: 'lid_r', plinth: 'p_r', w: '27%', lift: 'pb-[6%]' },
              ] as const
            ).map((item) => (
              <div
                key={item.tin}
                className={`relative flex flex-col items-center justify-end ${item.lift}`}
                style={{ width: item.w }}
              >
                {spriteDiv(item.lid, {
                  width: '41%',
                  marginBottom: '-6%',
                  zIndex: 3,
                })}
                {spriteDiv(item.tin, {
                  width: '90%',
                  marginBottom: '-4%',
                  zIndex: 2,
                  filter: 'drop-shadow(0 10px 16px rgba(90,46,31,0.16))',
                })}
                {spriteDiv(item.plinth, {
                  width: '100%',
                  zIndex: 1,
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-end pt-[14%] pb-0">
          <div
            className="relative flex flex-col items-center z-20 transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
            style={{
              width: size === 'detail' ? '48%' : '46%',
              marginBottom: '-3.5%',
            }}
          >
            {spriteDiv(perfume.lidSprite, {
              width: '44%',
              marginBottom: '-6%',
              zIndex: 3,
              filter: 'drop-shadow(0 4px 8px rgba(90,46,31,0.12))',
            })}
            {spriteDiv(perfume.vesselSprite, {
              width: '100%',
              zIndex: 2,
              filter: 'drop-shadow(0 14px 22px rgba(90,46,31,0.18))',
            })}
          </div>

          <div
            className="relative z-10 flex justify-center"
            style={{
              width: perfume.plinthSprite === 'p_m' ? '64%' : '54%',
              marginBottom: perfume.plinthSprite === 'p_m' ? '-2%' : '-14%',
            }}
          >
            {spriteDiv(perfume.plinthSprite, { width: '100%' })}
          </div>
        </div>
      )}
    </div>
  );
}
