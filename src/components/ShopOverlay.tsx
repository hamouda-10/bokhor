import { useMemo, useState } from 'react';
import { ArrowRight, Heart, Plus, Search, ShoppingBag, SlidersHorizontal, Star } from 'lucide-react';
import {
  PERFUMES,
  formatUsd,
  type OlfactoryFamily,
  type PerfumeCategory,
  type PerfumeProduct,
  type PerfumeSizeOption,
} from '../data/perfumes';
import { PerfumeVisual } from './PerfumeVisual';

interface ShopOverlayProps {
  onBackToStory: () => void;
  onSelectPerfume: (perfume: PerfumeProduct) => void;
  onQuickAdd: (perfume: PerfumeProduct, size: PerfumeSizeOption) => void;
  onOpenCart: () => void;
  cartCount: number;
  wishlistIds: string[];
  onToggleWishlist: (perfumeId: string) => void;
}

type CategoryFilter = 'الكل' | PerfumeCategory | 'المفضلة';
type FamilyFilter = 'الكل' | OlfactoryFamily;
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

const CATEGORIES: CategoryFilter[] = [
  'الكل',
  'أو دو بارفان',
  'إكستريت دو بارفان',
  'المجموعات والصلب',
  'المفضلة',
];

const FAMILIES: FamilyFilter[] = [
  'الكل',
  'الشاي والتوابل',
  'العنبر والراتنج',
  'الزهور والورد',
  'الحمضيات والقشور',
];

