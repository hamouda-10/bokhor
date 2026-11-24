import { useEffect, useState, type FormEvent } from 'react';
import { Check, Heart, Minus, Plus, Star, X } from 'lucide-react';
import {
  formatUsd,
  type PerfumeProduct,
  type PerfumeReview,
  type PerfumeSizeOption,
} from '../data/perfumes';
import { PerfumeVisual } from './PerfumeVisual';

interface ProductDetailModalProps {
  perfume: PerfumeProduct | null;
  isFavorite: boolean;
  onToggleFavorite: (perfumeId: string) => void;
  onClose: () => void;
  onAddToCart: (
    perfume: PerfumeProduct,
    size: PerfumeSizeOption,
    quantity: number,
    engraving?: string
  ) => void;
}

export function ProductDetailModal({
  perfume,
  isFavorite,
  onToggleFavorite,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [engraving, setEngraving] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  // User-submitted reviews per perfume
  const [extraReviews, setExtraReviews] = useState<Record<string, PerfumeReview[]>>({});
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [revName, setRevName] = useState('');
  const [revCity, setRevCity] = useState('');
  const [revText, setRevText] = useState('');

  useEffect(() => {
    if (!perfume) return;
    setSelectedIndex(perfume.sizes.length > 1 ? 1 : 0);
    setQuantity(1);
    setEngraving('');
    setJustAdded(false);
    setShowReviewForm(false);
  }, [perfume]);

  useEffect(() => {
    if (!perfume) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [perfume, onClose]);

  if (!perfume) return null;

  const activeSize = perfume.sizes[selectedIndex] ?? perfume.sizes[0];
  const lineTotal = activeSize.priceUsd * quantity;
  const allReviews = [...(extraReviews[perfume.id] ?? []), ...perfume.reviews];

  const handleAdd = () => {
    onAddToCart(perfume, activeSize, quantity, engraving.trim() || undefined);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const handleAddReview = (e: FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revText.trim()) return;
    const newRev: PerfumeReview = {
      author: revName.trim(),
      city: revCity.trim() || 'عميل موثّق',
      rating: 5,
      date: 'اليوم',
      comment: revText.trim(),
    };
    setExtraReviews((prev) => ({
      ...prev,
      [perfume.id]: [newRev, ...(prev[perfume.id] ?? [])],
    }));
    setRevName('');
    setRevCity('');
    setRevText('');
    setShowReviewForm(false);
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#3b1c12]/45 backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1060px] max-h-[92vh] overflow-y-auto bg-[#fbeee3] text-[#5a2e1f] border border-[#5a2e1f]/18 shadow-[0_24px_64px_rgba(59,28,18,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-4 float-left ml-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleFavorite(perfume.id)}
            aria-label={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
            className="w-10 h-10 flex items-center justify-center bg-[#fbeee3]/90 border border-[#5a2e1f]/20 text-[#5a2e1f] hover:border-[#5a2e1f] transition-colors cursor-pointer"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#c8653f] text-[#c8653f]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق تفاصيل العطر"
            className="w-10 h-10 flex items-center justify-center bg-[#fbeee3]/90 border border-[#5a2e1f]/20 text-[#5a2e1f] hover:bg-[#5a2e1f] hover:text-[#fff8f0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 clear-both lg:clear-none">
          {/* Right (start in RTL) Studio Gallery & Olfactory Pyramid */}
          <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col gap-6 border-b lg:border-b-0 lg:border-l border-[#5a2e1f]/12">
            <PerfumeVisual
              perfume={perfume}
              size="detail"
              className="w-full aspect-[4/3] border border-[#5a2e1f]/10"
            />

            {/* Olfactory Pyramid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-ruqaa text-[#c8653f]">الهرم العطري</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#5a2e1f]/12 pt-4">
                <div>
                  <p className="text-xs font-sans-editorial text-[#5a2e1f]/55 mb-1.5">
                    الافتتاحية
                  </p>
                  <p className="text-sm font-sans-editorial text-[#5a2e1f] leading-snug">
                    {perfume.notes.top.join('، ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-sans-editorial text-[#5a2e1f]/55 mb-1.5">
                    قلب العطر
                  </p>
                  <p className="text-sm font-sans-editorial text-[#5a2e1f] leading-snug">
                    {perfume.notes.heart.join('، ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-sans-editorial text-[#5a2e1f]/55 mb-1.5">
                    القاعدة العطرية
                  </p>
                  <p className="text-sm font-sans-editorial text-[#5a2e1f] leading-snug">
                    {perfume.notes.base.join('، ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quiet Performance Specs */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#5a2e1f]/12 text-xs font-sans-editorial">
              <div>
                <p className="text-[#5a2e1f]/55 mb-0.5">التركيز</p>
                <p className="font-medium text-[#5a2e1f]">{perfume.concentration}</p>
              </div>
              <div>
                <p className="text-[#5a2e1f]/55 mb-0.5">الثبات</p>
                <p className="font-medium text-[#5a2e1f]">{perfume.longevity}</p>
              </div>
              <div>
                <p className="text-[#5a2e1f]/55 mb-0.5">الفوحان</p>
                <p className="font-medium text-[#5a2e1f]">{perfume.sillage}</p>
              </div>
            </div>
          </div>

          {/* Left (end in RTL) Contiguous Purchase Module */}
          <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              {/* Unboxed Metadata */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-sans-editorial text-[#5a2e1f]/65">
                <span className="font-ruqaa text-sm text-[#5a2e1f]">{perfume.editionNumber}</span>
                <span aria-hidden="true">·</span>
                <span>{perfume.family}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-[#5a2e1f]">
                  <Star className="w-3 h-3 fill-[#c8653f] text-[#c8653f]" />
                  <span className="tabular-nums">{perfume.rating.toFixed(1)}</span>
                  <span className="text-[#5a2e1f]/60">({perfume.reviewCount + (extraReviews[perfume.id]?.length ?? 0)} تقييم)</span>
                </span>
              </div>

              <div>
                <h2
                  id="pdp-title"
                  className="text-3xl sm:text-4xl font-ruqaa text-[#5a2e1f] leading-snug mb-2"
                >
                  {perfume.name}
                </h2>
                <p className="font-sans-editorial text-sm text-[#c8653f]">{perfume.subtitle}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span
                  dir="ltr"
                  className="font-sans-editorial text-2xl font-semibold tabular-nums text-[#5a2e1f]"
                >
                  {formatUsd(activeSize.priceUsd)}
                </span>
                <span className="font-sans-editorial text-xs text-[#5a2e1f]/65">
                  دولار أمريكي · {activeSize.volume} · متوفر للشحن الفوري
                </span>
              </div>

              <p className="font-sans-editorial text-sm leading-relaxed text-[#5a2e1f]/82">
                {perfume.description}
              </p>

              {/* Volume / Size Selector */}
              <div className="space-y-2.5 pt-1">
                <span className="block text-xs font-sans-editorial text-[#5a2e1f]/70">
                  اختر حجم القارورة
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {perfume.sizes.map((opt, idx) => {
                    const selected = idx === selectedIndex;
                    return (
                      <button
                        key={opt.volume}
                        type="button"
                        onClick={() => setSelectedIndex(idx)}
                        className={`p-3 text-right border transition-colors cursor-pointer ${
                          selected
                            ? 'border-[#5a2e1f] bg-[#f4d2bb]/60'
                            : 'border-[#5a2e1f]/18 bg-[#fdf6ef] hover:border-[#5a2e1f]/50'
                        }`}
                      >
                        <div className="font-sans-editorial text-sm font-medium text-[#5a2e1f]">
                          {opt.volume}
                        </div>
                        <div
                          dir="ltr"
                          className="font-sans-editorial text-xs text-[#5a2e1f]/70 tabular-nums mt-0.5 text-right"
                        >
                          {formatUsd(opt.priceUsd)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Complimentary Bottle Engraving */}
              <div className="space-y-1.5">
                <label className="block text-xs font-sans-editorial text-[#5a2e1f]/70">
                  نقش شخصي مجاني على القارورة (اختياري — حتى 18 حرفاً)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value)}
                  placeholder="مثال: اسمك أو أحرفك الأولى..."
                  className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-sm font-ruqaa text-[#5a2e1f] placeholder:font-sans-editorial placeholder:text-xs placeholder:text-[#5a2e1f]/45"
                />
              </div>

              {/* Quantity & Primary Buy Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="inline-flex items-center justify-between border border-[#5a2e1f]/25 bg-[#fdf6ef] px-2 h-12 sm:w-32 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="تقليل الكمية"
                    className="w-8 h-8 flex items-center justify-center text-[#5a2e1f] hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-sans-editorial text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    aria-label="زيادة الكمية"
                    className="w-8 h-8 flex items-center justify-center text-[#5a2e1f] hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 h-12 px-6 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة إلى الحقيبة</span>
                    </>
                  ) : (
                    <span>
                      أضف إلى الحقيبة —{' '}
                      <span dir="ltr" className="font-sans-editorial text-sm tabular-nums">
                        {formatUsd(lineTotal)}
                      </span>
                    </span>
                  )}
                </button>
              </div>

              <p className="text-xs font-sans-editorial text-[#5a2e1f]/65">
                يشمل عينة استكشاف مجانية 2 مل · شحن سريع مجاني للطلبات فوق $200 USD
              </p>
            </div>

            {/* Client Impressions + Add Review */}
            <div className="pt-5 border-t border-[#5a2e1f]/12 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-ruqaa text-[#5a2e1f]">انطباعات العملاء</h3>
                <button
                  type="button"
                  onClick={() => setShowReviewForm((s) => !s)}
                  className="text-xs font-sans-editorial text-[#c8653f] underline underline-offset-4 cursor-pointer bg-transparent border-0 p-0"
                >
                  {showReviewForm ? 'إلغاء' : 'أضف تقييمك'}
                </button>
              </div>

              {showReviewForm && (
                <form
                  onSubmit={handleAddReview}
                  className="p-3.5 bg-[#fdf6ef] border border-[#5a2e1f]/14 space-y-2.5 font-sans-editorial text-xs"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      type="text"
                      value={revName}
                      onChange={(e) => setRevName(e.target.value)}
                      placeholder="اسمك *"
                      className="px-3 py-2 bg-[#fbeee3]/60 border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                    <input
                      type="text"
                      value={revCity}
                      onChange={(e) => setRevCity(e.target.value)}
                      placeholder="المدينة"
                      className="px-3 py-2 bg-[#fbeee3]/60 border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={revText}
                    onChange={(e) => setRevText(e.target.value)}
                    placeholder="شاركنا تجربتك مع العطر..."
                    className="w-full px-3 py-2 bg-[#fbeee3]/60 border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#5a2e1f] text-[#fff8f0] text-xs cursor-pointer"
                  >
                    نشر التقييم
                  </button>
                </form>
              )}

              {allReviews.map((rev, idx) => (
                <div key={`${rev.author}-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans-editorial">
                    <span className="font-medium text-[#5a2e1f]">
                      {rev.author} · <span className="font-normal text-[#5a2e1f]/60">{rev.city}</span>
                    </span>
                    <span className="text-[#5a2e1f]/50">{rev.date}</span>
                  </div>
                  <p className="text-xs font-sans-editorial leading-relaxed text-[#5a2e1f]/78">
                    «{rev.comment}»
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
