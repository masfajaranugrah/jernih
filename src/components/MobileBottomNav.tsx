"use client";

import Link from "next/link";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCartCount, CART_EVENT, WISHLIST_EVENT } from "@/lib/cart";
import { getToken, getTokenSlug } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";

// ── Cache wishlist count di sessionStorage ──
const WISHLIST_COUNT_KEY = "mh_wishlist_count_cache";
const WISHLIST_COUNT_TTL = 30_000; // 30 detik

function getCachedCount(): number {
  try {
    const raw = sessionStorage.getItem(WISHLIST_COUNT_KEY);
    if (!raw) return 0;
    const { count, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > WISHLIST_COUNT_TTL) {
      sessionStorage.removeItem(WISHLIST_COUNT_KEY);
      return 0;
    }
    return typeof count === "number" ? count : 0;
  } catch {
    return 0;
  }
}

function setCachedCount(count: number) {
  try {
    sessionStorage.setItem(
      WISHLIST_COUNT_KEY,
      JSON.stringify({ count, timestamp: Date.now() })
    );
  } catch { }
}

/* ───────── Modern SVG Icons matching screenshot ───────── */

/** Pentagon Smile Home Icon */
function PentagonHomeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3.2L20.2 9.4C20.7 9.8 21 10.4 20.9 11L19.4 19.5C19.2 20.4 18.4 21 17.5 21H6.5C5.6 21 4.8 20.4 4.6 19.5L3.1 11C3 10.4 3.3 9.8 3.8 9.4L12 3.2Z" />
      <path d="M9.5 14.5C10.5 15.8 13.5 15.8 14.5 14.5" />
    </svg>
  );
}

/** Heart Wishlist Icon */
function HeartOutlineIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12.572L12 20L4.5 12.572C2.5 10.572 2.5 7.372 4.5 5.372C6.5 3.372 9.7 3.372 11.7 5.372L12 5.672L12.3 5.372C14.3 3.372 17.5 3.372 19.5 5.372C21.5 7.372 21.5 10.572 19.5 12.572Z" />
    </svg>
  );
}

/** Package / Orders Box Icon */
function PackageBoxIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3L2.5 7.5V16.5L12 21L21.5 16.5V7.5L12 3Z" />
      <path d="M2.5 7.5L12 12L21.5 7.5" />
      <path d="M12 12V21" />
      <path d="M7.5 5.2L16.8 9.5" />
    </svg>
  );
}

/** Shopping Basket Cart Icon */
function ShoppingBasketIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 9C8 6.8 9.8 5 12 5C14.2 5 16 6.8 16 9" />
      <path d="M3 9H21" />
      <path d="M4.5 9L5.8 18.2C6 19.6 7.2 20.5 8.6 20.5H15.4C16.8 20.5 18 19.6 18.2 18.2L19.5 9" />
      <path d="M9.5 13V17" />
      <path d="M12 13V17" />
      <path d="M14.5 13V17" />
    </svg>
  );
}

/** Wrench / Service Icon */
function WrenchIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