export function ShopOverlay({
  onBackToStory,
  onSelectPerfume,
  onQuickAdd,
  onOpenCart,
  cartCount,
  wishlistIds,
  onToggleWishlist,
}: ShopOverlayProps) {
  const [category, setCategory] = useState<CategoryFilter>('الكل');
  const [family, setFamily] = useState<FamilyFilter>('الكل');
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [query, setQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const defaultSizeOf = (p: PerfumeProduct): PerfumeSizeOption => p.sizes[1] ?? p.sizes[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PERFUMES.filter((p) => {
      if (category === 'المفضلة') {
        if (!wishlistIds.includes(p.id)) return false;
      } else if (category !== 'الكل' && p.category !== category) {
        return false;
      }
      if (family !== 'الكل' && p.family !== family) return false;
      if (q) {
        const hay =
          `${p.name} ${p.subtitle} ${p.family} ${p.notes.top.join(' ')} ${p.notes.heart.join(' ')} ${p.notes.base.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => defaultSizeOf(a).priceUsd - defaultSizeOf(b).priceUsd);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => defaultSizeOf(b).priceUsd - defaultSizeOf(a).priceUsd);
    } else if (sortBy === 'rating') {
      list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    }
    return list;
  }, [category, family, sortBy, query, wishlistIds]);

  const handleQuickAdd = (perfume: PerfumeProduct) => {
    onQuickAdd(perfume, defaultSizeOf(perfume));
    setAddedId(perfume.id);
    window.setTimeout(() => {
      setAddedId((cur) => (cur === perfume.id ? null : cur));
    }, 1100);
  };

  const featuredPerfume = PERFUMES[0];

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#fbeee3] text-[#5a2e1f] pt-24 md:pt-28 pb-24">
      <div className="max-w-[1260px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Top return bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#5a2e1f]/14">
          <button
            type="button"
            onClick={onBackToStory}
            className="inline-flex items-center gap-2 text-base font-ruqaa text-[#5a2e1f]/85 hover:text-[#c8653f] transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى قصة الخريف</span>
          </button>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans-editorial text-[#5a2e1f]/75">
            <span>الأسعار بالدولار الأمريكي (USD $)</span>
            <span aria-hidden="true">·</span>
            <span>شحن سريع مجاني للطلبات فوق $200</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <button
              type="button"
              onClick={onOpenCart}
              className="hidden sm:inline-flex items-center gap-1.5 font-medium text-[#5a2e1f] hover:text-[#c8653f] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="tabular-nums">حقيبة التسوق ({cartCount})</span>
            </button>
          </div>
        </div>

        {/* Storefront Hero Banner */}
        <section className="py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch border-b border-[#5a2e1f]/14">
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <p className="text-base font-ruqaa text-[#c8653f] mb-3">
                دار إمبرليف للعطور · مجموعة الخريف
              </p>
              <h1
                className="text-4xl sm:text-5xl leading-[1.24] font-ruqaa text-[#5a2e1f] mb-5"
                style={{ textWrap: 'balance' }}
              >
                عطور نباتية مُعتّقة بدفء الخريف
              </h1>
              <p className="font-sans-editorial text-[15px] leading-relaxed text-[#5a2e1f]/80 max-w-md mb-8">
                يُحضَّر كل عطر بكميات محدودة من محاصيلنا الخريفية الستة — الشاي الأسود المحمّص، الهيل الأخضر، لحاء القرفة، قشر البرتقال المرّ، براعم الورد المجفف، وراتنج العنبر العُماني.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex flex-wrap items-baseline gap-3 text-sm font-sans-editorial text-[#5a2e1f]/75">
                <span className="font-ruqaa text-2xl text-[#5a2e1f]">{featuredPerfume.name}</span>
                <span aria-hidden="true">·</span>
                <span>50 مل أو دو بارفان</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-semibold text-[#5a2e1f]" dir="ltr">
                  {formatUsd(featuredPerfume.sizes[1].priceUsd)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectPerfume(featuredPerfume)}
                  className="px-6 py-3 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer whitespace-nowrap"
                >
                  اكتشف عطر جمر الطين — <span className="font-sans-editorial text-sm">$185</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(featuredPerfume)}
                  className="px-5 py-3 border border-[#5a2e1f]/30 text-[#5a2e1f] text-base font-ruqaa hover:border-[#5a2e1f] hover:bg-[#5a2e1f]/5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {addedId === featuredPerfume.id ? 'تمت الإضافة للحقيبة' : 'أضف إلى الحقيبة'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectPerfume(featuredPerfume)}
            aria-label={`استعرض ${featuredPerfume.name}`}
            className="lg:col-span-7 group block w-full text-right cursor-pointer border-0 p-0 bg-transparent"
          >
            <PerfumeVisual
              perfume={featuredPerfume}
              size="detail"
              className="w-full h-full min-h-[320px] sm:min-h-[400px] border border-[#5a2e1f]/10"
            />
          </button>
        </section>

        {/* Controls: Category tabs, Olfactory family, Search, Sort */}
        <section aria-label="تصفية العطور" className="py-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category segmented control */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#f4d2bb]/55 border border-[#5a2e1f]/10 w-fit">
              {CATEGORIES.map((cat) => {
                const active = category === cat;
                const favSuffix =
                  cat === 'المفضلة' && wishlistIds.length > 0 ? ` (${wishlistIds.length})` : '';
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3.5 py-2 text-xs font-sans-editorial transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#5a2e1f] text-[#fff8f0]'
                        : 'bg-transparent text-[#5a2e1f]/80 hover:text-[#5a2e1f]'
                    }`}
                  >
                    {cat}
                    {favSuffix}
                  </button>
                );
              })}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="w-4 h-4 text-[#5a2e1f]/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث بالنوتات: عنبر، ورد، شاي..."
                  aria-label="ابحث في العطور"
                  className="w-full pr-9 pl-3 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-sm font-sans-editorial text-[#5a2e1f] placeholder:text-[#5a2e1f]/45 focus:border-[#5a2e1f]"
                />
              </div>

              <label className="inline-flex items-center gap-2 bg-[#fdf6ef] border border-[#5a2e1f]/18 px-3 py-2.5 text-xs font-sans-editorial text-[#5a2e1f]/80">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5a2e1f]/60" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  aria-label="ترتيب العطور"
                  className="bg-transparent text-[#5a2e1f] font-medium focus:outline-none cursor-pointer"
                >
                  <option value="featured">الأكثر تميّزاً</option>
                  <option value="price-asc">السعر: من الأقل للأعلى ($)</option>
                  <option value="price-desc">السعر: من الأعلى للأقل ($)</option>
                  <option value="rating">الأعلى تقييماً</option>
                </select>
              </label>
            </div>
          </div>

          {/* Olfactory Family filter row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-sans-editorial text-[#5a2e1f]/60 ml-1">
                العائلة العطرية:
              </span>
              {FAMILIES.map((fam) => {
                const active = family === fam;
                return (
                  <button
                    key={fam}
                    type="button"
                    onClick={() => setFamily(fam)}
                    className={`px-3 py-1.5 text-xs font-sans-editorial transition-colors cursor-pointer whitespace-nowrap border ${
                      active
                        ? 'border-[#5a2e1f] text-[#5a2e1f] bg-[#f4d2bb]/60 font-medium'
                        : 'border-[#5a2e1f]/15 text-[#5a2e1f]/70 hover:border-[#5a2e1f]/40 hover:text-[#5a2e1f]'
                    }`}
                  >
                    {fam}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-sans-editorial text-[#5a2e1f]/65 tabular-nums">
              عرض {filtered.length} من أصل {PERFUMES.length} عطور
            </p>
          </div>
        </section>

        {/* 3-Column Uniform Product Collection Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center border border-[#5a2e1f]/14 bg-[#fdf6ef]">
            <p className="text-2xl font-ruqaa text-[#5a2e1f] mb-2">
              لا توجد عطور تطابق خيارات البحث الحالية
            </p>
            <p className="text-sm font-sans-editorial text-[#5a2e1f]/70 mb-6">
              جرّب مسح الفلاتر أو تصفح جميع العائلات العطرية المتاحة.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('الكل');
                setFamily('الكل');
                setQuery('');
              }}
              className="px-6 py-2.5 bg-[#5a2e1f] text-[#fff8f0] text-sm font-ruqaa cursor-pointer"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <section
            aria-label="كتالوج العطور"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-8"
          >
            {filtered.map((perfume) => {
              const defSize = defaultSizeOf(perfume);
              const isAdded = addedId === perfume.id;
              const isFav = wishlistIds.includes(perfume.id);
              return (
                <article
                  key={perfume.id}
                  className="group relative flex flex-col bg-[#fdf6ef] border border-[#5a2e1f]/12 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(90,46,31,0.08)]"
                >
                  {/* Wishlist toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(perfume.id)}
                    aria-label={isFav ? `إزالة ${perfume.name} من المفضلة` : `إضافة ${perfume.name} إلى المفضلة`}
                    className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center bg-[#fbeee3]/85 border border-[#5a2e1f]/14 text-[#5a2e1f] hover:text-[#c8653f] transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFav ? 'fill-[#c8653f] text-[#c8653f]' : ''}`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPerfume(perfume)}
                    className="block w-full text-right cursor-pointer border-0 p-0 bg-transparent"
                  >
                    <PerfumeVisual perfume={perfume} size="card" className="w-full aspect-[4/3]" />
                  </button>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs font-sans-editorial text-[#5a2e1f]/65 mb-2">
                        <span className="truncate">
                          {perfume.family} · {perfume.category}
                        </span>
                        {perfume.tag && (
                          <span className="text-[#c8653f] font-medium shrink-0">{perfume.tag}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectPerfume(perfume)}
                        className="text-right block w-full bg-transparent border-0 p-0 cursor-pointer"
                      >
                        <h2 className="text-2xl font-ruqaa text-[#5a2e1f] group-hover:text-[#c8653f] transition-colors mb-1">
                          {perfume.name}
                        </h2>
                      </button>

                      <p className="text-xs font-sans-editorial text-[#5a2e1f]/75 leading-relaxed line-clamp-2">
                        {perfume.subtitle}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#5a2e1f]/10 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span
                            dir="ltr"
                            className="font-sans-editorial text-base font-semibold tabular-nums text-[#5a2e1f]"
                          >
                            {formatUsd(defSize.priceUsd)}
                          </span>
                          <span className="font-sans-editorial text-xs text-[#5a2e1f]/60">
                            / {defSize.volume}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-sans-editorial text-[#5a2e1f]/60 mt-0.5">
                          <Star className="w-3 h-3 fill-[#c8653f] text-[#c8653f]" />
                          <span className="tabular-nums">{perfume.rating.toFixed(1)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{perfume.reviewCount} تقييم</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onSelectPerfume(perfume)}
                          className="px-3 py-2 text-xs font-sans-editorial text-[#5a2e1f]/80 hover:text-[#5a2e1f] border border-[#5a2e1f]/20 hover:border-[#5a2e1f]/50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          التفاصيل
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(perfume)}
                          className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#5a2e1f] text-[#fff8f0] text-xs font-sans-editorial hover:bg-[#c8653f] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isAdded ? 'أُضيف' : 'أضف'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Quiet Boutique Promise Footer */}
        <footer className="mt-16 pt-8 border-t border-[#5a2e1f]/14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans-editorial text-[#5a2e1f]/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-ruqaa text-lg text-[#5a2e1f] ml-2">إمبرليف</span>
            <span>عينة مجانية 2 مل مع كل طلب بالدولار · استخدم كود</span>
            <strong dir="ltr" className="text-[#c8653f]">
              AUTUMN15
            </strong>
            <span>لخصم 15%</span>
          </div>
          <button
            type="button"
            onClick={onBackToStory}
            className="text-[#5a2e1f] underline underline-offset-4 hover:text-[#c8653f] cursor-pointer bg-transparent border-0 p-0"
          >
            العودة إلى التجربة التفاعلية
          </button>
        </footer>
      </div>
    </div>
  );
}
