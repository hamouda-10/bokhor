import { useCallback, useEffect, useRef, useState } from 'react';
import { StoryStage, type StoryStageHandle } from './components/StoryStage';
import { ShopOverlay } from './components/ShopOverlay';
import { EditorialViews } from './components/EditorialViews';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, type CartItem, type CompletedOrder } from './components/CartDrawer';
import { computeFrame, type FrameMetrics } from './engine/storyStates';
import { PERFUMES, formatUsd, type PerfumeProduct, type PerfumeSizeOption } from './data/perfumes';

type ActiveView = 'story' | 'blends' | 'harvests' | 'shopping' | 'stores';

const CART_STORAGE_KEY = 'emberleaf_cart_v2';
const ORDERS_STORAGE_KEY = 'emberleaf_orders_v2';
const WISHLIST_STORAGE_KEY = 'emberleaf_wishlist_v1';

interface StoredCartRow {
  perfumeId: string;
  volume: string;
  quantity: number;
  engraving?: string;
}

function loadSavedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: StoredCartRow[] = JSON.parse(raw);
    const items: CartItem[] = [];
    for (const row of parsed) {
      const perfume = PERFUMES.find((p) => p.id === row.perfumeId);
      if (!perfume) continue;
      const size = perfume.sizes.find((s) => s.volume === row.volume) ?? perfume.sizes[0];
      if (row.quantity > 0) {
        items.push({
          key: `${perfume.id}__${size.volume}__${row.engraving ?? ''}`,
          perfume,
          size,
          quantity: row.quantity,
          engraving: row.engraving,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

function loadSavedOrders(): CompletedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function loadSavedWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('story');
  const [ready, setReady] = useState(false);
  const [frameMetrics, setFrameMetrics] = useState<FrameMetrics>(() =>
    computeFrame(
      typeof window !== 'undefined' ? window.innerWidth : 1440,
      typeof window !== 'undefined' ? window.innerHeight : 900
    )
  );
  const [navBottomPx, setNavBottomPx] = useState(72);

  // E-commerce state
  const [selectedPerfume, setSelectedPerfume] = useState<PerfumeProduct | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadSavedCart());
  const [orders, setOrders] = useState<CompletedOrder[]>(() => loadSavedOrders());
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => loadSavedWishlist());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const storyRef = useRef<StoryStageHandle>(null);
  const savedStoryScrollRef = useRef<number>(0);
  const toastTimerRef = useRef<number | null>(null);

  // Measure nav bottom for exact State 7 wordmark clearance
  const measureNav = useCallback(() => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setNavBottomPx(Math.ceil(rect.bottom));
    }
  }, []);

  useEffect(() => {
    measureNav();
    window.addEventListener('resize', measureNav);
    return () => window.removeEventListener('resize', measureNav);
  }, [measureNav, frameMetrics, activeView]);

  // Sync story-mode class on documentElement (never lock scroll in boutique views)
  useEffect(() => {
    if (activeView === 'story') {
      document.documentElement.classList.add('story-mode-active');
    } else {
      document.documentElement.classList.remove('story-mode-active', 'lenis', 'lenis-smooth', 'lenis-stopped');
    }
  }, [activeView]);

  // Persist cart, orders & wishlist
  useEffect(() => {
    try {
      const serializable: StoredCartRow[] = cartItems.map((it) => ({
        perfumeId: it.perfume.id,
        volume: it.size.volume,
        quantity: it.quantity,
        engraving: it.engraving,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // ignore storage errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch {
      // ignore storage errors
    }
  }, [wishlistIds]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  const switchView = (next: ActiveView, jumpState?: number) => {
    if (activeView === 'story' && next !== 'story') {
      savedStoryScrollRef.current = window.scrollY;
    }

    setActiveView(next);

    if (next === 'story') {
      window.requestAnimationFrame(() => {
        if (typeof jumpState === 'number') {
          storyRef.current?.jumpToState(jumpState);
        } else {
          window.scrollTo(0, savedStoryScrollRef.current);
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  const handleAddToCart = (
    perfume: PerfumeProduct,
    size: PerfumeSizeOption,
    quantity = 1,
    engraving?: string
  ) => {
    const key = `${perfume.id}__${size.volume}__${engraving ?? ''}`;
    setCartItems((prev) => {
      const existing = prev.find((it) => it.key === key);
      if (existing) {
        return prev.map((it) =>
          it.key === key ? { ...it, quantity: Math.min(10, it.quantity + quantity) } : it
        );
      }
      return [...prev, { key, perfume, size, quantity, engraving }];
    });
    showToast(`أُضيف «${perfume.name}» (${size.volume} · ${formatUsd(size.priceUsd)}) إلى الحقيبة`);
  };

  const handleToggleWishlist = (perfumeId: string) => {
    setWishlistIds((prev) =>
      prev.includes(perfumeId) ? prev.filter((id) => id !== perfumeId) : [...prev, perfumeId]
    );
  };

  const handleUpdateQty = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((it) => (it.key === key ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0)
    );
  };

  const handleRemoveItem = (key: string) => {
    setCartItems((prev) => prev.filter((it) => it.key !== key));
  };

  const handleCompleteOrder = (order: CompletedOrder) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);
  const isStory = activeView === 'story';

  const navItems: { key: ActiveView; label: string }[] = [
    { key: 'blends', label: 'الخلطات' },
    { key: 'harvests', label: 'المحاصيل' },
    { key: 'shopping', label: 'المتجر' },
    { key: 'stores', label: 'الفروع' },
  ];

  return (
    <div dir="rtl" className="min-h-screen w-full relative">
      {/* Arabic Aref Ruqaa Fixed Top Nav */}
      <nav
        ref={navRef}
        aria-label="التنقل الرئيسي"
        className={`ember-nav ${ready ? 'is-revealed' : 'is-hidden-load'} ${
          isStory
            ? 'bg-transparent border-b border-transparent'
            : 'bg-[#fbeee3]/94 backdrop-blur-md border-b border-[#5a2e1f]/12'
        }`}
        style={{
          paddingLeft: `${frameMetrics.navPadX}px`,
          paddingRight: `${frameMetrics.navPadX}px`,
          paddingTop: `${frameMetrics.navPadTop}px`,
          paddingBottom: isStory ? '8px' : `${Math.max(10, frameMetrics.navPadTop * 0.65)}px`,
        }}
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            switchView('story', 0);
          }}
          className="font-ruqaa text-[#5a2e1f] no-underline whitespace-nowrap shrink-0 flex items-center"
          style={{
            fontSize: `${Math.max(22, frameMetrics.navBrandSize * 1.08)}px`,
            minHeight: '30px',
            lineHeight: 1.15,
          }}
        >
          إمبرليف
        </a>

        <ul
          className="ember-nav-links"
          style={{
            gap: `${frameMetrics.navLinkGap}px`,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeView === item.key;
            return (
              <li key={item.key}>
                <a
                  href={`/${item.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    switchView(item.key);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-ruqaa no-underline whitespace-nowrap shrink-0 inline-flex items-center transition-colors duration-200 ${
                    isActive
                      ? 'text-[#c8653f] underline underline-offset-4'
                      : 'text-[#5a2e1f] hover:text-[#c8653f]'
                  }`}
                  style={{
                    fontSize: `${Math.max(15, frameMetrics.navLinkSize * 1.25)}px`,
                    minHeight: '28px',
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`فتح حقيبة التسوق (${totalCartCount} منتجات)`}
              className="font-ruqaa bg-transparent border-0 p-0 cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1 text-[#5a2e1f] hover:text-[#c8653f] transition-colors duration-200"
              style={{
                fontSize: `${Math.max(15, frameMetrics.navLinkSize * 1.25)}px`,
                minHeight: '28px',
              }}
            >
              <span>الحقيبة</span>
              {totalCartCount > 0 && (
                <span className="font-sans-editorial text-xs font-semibold tabular-nums text-[#c8653f]">
                  ({totalCartCount})
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* Primary 8-State Scroll-Driven Editorial Story Stage */}
      <div className={isStory ? 'block' : 'hidden'}>
        <StoryStage
          ref={storyRef}
          active={isStory && !selectedPerfume && !cartOpen}
          navBottomPx={navBottomPx}
          onFrameMetrics={setFrameMetrics}
          onReadyChange={setReady}
          onSelectPerfume={(p) => setSelectedPerfume(p)}
          onOpenShop={() => switchView('shopping')}
        />
      </div>

      {/* Integrated Luxury Arabic Perfume Boutique (USD $) */}
      {activeView === 'shopping' && (
        <main className="relative z-20">
          <ShopOverlay
            onBackToStory={() => switchView('story')}
            onSelectPerfume={(p) => setSelectedPerfume(p)}
            onQuickAdd={(p, s) => handleAddToCart(p, s, 1)}
            onOpenCart={() => setCartOpen(true)}
            cartCount={totalCartCount}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        </main>
      )}

      {/* BLENDS / HARVESTS / STORES Editorial Views */}
      {(activeView === 'blends' || activeView === 'harvests' || activeView === 'stores') && (
        <main className="relative z-20">
          <EditorialViews
            view={activeView}
            onBackToStory={(jumpState) => switchView('story', jumpState)}
            onOpenShop={() => switchView('shopping')}
            onSelectPerfume={(p) => setSelectedPerfume(p)}
            onQuickAdd={(p, s) => {
              handleAddToCart(p, s, 1);
              setCartOpen(true);
            }}
          />
        </main>
      )}

      {/* Fragrance Detail Modal (PDP) */}
      <ProductDetailModal
        perfume={selectedPerfume}
        isFavorite={selectedPerfume ? wishlistIds.includes(selectedPerfume.id) : false}
        onToggleFavorite={handleToggleWishlist}
        onClose={() => setSelectedPerfume(null)}
        onAddToCart={(p, s, qty, engraving) => {
          handleAddToCart(p, s, qty, engraving);
          setSelectedPerfume(null);
          setCartOpen(true);
        }}
      />

      {/* Slide-Over Shopping Bag & Full USD Checkout Drawer */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        orders={orders}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCompleteOrder={handleCompleteOrder}
        onBrowseShop={() => switchView('shopping')}
      />

      {/* Quick-Add Toast Notification */}
      {toastMsg && !cartOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-40 max-w-sm bg-[#5a2e1f] text-[#fff8f0] px-4 py-3 shadow-[0_12px_32px_rgba(59,28,18,0.28)] flex items-center justify-between gap-4 border border-[#fff8f0]/15"
        >
          <span className="text-xs font-sans-editorial leading-snug">{toastMsg}</span>
          <button
            type="button"
            onClick={() => {
              setToastMsg(null);
              setCartOpen(true);
            }}
            className="shrink-0 text-xs font-ruqaa text-[#f4d2bb] underline underline-offset-4 hover:text-[#fff8f0] cursor-pointer bg-transparent border-0 p-0"
          >
            عرض الحقيبة
          </button>
        </div>
      )}
    </div>
  );
}
