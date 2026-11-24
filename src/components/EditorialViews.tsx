import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, MapPin, Phone } from 'lucide-react';
import { SPRITES, getSpriteBgStyle } from '../data/emberleafAssets';
import {
  BOUTIQUES,
  HARVESTS,
  PERFUMES,
  formatUsd,
  type PerfumeProduct,
  type PerfumeSizeOption,
} from '../data/perfumes';
import { PerfumeVisual } from './PerfumeVisual';

interface EditorialViewsProps {
  view: 'blends' | 'harvests' | 'stores';
  onBackToStory: (jumpState?: number) => void;
  onOpenShop: () => void;
  onSelectPerfume: (perfume: PerfumeProduct) => void;
  onQuickAdd: (perfume: PerfumeProduct, size: PerfumeSizeOption) => void;
}

export function EditorialViews({
  view,
  onBackToStory,
  onOpenShop,
  onSelectPerfume,
  onQuickAdd,
}: EditorialViewsProps) {
  // Interactive Scent Matcher state (BLENDS)
  const [mood, setMood] = useState<'warm' | 'crisp' | 'floral'>('warm');
  const [intensity, setIntensity] = useState<'edp' | 'extrait'>('edp');

  // Private consultation booking state (STORES)
  const [selectedCity, setSelectedCity] = useState(BOUTIQUES[0].city);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);

  const recommendedPerfume = (() => {
    if (mood === 'warm' && intensity === 'extrait') return PERFUMES[3]; // راتنج الاعتدال
    if (mood === 'warm') return PERFUMES[0]; // جمر الطين
    if (mood === 'floral' && intensity === 'extrait') return PERFUMES[5]; // إكسير الورد والقرفة
    if (mood === 'floral') return PERFUMES[2]; // ورد المشمش الدمشقي
    if (mood === 'crisp' && intensity === 'extrait') return PERFUMES[4]; // تلال الخريف المعتقة
    return PERFUMES[1]; // هيل العاج
  })();

  const handleBookConsultation = (e: FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;
    setBookingConfirmed(
      `تم تأكيد حجزك باسم ${guestName.trim()} في صالون إمبرليف ${selectedCity}${bookingDate ? ` بتاريخ ${bookingDate}` : ''}. أُرسلت تفاصيل الموعد إلى ${guestEmail.trim()}.`
    );
    setGuestName('');
    setGuestEmail('');
    setBookingDate('');
  };

  return (
    <div dir="rtl" className="min-h-screen w-full bg-[#fbeee3] text-[#5a2e1f] pt-24 md:pt-28 pb-24">
      <div className="max-w-[1220px] mx-auto px-5 sm:px-8 lg:px-10">
        {/* Return Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#5a2e1f]/14">
          <button
            type="button"
            onClick={() => onBackToStory()}
            className="inline-flex items-center gap-2 text-base font-ruqaa text-[#5a2e1f]/85 hover:text-[#c8653f] transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى قصة الخريف</span>
          </button>

          <button
            type="button"
            onClick={onOpenShop}
            className="inline-flex items-center gap-2 text-base font-ruqaa text-[#c8653f] hover:text-[#5a2e1f] transition-colors cursor-pointer bg-transparent border-0 p-0"
          >
            <span>تسوّق جميع العطور (USD)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* BLENDS VIEW */}
        {view === 'blends' && (
          <div className="space-y-14 pt-10">
            <header className="max-w-2xl space-y-4">
              <p className="text-base font-ruqaa text-[#c8653f]">أتيليه الخلطات العطرية</p>
              <h1
                className="text-4xl sm:text-5xl leading-[1.24] font-ruqaa text-[#5a2e1f]"
                style={{ textWrap: 'balance' }}
              >
                ستة مكونات خريفية تُقطَّر في خلاصة واحدة
              </h1>
              <p className="font-sans-editorial text-[15px] leading-relaxed text-[#5a2e1f]/80">
                يبدأ كل عطر في دار إمبرليف داخل قمع التقطير الزجاجي حيث تلتقي أوراق الشاي الأسود والتوابل وقشور البرتقال وبراعم الورد وراتنج العنبر في قطرة ذهبية نقية.
              </p>
              <button
                type="button"
                onClick={() => onBackToStory(3)}
                className="inline-flex items-center gap-2 pt-1 text-sm font-sans-editorial text-[#5a2e1f] underline underline-offset-4 hover:text-[#c8653f] cursor-pointer bg-transparent border-0 p-0"
              >
                <span>شاهد مشهد الخلطات داخل قمع التقطير في القصة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </header>

            {/* Interactive Autumn Scent Finder */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-[#f4d2bb]/45 border border-[#5a2e1f]/14 p-6 sm:p-8">
              <div className="lg:col-span-6 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-ruqaa text-[#c8653f] mb-1">
                      مستشار العطور الشخصي
                    </p>
                    <h2 className="text-3xl font-ruqaa text-[#5a2e1f]">
                      اكتشف عطرك الخريفي المثالي
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-sans-editorial text-[#5a2e1f]/70">
                      ١. اختر النغمة الأقرب لذوقك
                    </p>
                    <div className="grid grid-cols-3 gap-2 font-sans-editorial text-xs">
                      {(
                        [
                          { id: 'warm', label: 'شاي مدخّن وعنبر' },
                          { id: 'crisp', label: 'هيل أخضر وحمضيات' },
                          { id: 'floral', label: 'ورد مجفف وتوابل' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setMood(opt.id)}
                          className={`p-3 border text-right transition-colors cursor-pointer ${
                            mood === opt.id
                              ? 'border-[#5a2e1f] bg-[#5a2e1f] text-[#fff8f0]'
                              : 'border-[#5a2e1f]/20 bg-[#fdf6ef] text-[#5a2e1f]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-sans-editorial text-[#5a2e1f]/70">
                      ٢. اختر درجة التركيز والثبات
                    </p>
                    <div className="grid grid-cols-2 gap-2 font-sans-editorial text-xs">
                      {(
                        [
                          { id: 'edp', label: 'أو دو بارفان · فوحان متوازن' },
                          { id: 'extrait', label: 'إكستريت دو بارفان · عمق راتنجي' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setIntensity(opt.id)}
                          className={`p-3 border text-right transition-colors cursor-pointer ${
                            intensity === opt.id
                              ? 'border-[#5a2e1f] bg-[#5a2e1f] text-[#fff8f0]'
                              : 'border-[#5a2e1f]/20 bg-[#fdf6ef] text-[#5a2e1f]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#5a2e1f]/14 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-sans-editorial text-[#5a2e1f]/60">
                      الخلطة المقترحة لك
                    </p>
                    <p className="text-2xl font-ruqaa text-[#5a2e1f]">
                      {recommendedPerfume.name} ·{' '}
                      <span
                        dir="ltr"
                        className="font-sans-editorial text-base tabular-nums font-semibold"
                      >
                        {formatUsd(
                          recommendedPerfume.sizes[1]?.priceUsd ??
                            recommendedPerfume.sizes[0].priceUsd
                        )}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onSelectPerfume(recommendedPerfume)}
                      className="px-4 py-2.5 border border-[#5a2e1f] text-xs font-sans-editorial text-[#5a2e1f] hover:bg-[#5a2e1f]/5 cursor-pointer bg-transparent"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onQuickAdd(
                          recommendedPerfume,
                          recommendedPerfume.sizes[1] ?? recommendedPerfume.sizes[0]
                        )
                      }
                      className="px-5 py-2.5 bg-[#5a2e1f] text-[#fff8f0] text-sm font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
                    >
                      أضف إلى الحقيبة
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectPerfume(recommendedPerfume)}
                className="lg:col-span-6 group block w-full border-0 p-0 bg-transparent cursor-pointer"
              >
                <PerfumeVisual
                  perfume={recommendedPerfume}
                  size="detail"
                  className="w-full h-full min-h-[280px] border border-[#5a2e1f]/12"
                />
              </button>
            </section>

            {/* The 3 Core Vessels Line-up */}
            <section className="space-y-6">
              <h2 className="text-3xl font-ruqaa text-[#5a2e1f]">ثلاثية القوارير الأيقونية</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[PERFUMES[1], PERFUMES[0], PERFUMES[2]].map((p) => (
                  <article
                    key={p.id}
                    className="group bg-[#fdf6ef] border border-[#5a2e1f]/12 flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectPerfume(p)}
                      className="block w-full p-0 border-0 bg-transparent cursor-pointer"
                    >
                      <PerfumeVisual perfume={p} size="card" className="w-full aspect-[4/3]" />
                    </button>
                    <div className="p-5 space-y-2">
                      <p className="text-xs font-sans-editorial text-[#5a2e1f]/60">
                        {p.editionNumber} · {p.concentration}
                      </p>
                      <h3 className="text-2xl font-ruqaa text-[#5a2e1f]">{p.name}</h3>
                      <p className="text-xs font-sans-editorial text-[#5a2e1f]/75 leading-relaxed">
                        {p.subtitle}
                      </p>
                      <div className="pt-3 flex items-center justify-between">
                        <span
                          dir="ltr"
                          className="font-sans-editorial text-sm font-semibold tabular-nums"
                        >
                          {formatUsd(p.sizes[1].priceUsd)} / 50 ml
                        </span>
                        <button
                          type="button"
                          onClick={() => onSelectPerfume(p)}
                          className="text-sm font-ruqaa text-[#c8653f] hover:text-[#5a2e1f] cursor-pointer bg-transparent border-0 p-0"
                        >
                          تسوّق القارورة ←
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* HARVESTS VIEW */}
        {view === 'harvests' && (
          <div className="space-y-12 pt-10">
            <header className="max-w-2xl space-y-4">
              <p className="text-base font-ruqaa text-[#c8653f]">الأصل والمحاصيل الخريفية</p>
              <h1
                className="text-4xl sm:text-5xl leading-[1.24] font-ruqaa text-[#5a2e1f]"
                style={{ textWrap: 'balance' }}
              >
                مواد خام نباتية قُطفت عند أول صقيع
              </h1>
              <p className="font-sans-editorial text-[15px] leading-relaxed text-[#5a2e1f]/80">
                نختار كل مكوّن في لوحتنا السداسية مباشرة من مزارع الحصاد الواحد ونستخلص زيوته بأحدث طرق النقع البطيء والتقطير الفائق النقاء.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {HARVESTS.map((h, i) => {
                const spec = SPRITES[h.sprite];
                const linked = PERFUMES.find((p) => p.id === h.featuredPerfumeId) ?? PERFUMES[0];
                return (
                  <article
                    key={h.id}
                    className="bg-[#fdf6ef] border border-[#5a2e1f]/12 flex flex-col justify-between p-6 space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-sans-editorial text-[#5a2e1f]/60">
                        <span>٠{i + 1}. المحصول</span>
                        <span>{h.origin}</span>
                      </div>

                      <div className="h-44 flex items-center justify-center bg-[#f4d2bb]/40 border border-[#5a2e1f]/8 p-6">
                        <div
                          aria-hidden="true"
                          style={{
                            ...getSpriteBgStyle(h.sprite),
                            width: '132px',
                            aspectRatio: `${spec.w} / ${spec.h}`,
                            filter: 'drop-shadow(0 10px 18px rgba(90,46,31,0.16))',
                          }}
                        />
                      </div>

                      <div>
                        <h2 className="text-2xl font-ruqaa text-[#5a2e1f] mb-1">{h.name}</h2>
                        <p className="text-xs font-sans-editorial text-[#c8653f] mb-3">
                          {h.season} · {h.extraction}
                        </p>
                        <p className="text-xs font-sans-editorial leading-relaxed text-[#5a2e1f]/80">
                          {h.story}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#5a2e1f]/12 flex items-center justify-between gap-2 text-xs font-sans-editorial">
                      <span className="text-[#5a2e1f]/65 truncate">{h.aromaNote}</span>
                      <button
                        type="button"
                        onClick={() => onSelectPerfume(linked)}
                        className="shrink-0 text-[#5a2e1f] underline underline-offset-4 hover:text-[#c8653f] cursor-pointer bg-transparent border-0 p-0"
                      >
                        تسوّق {linked.name}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* STORES VIEW */}
        {view === 'stores' && (
          <div className="space-y-14 pt-10">
            <header className="max-w-2xl space-y-4">
              <p className="text-base font-ruqaa text-[#c8653f]">دور العطور وصالونات التذوّق</p>
              <h1
                className="text-4xl sm:text-5xl leading-[1.24] font-ruqaa text-[#5a2e1f]"
                style={{ textWrap: 'balance' }}
              >
                تفضل بزيارة صالونات إمبرليف
              </h1>
              <p className="font-sans-editorial text-[15px] leading-relaxed text-[#5a2e1f]/80">
                عش تجربة العطور المصبوبة فوق حجر الترافرتين الدافئ إلى جانب ضيافة الشاي الخريفي المحمّص وخدمة النقش الشخصي على القوارير الخزفية.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              {BOUTIQUES.map((store) => (
                <article
                  key={store.id}
                  className="bg-[#fdf6ef] border border-[#5a2e1f]/12 p-6 sm:p-7 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between gap-2 border-b border-[#5a2e1f]/12 pb-3">
                      <h2 className="text-3xl font-ruqaa text-[#5a2e1f]">{store.city}</h2>
                      <span className="text-xs font-sans-editorial text-[#c8653f]">
                        {store.district}
                      </span>
                    </div>

                    <p className="text-sm font-sans-editorial text-[#5a2e1f]/80">
                      {store.architecturalNote}
                    </p>

                    <div className="space-y-2 text-xs font-sans-editorial text-[#5a2e1f]/75">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#c8653f] shrink-0 mt-0.5" />
                        <span>{store.address}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#c8653f] shrink-0" />
                        <span>{store.hours}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#c8653f] shrink-0" />
                        <span dir="ltr" className="tabular-nums">
                          {store.phone}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#5a2e1f]/12 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] font-sans-editorial text-[#5a2e1f]/65">
                      {store.services.join(' · ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity(store.city);
                        setBookingConfirmed(null);
                      }}
                      className="text-xs font-sans-editorial text-[#5a2e1f] underline underline-offset-4 hover:text-[#c8653f] cursor-pointer bg-transparent border-0 p-0"
                    >
                      اختر هذا الفرع للحجز
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Working Private Fragrance Consultation Booking Form */}
            <section className="bg-[#f4d2bb]/45 border border-[#5a2e1f]/14 p-6 sm:p-8 max-w-2xl">
              <p className="text-sm font-ruqaa text-[#c8653f] mb-1">موعد استشارة خاصة</p>
              <h2 className="text-3xl font-ruqaa text-[#5a2e1f] mb-2">
                احجز جلسة استشارة عطرية مجانية
              </h2>
              <p className="text-xs font-sans-editorial text-[#5a2e1f]/75 mb-6">
                جلسة فردية لمدة 45 دقيقة مع خبير العطور لدينا تشمل ضيافة الشاي الخريفي وتصميم توقيعك العطري الخاص.
              </p>

              {bookingConfirmed ? (
                <div className="p-4 bg-[#fdf6ef] border border-[#5a2e1f]/18 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#c8653f] shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-sans-editorial text-[#5a2e1f]">
                      {bookingConfirmed}
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookingConfirmed(null)}
                      className="text-xs font-sans-editorial underline underline-offset-4 text-[#c8653f] cursor-pointer bg-transparent border-0 p-0"
                    >
                      حجز موعد آخر
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleBookConsultation}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans-editorial text-sm"
                >
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    aria-label="اختر الفرع"
                    className="px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  >
                    {BOUTIQUES.map((b) => (
                      <option key={b.id} value={b.city}>
                        إمبرليف {b.city} — {b.district}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    aria-label="التاريخ المفضل"
                    className="px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <input
                    required
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="الاسم الكامل *"
                    className="px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <input
                    required
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="البريد الإلكتروني *"
                    className="px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="px-7 py-3 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
                    >
                      تأكيد موعد الاستشارة
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