/** Calendar / Rental Icon */
function CalendarRentIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/** User / Profile Icon */
function UserIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function MobileBottomNav({ initialSlug }: { initialSlug?: string | null }) {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuth();

  const nama = (params?.nama as string | undefined) ?? user?.slug ?? initialSlug ?? getTokenSlug();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const router = useRouter();

  // Sembunyikan navbar di halaman detail produk/sewa/jasa
  const isDetailPage =
    (pathname.startsWith("/produk/") && pathname !== "/produk") ||
    (pathname.startsWith("/sewa/") && pathname !== "/sewa") ||
    (pathname.startsWith("/jasa/") && pathname !== "/jasa");

  useEffect(() => {
    setCartCount(getCartCount());
    const syncCart = () => setCartCount(getCartCount());
    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchWishlist() {
      if (!getToken()) return;

      const cached = getCachedCount();
      if (cached > 0) {
        setWishlistCount(cached);
        return;
      }

      try {
        const res = await fetch("/api/wishlist/count", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && typeof data.count === "number") {
          setWishlistCount(data.count);
          setCachedCount(data.count);
        }
      } catch { }
    }
    fetchWishlist();
    window.addEventListener(WISHLIST_EVENT, fetchWishlist);
    return () => {
      cancelled = true;
      window.removeEventListener(WISHLIST_EVENT, fetchWishlist);
    };
  }, []);

  if (isDetailPage) {
    return null;
  }

  const wishlistHref = nama
    ? `/dashboard/pelanggan/${nama}/wishlist`
    : null; // null = butuh login

  const profileHref = nama
    ? `/dashboard/pelanggan/${nama}/profile`
    : null; // null = butuh login

  const isHomeActive = pathname === "/";
  const isProdukActive = pathname === "/produk" || pathname.startsWith("/produk/");
  const isJasaActive = pathname === "/jasa" || pathname.startsWith("/jasa/");
  const isSewaActive = pathname === "/sewa" || pathname.startsWith("/sewa/");
  const isWishlistActive = pathname.includes("wishlist");
  const isCartActive = pathname.startsWith("/keranjang");
  const isProfileActive = pathname.startsWith("/dashboard/pelanggan") && !isWishlistActive;

  const navItems = [
    {
      key: "home",
      href: "/",
      label: "Home",
      icon: <PentagonHomeIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isHomeActive,
      badgeCount: 0,
    },
    {
      key: "produk",
      href: "/produk",
      label: "Produk",
      icon: <PackageBoxIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isProdukActive,
      badgeCount: 0,
    },
    {
      key: "jasa",
      href: "/jasa",
      label: "Jasa",
      icon: <WrenchIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isJasaActive,
      badgeCount: 0,
    },
    {
      key: "sewa",
      href: "/sewa",
      label: "Sewa",
      icon: <CalendarRentIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isSewaActive,
      badgeCount: 0,
    },
    {
      key: "wishlist",
      href: wishlistHref || "#",
      label: "Wishlist",
      icon: <HeartOutlineIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isWishlistActive,
      badgeCount: wishlistCount,
      requireAuth: !wishlistHref,
    },
    {
      key: "cart",
      href: "/keranjang",
      label: "Cart",
      icon: <ShoppingBasketIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isCartActive,
      badgeCount: cartCount,
      requireAuth: false,
    },
    {
      key: "profile",
      href: profileHref || "#",
      label: "Profile",
      icon: <UserIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0" />,
      isActive: isProfileActive,
      badgeCount: 0,
      requireAuth: !profileHref,
    },
  ];

  // ── Login Modal Handler ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login gagal");
      setShowLoginModal(false);
      router.refresh();
      window.location.reload();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <>
      {/* ── Login Modal Overlay ── */}
      {showLoginModal && (
        <div
          className="md:hidden fixed inset-0 z-[200] flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
        >
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLoginModal(false)} />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-sm mx-auto mb-24 rounded-3xl bg-white shadow-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom-6 duration-300">
            {/* Drag handle */}
            <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto mb-5" />

            {/* Header */}
            <div className="mb-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-3">
                <UserIcon className="w-6 h-6 text-[#2563EB]" />
              </div>
              <h2 className="text-lg font-extrabold text-black tracking-tight">Masuk ke Akun</h2>
              <p className="text-xs text-neutral-500 mt-1">Login untuk mengakses fitur lengkap</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition"
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-medium bg-red-50 rounded-lg px-3 py-2">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-xl bg-[#2563EB] text-white font-extrabold text-sm py-3 mt-1 transition hover:bg-[#1D4ED8] active:scale-[0.98] disabled:opacity-60"
              >
                {loginLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <Link href="/dashboard/pelanggan/register" onClick={() => setShowLoginModal(false)} className="text-[#2563EB] font-bold hover:underline">
                Daftar Akun
              </Link>
              <Link href="/dashboard/pelanggan/login" onClick={() => setShowLoginModal(false)} className="text-neutral-400 hover:underline">
                Login lengkap →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Nav ── */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 select-none w-[95vw] max-w-lg px-1 flex justify-center">
        {/* Outer Floating Pill Bar Container */}
        <nav className="w-full bg-white rounded-full px-1.5 h-[60px] shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-slate-100 flex items-center justify-between gap-1 sm:gap-2">
          {navItems.map((item) => {
            const active = item.isActive;
            // Jika butuh auth, gunakan button + modal
            if (item.requireAuth) {
              return (
                <button
                  key={item.key}
                  onClick={() => setShowLoginModal(true)}
                  aria-label={item.label}
                  className={`relative flex items-center transition-all duration-300 ease-out cursor-pointer rounded-full ${
                    active
                      ? "text-white px-3 py-3 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm shadow-md gap-1.5 sm:gap-2"
                      : "text-[#334155] hover:text-black hover:bg-slate-100 p-2 sm:p-2.5"
                  }`}
                  style={active ? { background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" } : {}}
                >
                  <div className="relative flex items-center justify-center shrink-0">
                    {item.icon}
                    {item.badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                        {item.badgeCount > 99 ? "99+" : item.badgeCount}
                      </span>
                    )}
                  </div>
                  {active && (
                    <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap pl-0.5">{item.label}</span>
                  )}
                </button>
              );
            }
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                className={`relative flex items-center transition-all duration-300 ease-out cursor-pointer rounded-full ${active
                  ? "text-white px-3 py-3 sm:px-4 sm:py-3 font-semibold text-xs sm:text-sm shadow-md gap-1.5 sm:gap-2"
                  : "text-[#334155] hover:text-black hover:bg-slate-100 p-2 sm:p-2.5"
                  }`}
                style={active ? { background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 4px 12px rgba(37,99,235,0.35)" } : {}}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  {item.icon}

                  {/* Badge untuk Cart/Wishlist */}
                  {item.badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[9px] font-extrabold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs leading-none">
                      {item.badgeCount > 99 ? "99+" : item.badgeCount}
                    </span>
                  )}
                </div>

                {/* Text label jika item sedang aktif */}
                {active && (
                  <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap pl-0.5">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
