import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Minus,
  Package,
  Plus,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { formatUsd, type PerfumeProduct, type PerfumeSizeOption } from '../data/perfumes';
import { PerfumeVisual } from './PerfumeVisual';

export interface CartItem {
  key: string;
  perfume: PerfumeProduct;
  size: PerfumeSizeOption;
  quantity: number;
  engraving?: string;
}

export interface CompletedOrder {
  orderNumber: string;
  date: string;
  customerName: string;
  email: string;
  address: string;
  paymentMethod: string;
  giftNote?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  items: {
    name: string;
    volume: string;
    quantity: number;
    unitPrice: number;
    engraving?: string;
  }[];
}

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  orders: CompletedOrder[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onCompleteOrder: (order: CompletedOrder) => void;
  onBrowseShop: () => void;
}

type DrawerStep = 'bag' | 'checkout' | 'confirmed' | 'orders';
type PaymentMethod = 'card' | 'cod' | 'express';

const FREE_SHIPPING_THRESHOLD = 200;

export function CartDrawer({
  open,
  items,
  orders,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCompleteOrder,
  onBrowseShop,
}: CartDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('bag');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; rate: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState('');

  // Checkout form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('الإمارات العربية المتحدة');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [formError, setFormError] = useState('');
  const [latestOrder, setLatestOrder] = useState<CompletedOrder | null>(null);

  useEffect(() => {
    if (!open) return;
    if (step === 'confirmed' && items.length > 0) {
      setStep('bag');
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, step, items.length]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.size.priceUsd * item.quantity, 0);
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.rate * 100) / 100 : 0;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    discountedSubtotal === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 15;
  const tax = Math.round(discountedSubtotal * 0.08 * 100) / 100;
  const total = Math.round((discountedSubtotal + shipping + tax) * 100) / 100;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);

  const handleApplyPromo = (e: FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'AUTUMN15' || code === 'خريف15') {
      setAppliedPromo({ code: 'AUTUMN15', rate: 0.15 });
      setPromoMsg('تم تطبيق خصم الخريف بنسبة 15%.');
    } else if (code === 'EMBER10' || code === 'إمبر10') {
      setAppliedPromo({ code: 'EMBER10', rate: 0.1 });
      setPromoMsg('تم تطبيق خصم الأعضاء بنسبة 10%.');
    } else {
      setPromoMsg('كود غير صالح. جرّب AUTUMN15 للحصول على خصم 15%.');
    }
  };

  const formatCardInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSubmitCheckout = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !fullName.trim() ||
      !email.trim() ||
      !address.trim() ||
      !city.trim() ||
      !postalCode.trim()
    ) {
      setFormError('يرجى استكمال جميع حقول عنوان الشحن المطلوبة.');
      return;
    }

    if (paymentMethod === 'card') {
      if (
        cardNumber.replace(/\s/g, '').length < 12 ||
        cardExpiry.length < 4 ||
        cardCvc.length < 3
      ) {
        setFormError('يرجى إدخال بيانات البطاقة بشكل صحيح أو اختيار الدفع عند الاستلام.');
        return;
      }
    }

    const orderNum = `EL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CompletedOrder = {
      orderNumber: orderNum,
      date: new Date().toLocaleDateString('ar-EG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customerName: fullName.trim(),
      email: email.trim(),
      address: `${address.trim()}، ${city.trim()}، ${postalCode.trim()}، ${country}`,
      paymentMethod:
        paymentMethod === 'card'
          ? `بطاقة بنكية تنتهي بـ ${cardNumber.replace(/\s/g, '').slice(-4)}`
          : paymentMethod === 'cod'
            ? 'الدفع عند الاستلام (بالدولار USD)'
            : 'المحفظة الرقمية السريعة',
      giftNote: giftNote.trim() || undefined,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      items: items.map((it) => ({
        name: it.perfume.name,
        volume: it.size.volume,
        quantity: it.quantity,
        unitPrice: it.size.priceUsd,
        engraving: it.engraving,
      })),
    };

    setLatestOrder(newOrder);
    onCompleteOrder(newOrder);
    setAppliedPromo(null);
    setPromoInput('');
    setPromoMsg('');
    setGiftNote('');
    setStep('confirmed');
  };

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="حقيبة التسوق وإتمام الطلب"
      className="fixed inset-0 z-50 flex justify-end bg-[#3b1c12]/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[490px] h-full bg-[#fbeee3] text-[#5a2e1f] border-r border-[#5a2e1f]/16 flex flex-col shadow-[16px_0_48px_rgba(59,28,18,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#5a2e1f]/14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="العودة للحقيبة"
                className="p-1 text-[#5a2e1f] hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-2xl font-ruqaa text-[#5a2e1f]">
              {step === 'bag' && 'حقيبة التسوق'}
              {step === 'checkout' && 'إتمام الطلب (USD)'}
              {step === 'confirmed' && 'تم تأكيد طلبك'}
              {step === 'orders' && 'سجل الطلبات'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {orders.length > 0 && step !== 'orders' && (
              <button
                type="button"
                onClick={() => setStep('orders')}
                className="text-xs font-sans-editorial text-[#5a2e1f]/75 hover:text-[#c8653f] underline underline-offset-4 cursor-pointer bg-transparent border-0"
              >
                طلباتي ({orders.length})
              </button>
            )}
            {step === 'orders' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                className="text-xs font-sans-editorial text-[#5a2e1f]/75 hover:text-[#c8653f] underline underline-offset-4 cursor-pointer bg-transparent border-0"
              >
                العودة للحقيبة
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق الحقيبة"
              className="w-9 h-9 flex items-center justify-center border border-[#5a2e1f]/18 text-[#5a2e1f] hover:bg-[#5a2e1f] hover:text-[#fff8f0] transition-colors cursor-pointer bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'bag' && (
            <>
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <p className="text-3xl font-ruqaa text-[#5a2e1f]">حقيبة التسوق فارغة</p>
                  <p className="text-sm font-sans-editorial text-[#5a2e1f]/70 max-w-xs mx-auto">
                    استكشف تشكيلة عطور إمبرليف الخريفية وخلاصات الإكستريت المسعّرة بالدولار الأمريكي.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBrowseShop();
                    }}
                    className="mt-2 px-6 py-3 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
                  >
                    تصفّح العطور الآن
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Complimentary shipping meter */}
                  <div className="p-3.5 bg-[#fdf6ef] border border-[#5a2e1f]/12 space-y-2">
                    <div className="flex items-center justify-between text-xs font-sans-editorial">
                      <span className="inline-flex items-center gap-1.5 text-[#5a2e1f]">
                        <Truck className="w-3.5 h-3.5 text-[#c8653f]" />
                        {remainingForFreeShipping === 0 ? (
                          <span>تهانينا! حصلت على الشحن السريع المجاني</span>
                        ) : (
                          <span>
                            أضف{' '}
                            <strong dir="ltr" className="tabular-nums">
                              {formatUsd(remainingForFreeShipping)}
                            </strong>{' '}
                            للحصول على شحن سريع مجاني
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#5a2e1f]/12 overflow-hidden">
                      <div
                        className="h-full bg-[#c8653f] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <ul className="divide-y divide-[#5a2e1f]/12 list-none m-0 p-0">
                    {items.map((item) => (
                      <li key={item.key} className="py-4 flex gap-4">
                        <PerfumeVisual
                          perfume={item.perfume}
                          size="thumb"
                          className="w-20 h-20 border border-[#5a2e1f]/10"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-lg font-ruqaa text-[#5a2e1f] truncate">
                                {item.perfume.name}
                              </h3>
                              <p className="text-xs font-sans-editorial text-[#5a2e1f]/65">
                                {item.size.volume} ·{' '}
                                <span dir="ltr">{formatUsd(item.size.priceUsd)}</span> للقطعة
                              </p>
                              {item.engraving && (
                                <p className="text-[11px] font-sans-editorial text-[#c8653f] mt-0.5">
                                  نقش مخصّص: «{item.engraving}»
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.key)}
                              aria-label={`إزالة ${item.perfume.name}`}
                              className="p-1 text-[#5a2e1f]/50 hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="inline-flex items-center border border-[#5a2e1f]/20 bg-[#fdf6ef]">
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.key, -1)}
                                aria-label="تقليل الكمية"
                                className="w-7 h-7 flex items-center justify-center text-[#5a2e1f] hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center font-sans-editorial text-xs tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.key, 1)}
                                aria-label="زيادة الكمية"
                                className="w-7 h-7 flex items-center justify-center text-[#5a2e1f] hover:text-[#c8653f] cursor-pointer bg-transparent border-0"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span
                              dir="ltr"
                              className="font-sans-editorial text-sm font-semibold tabular-nums text-[#5a2e1f]"
                            >
                              {formatUsd(item.size.priceUsd * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Promo Code */}
                  <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        placeholder="كود الخصم (جرّب AUTUMN15)"
                        className="flex-1 px-3 py-2 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-xs font-sans-editorial text-[#5a2e1f] placeholder:text-[#5a2e1f]/45"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 border border-[#5a2e1f] text-xs font-sans-editorial text-[#5a2e1f] hover:bg-[#5a2e1f] hover:text-[#fff8f0] transition-colors cursor-pointer bg-transparent"
                      >
                        تطبيق
                      </button>
                    </div>
                    {promoMsg && (
                      <p className="text-xs font-sans-editorial text-[#c8653f]">{promoMsg}</p>
                    )}
                  </form>
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form
              id="emberleaf-checkout-form"
              onSubmit={handleSubmitCheckout}
              className="space-y-5"
            >
              {formError && (
                <div className="p-3 bg-[#c8653f]/12 border border-[#c8653f]/40 text-xs font-sans-editorial text-[#5a2e1f]">
                  {formError}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-base font-ruqaa text-[#c8653f]">١. عنوان الشحن والتوصيل</h3>
                <div className="grid grid-cols-1 gap-3 font-sans-editorial text-sm">
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="الاسم الكامل *"
                    className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني *"
                      className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="رقم الهاتف"
                      className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                  </div>
                  <input
                    required
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="الشارع ورقم المبنى والشقة *"
                    className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="المدينة *"
                      className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                    <input
                      required
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="الرمز البريدي *"
                      className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                    />
                  </div>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    aria-label="الدولة"
                    className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f]"
                  >
                    <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة</option>
                    <option value="المملكة العربية السعودية">المملكة العربية السعودية</option>
                    <option value="مصر">مصر</option>
                    <option value="الكويت">الكويت</option>
                    <option value="قطر">قطر</option>
                    <option value="الأردن">الأردن</option>
                    <option value="الولايات المتحدة">الولايات المتحدة</option>
                    <option value="فرنسا">فرنسا</option>
                    <option value="المملكة المتحدة">المملكة المتحدة</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-base font-ruqaa text-[#c8653f]">
                  ٢. وسيلة الدفع (بالدولار الأمريكي USD)
                </h3>
                <div className="grid grid-cols-3 gap-2 font-sans-editorial text-xs">
                  {(
                    [
                      { id: 'card', label: 'بطاقة بنكية' },
                      { id: 'cod', label: 'عند الاستلام' },
                      { id: 'express', label: 'دفع سريع' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-2.5 px-2 border text-center cursor-pointer transition-colors ${
                        paymentMethod === m.id
                          ? 'border-[#5a2e1f] bg-[#f4d2bb]/60 text-[#5a2e1f] font-medium'
                          : 'border-[#5a2e1f]/18 bg-[#fdf6ef] text-[#5a2e1f]/75'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 pt-1 font-sans-editorial text-sm">
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-[#5a2e1f]/45 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        dir="ltr"
                        type="text"
                        inputMode="numeric"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full pr-9 pl-3 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f] tabular-nums text-left"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        dir="ltr"
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f] tabular-nums text-left"
                      />
                      <input
                        dir="ltr"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) =>
                          setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        placeholder="CVC"
                        className="w-full px-3.5 py-2.5 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-[#5a2e1f] tabular-nums text-left"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <p className="p-3 bg-[#fdf6ef] border border-[#5a2e1f]/14 text-xs font-sans-editorial text-[#5a2e1f]/80">
                    ادفع{' '}
                    <strong dir="ltr" className="tabular-nums">
                      {formatUsd(total)} USD
                    </strong>{' '}
                    نقداً عند استلام الشحنة من المندوب، شاملة التغليف الفاخر المختوم بالشمع.
                  </p>
                )}

                {paymentMethod === 'express' && (
                  <p className="p-3 bg-[#fdf6ef] border border-[#5a2e1f]/14 text-xs font-sans-editorial text-[#5a2e1f]/80">
                    دفع إلكتروني مشفّر وفوري بالدولار الأمريكي عبر المحفظة السريعة.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-sans-editorial text-[#5a2e1f]/70">
                  بطاقة إهداء مختومة بشمع الطين مجاناً (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="اكتب رسالة إهداء خاصة تُرفق داخل الصندوق..."
                  className="w-full px-3.5 py-2 bg-[#fdf6ef] border border-[#5a2e1f]/18 text-xs font-sans-editorial text-[#5a2e1f]"
                />
              </div>
            </form>
          )}

          {step === 'confirmed' && latestOrder && (
            <div className="py-6 space-y-6">
              <div className="p-5 bg-[#fdf6ef] border border-[#5a2e1f]/16 space-y-3">
                <div className="flex items-center gap-2.5 text-[#5a2e1f]">
                  <CheckCircle2 className="w-5 h-5 text-[#c8653f]" />
                  <h3 className="text-xl font-ruqaa">
                    تم تأكيد الطلب{' '}
                    <span dir="ltr" className="font-sans-editorial text-base">
                      #{latestOrder.orderNumber}
                    </span>
                  </h3>
                </div>
                <p className="text-xs font-sans-editorial text-[#5a2e1f]/75 leading-relaxed">
                  جاري تجهيز الشحنة بعناية — تم إرسال نسخة من الفاتورة إلى{' '}
                  <strong>{latestOrder.email}</strong>. تُغلَّف قواريرك يدوياً بالكتان الدافئ وختم إمبرليف.
                </p>
              </div>

              <div className="space-y-3 text-xs font-sans-editorial">
                <div className="flex justify-between pb-2 border-b border-[#5a2e1f]/12">
                  <span className="text-[#5a2e1f]/60">المستلم</span>
                  <span className="font-medium text-[#5a2e1f]">{latestOrder.customerName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#5a2e1f]/12 gap-4">
                  <span className="text-[#5a2e1f]/60 shrink-0">عنوان التوصيل</span>
                  <span className="text-left text-[#5a2e1f]">{latestOrder.address}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#5a2e1f]/12">
                  <span className="text-[#5a2e1f]/60">طريقة الدفع</span>
                  <span className="text-[#5a2e1f]">{latestOrder.paymentMethod}</span>
                </div>
                {latestOrder.giftNote && (
                  <div className="flex justify-between pb-2 border-b border-[#5a2e1f]/12 gap-4">
                    <span className="text-[#5a2e1f]/60 shrink-0">رسالة الإهداء</span>
                    <span className="text-left text-[#c8653f]">«{latestOrder.giftNote}»</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-ruqaa text-[#5a2e1f]/75">تفاصيل المنتجات</p>
                {latestOrder.items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-xs font-sans-editorial text-[#5a2e1f]"
                  >
                    <span>
                      {it.quantity} × {it.name} ({it.volume})
                      {it.engraving ? ` — نقش: ${it.engraving}` : ''}
                    </span>
                    <span dir="ltr" className="tabular-nums font-medium">
                      {formatUsd(it.unitPrice * it.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-[#5a2e1f]/14 text-sm font-sans-editorial font-semibold">
                  <span>الإجمالي المدفوع (USD)</span>
                  <span dir="ltr" className="tabular-nums">
                    {formatUsd(latestOrder.total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('bag');
                  onClose();
                }}
                className="w-full py-3 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
              >
                متابعة تصفح إمبرليف
              </button>
            </div>
          )}

          {step === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-sm font-sans-editorial text-[#5a2e1f]/70 py-10 text-center">
                  لا توجد طلبات مكتملة حتى الآن.
                </p>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="p-4 bg-[#fdf6ef] border border-[#5a2e1f]/14 space-y-2 text-xs font-sans-editorial"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#5a2e1f]">
                        <Package className="w-3.5 h-3.5 text-[#c8653f]" />
                        طلب <span dir="ltr">#{ord.orderNumber}</span>
                      </span>
                      <span className="text-[#5a2e1f]/60">{ord.date}</span>
                    </div>
                    <p className="text-[#5a2e1f]/75">{ord.address}</p>
                    <p className="text-[#c8653f]">الحالة: مؤكد · جاري التجهيز للشحن</p>
                    <div className="pt-2 border-t border-[#5a2e1f]/10 flex items-center justify-between">
                      <span>{ord.items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
                      <span dir="ltr" className="font-semibold tabular-nums text-[#5a2e1f]">
                        {formatUsd(ord.total)} USD
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sticky Footer Totals & CTA */}
        {(step === 'bag' || step === 'checkout') && items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#5a2e1f]/14 bg-[#f7e5d6] space-y-3">
            <div className="space-y-1.5 text-xs font-sans-editorial text-[#5a2e1f]/80">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span dir="ltr" className="tabular-nums">
                  {formatUsd(subtotal)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#c8653f]">
                  <span>الخصم ({appliedPromo?.code})</span>
                  <span dir="ltr" className="tabular-nums">
                    −{formatUsd(discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>الشحن السريع</span>
                <span dir="ltr" className="tabular-nums">
                  {shipping === 0 ? 'مجاني' : formatUsd(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة التقديرية (8%)</span>
                <span dir="ltr" className="tabular-nums">
                  {formatUsd(tax)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#5a2e1f]/14 text-sm font-semibold text-[#5a2e1f]">
                <span>الإجمالي (USD)</span>
                <span dir="ltr" className="tabular-nums">
                  {formatUsd(total)}
                </span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3.5 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
              >
                المتابعة لإتمام الطلب —{' '}
                <span dir="ltr" className="font-sans-editorial text-sm">
                  {formatUsd(total)}
                </span>
              </button>
            ) : (
              <button
                type="submit"
                form="emberleaf-checkout-form"
                className="w-full py-3.5 bg-[#5a2e1f] text-[#fff8f0] text-base font-ruqaa hover:bg-[#c8653f] transition-colors cursor-pointer"
              >
                تأكيد الطلب والدفع —{' '}
                <span dir="ltr" className="font-sans-editorial text-sm">
                  {formatUsd(total)} USD
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
