"use client";

import { useState } from "react";

type WishlistItem = {
  id: number;
  category: string;
  name: string;
  price: string;
  img: string;
  badge?: { text: string; color: string };
};

const initialItems: WishlistItem[] = [
  {
    id: 1,
    category: "CERAMICS",
    name: "Emerald Sculpted Vase",
    price: "$125.00",
    badge: { text: "In Stock", color: "bg-[#003527] text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCx9EBjy9dnQC7fvVWGVRvYzJhA2TDqzKpVPA8xG3sb6_fADyl58lY-yd84kR-ryHhlZEdgVRKC6thcVssFcFb_qajlsSfkElhsg7b6ETH2MJSagcwgCRqq4P4uWnK8Dn7oUg54qbwQY5hDtiH2A0b0dfgQdACk3izjUs3SW8qj4KuAMaWGDAKvg_LzGHA7xQe4FG0WN-b08Kw--RuJULr4mX9LgNPKv5ObH-CNiMMwn_8fciXfx8W",
  },
  {
    id: 2,
    category: "AUDIO",
    name: "Signature ANC Headphones",
    price: "$349.00",
    badge: { text: "Limited Edition", color: "bg-[#575e70] text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1E2G9Q7CZGfWbBIqjve2gnKP6FdhA4i5ENVGwE26PAh0uiosn_DDVQlZRSUqg1fN3iQSX9g_AhIaOdBCsKs9rz0ZKRdyDjqsRea5Ez2W_vYqImRlmBvj6bVF9sY6U-VW1YHKwzgBEHHYRGyjzDXz8UtslpQe3mwWgtMBMAlpGCDKZsa91xAPmIlAa3Kw6YvOMT8hx_uZHCAscckh9Id1JaJCWM3W0c0Jmu61NA9lcCbKnyJmQLzhw",
  },
  {
    id: 3,
    category: "ACCESSORIES",
    name: "Horizon Automatic Watch",
    price: "$895.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJoBv0yRWL3F9QCnEBefYdfyQ0uoguZ4BGy_MmsJh8phoSGxsISXwciYSYEQ00jR0t9z1T6OwzrLcdeqz-IIelhtqTO7L2t6sXr30EUU13s1mDFWje_w8WXnjDIMC55EjVYI6XtEmeHzW8KdOR3JyWApgPQE2bWU-LMd00-_Hu94Dzi96p-0MZm3-_7ZhWaS39V9wXmbDHzzweteRx3Q_pqYMbQ3ffUvhF7k5-O1h7LQH32uIkJtLL",
  },
  {
    id: 4,
    category: "LIFESTYLE",
    name: "Botanical Organic Tote",
    price: "$45.00",
    badge: { text: "Eco-Choice", color: "bg-[#282f3b] text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI7R7wgJsopCzXay5EeHLYZ1O1uvleSXuUISO1fcUfY6idTXU7-plmRfwYkM3fzp1AHmrrLAmewbcE41vTcBuofz_sI9T3Q3cDK-ZTe5OWWWalL2VbgACpPP3hSQ3Shloj2bBdp6OY0v-UWJaAsY9aeBh6qN-FkoSuY-ncKE3TVuHe1AbICnoFigX_PTQnY30s0j-8BeRza4dgzQ1aFqgJyEguJQwJqbPfpQmpS3C2SBG-mqYLfhae",
  },
  {
    id: 5,
    category: "HOMEWARE",
    name: "Glass Infusion Carafe",
    price: "$68.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBib9HiwVV3R3OyF1bilZEH_Xu6eOaEFjlf03v5-ONQ1T1R8d8xJaL4_QP57m6N7yZlvlj7U3VWuoX5-ui99r8MICixG8wiIlUX6I9HFWA6foo8ku_a0KdxWfdrScgrGvRiRwrhcWHQzmquvEDUmRb2pQQoNXk568l5c-lQq_9Rcwj-JUMmgUdKV_IEER-vxjlX_u4FxTDG5eyU3aw5790hM16RWLFJkxKlOmblbO_Frtag_5riNukX",
  },
  {
    id: 6,
    category: "TEXTILES",
    name: "Premium Wool Throw",
    price: "$180.00",
    badge: { text: "Low Stock", color: "bg-[#ba1a1a] text-white" },
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEmFVdedkd2nmduciXWJ2vh5BviwjJGBoJBfFbMX1O7ZrKFctOcsXhLxgDZm_hxAADOuj2mLTVXW3WU3p6TH0r-CezEwKeEfJhM8JveChTGxPztQ3sH0-tYmaMxRZ4iYi9DYrLtDwGunDmjkpZl2LAMrSXIMW9SquAsxPqjZ5HUJ_DrkTUdp8mYy0SRuopC70Rchgo7kWkbIWoQOrKV6EKNXaaIcR2DJslnAOzGln9cmvgjD1MXXNJ",
  },
];

export default function WishlistContent() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [removing, setRemoving] = useState<number | null>(null);

  const removeItem = (id: number) => {
    setRemoving(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRemoving(null);
    }, 400);
  };

  return (
    <>
      {/* Summary Header */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <span className="font-semibold text-xs uppercase tracking-widest text-[#003527] mb-2 block">
            Your Curated Collection
          </span>
          <h3 className="text-[#191c1d] font-bold tracking-tight"
            style={{ fontSize: "clamp(36px, 5vw, 48px)", lineHeight: "1.1", letterSpacing: "-0.02em" }}>
            My Saved Items
          </h3>
          <p className="text-[#707974] text-lg mt-2 max-w-2xl">
            You have{" "}
            <span className="font-bold text-[#003527]">{items.length} items</span>{" "}
            saved for later. Ready to bring them home?
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button className="flex items-center gap-1 px-5 py-3 bg-[#e1e3e4] text-[#191c1d] font-semibold text-sm rounded-lg hover:bg-[#d9dadb] transition-colors">
            <span className="material-symbols-outlined text-xl">sort</span>
            Sort By
          </button>
          <button className="flex items-center gap-1 px-5 py-3 bg-[#003527] text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-all shadow-sm">
            <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
            Add All to Cart
          </button>
        </div>
      </section>

      {/* Wishlist Grid — auto-fill like the HTML design */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="material-symbols-outlined text-6xl text-[#bfc9c3] mb-4">favorite_border</span>
          <p className="text-[#707974] text-base">Your wishlist is empty.</p>
        </div>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl overflow-hidden flex flex-col"
              style={{
                transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, opacity 0.4s ease",
                opacity: removing === item.id ? 0 : 1,
                transform: removing === item.id ? "scale(0.9)" : undefined,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0px 12px 40px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Image area */}
              <div className="relative aspect-square group overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-white transition-colors shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                {item.badge && (
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full ${item.badge.color}`}>
                      {item.badge.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col flex-grow">
                <p className="text-xs font-medium text-[#707974] mb-1 uppercase tracking-wider">
                  {item.category}
                </p>
                <h4 className="text-[#191c1d] font-semibold text-2xl leading-tight mb-3">
                  {item.name}
                </h4>
                <p className="text-[#003527] font-semibold text-2xl mb-6">{item.price}</p>
                <button className="mt-auto w-full py-3 bg-[#003527] text-white font-semibold text-sm rounded-lg hover:bg-[#064e3b] transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Bottom Recommendation Section */}
      <section className="mt-20 p-8 md:p-10 bg-[#edeeef] rounded-2xl border border-[#bfc9c3]/30 flex flex-col lg:flex-row items-center gap-10">
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnrSl_L1LL-s2IV4uzcP-2ACFOkYyCj09O9yKrWqF6AWCGcJV6_wg2L6KLPiCHmaeUA8Ht3vLrwM_ezrn_-oFXTs1WU7RD5c7aoI5AWP3qgr8FCW3O0Z3OjbGUg28ehaVmwez0VpV9axiUrDyn4nK4ixS0NohzYn0-Aq6rp0hKTvVjmUQxqfR5f38hwlK-FIeRI66Pv32_ZbV3W3WAGW4uJlN7mmvfv1uOmZZmvoC056kiFubDVlDR"
              alt="Curated Bundle"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-grow">
          <h4 className="text-[#191c1d] font-semibold text-2xl md:text-[30px] mb-3 leading-tight">
            Complete Your Collection
          </h4>
          <p className="text-[#707974] text-base md:text-lg mb-6 max-w-lg">
            Based on your wishlist, you might love our &ldquo;Emerald Minimalism&rdquo; curated bundle.
            Save 15% when you purchase the set.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-3 bg-[#003527] text-white font-semibold text-sm rounded-lg hover:opacity-90 transition-all">
              View Bundle
            </button>
            <button className="px-8 py-3 border border-[#003527] text-[#003527] font-semibold text-sm rounded-lg hover:bg-[#003527]/5 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
