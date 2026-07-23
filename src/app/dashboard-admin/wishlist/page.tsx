"use client";

import Image from "next/image";
import { useState } from "react";

const initialProducts = [
 {
  id: 1,
  name: "Emerald Chronograph",
  desc: "Brushed stainless steel with custom mechanical movement.",
  price: "$1,250.00",
  rating: "4.9",
  badge: null,
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCQKEiIUCbrJcS1fSswZH51U1ZXZjtXrPtq6FDJJev7evu4vakvYA7ty8f079vfWZbTqyxC95TxrMZe_7oY7lyYxVH2Oh8V9t8jEpDPOROYLah7ZzIEZZ0aAnCna1_5ly3OD8vohJzsXM07ivFEr_G_mCCZEEzOrsVzX3GXIIgdHcYBNAdKqYdySG9TcNiBv9U1r73vY9GU7yDIRiqn3ZEuINmDjy8iT46yfzSjGWCS5G92K92BEOC",
 },
 {
  id: 2,
  name: "Verdant Leather Tote",
  desc: "Sustainably sourced full-grain leather in deep forest tones.",
  price: "$480.00",
  rating: "4.8",
  badge: null,
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuANu1KukBdhZQlEOwdKb_V97t1ln8dGT6lVBi8CVYEQ4Y4BOdzocYIRXEyE8CC82KYwXl1wg2fZ0JPL8wI-g0uYwK4UP482Th4o6_5Ro_8_Y1_16ExuRDbHANfiUIHLQYxLiNYE1GW6GoQOjsty6Sp4DZ3QOM2I6hsowLnC4Q5ByY4qD3SXUYu7_QJlsOrUlx4AuupHCfqph7oq5SSfcpgqEu73ZaWkzj9zx05Y_UlO1HDxekescFA0",
 },
 {
  id: 3,
  name: "Geometric Glass Vase",
  desc: "Hand-blown artisanal glass with emerald crystalline base.",
  price: "$215.00",
  rating: "5.0",
  badge: { text: "Limited Edition", color: "bg-[#d9dff5] text-[#5c6274]" },
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6_shdm3WHU1xYEvESXbI8-hW0dZ4zrAs17Rn_voie3g1lkZAgvTjEAXqp-3v8RHErgBlFEVFFC1m61teqDi1tJULeisosy_y_MXc4MPw_KOxDbpIYM8pPyyFuwDWfHlVwx00fKsafnTcw50Kc2Dxzs1_owmWwLCvBGfEiZbV-2BGMIkv3V4rvlIgjn8o77thGXMhfQaybGDfNP-2q_mQy-3PmHq5Za-JQriEd-rPhYqGmrMUPRzxR",
 },
 {
  id: 4,
  name: "Linear Tech Sneakers",
  desc: "Performance knit upper with recycled ocean plastic soles.",
  price: "$195.00",
  rating: "4.7",
  badge: null,
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsjBulK8E4MMTTuL_hgtZ39mlpBRk4tyusnMfxv_xaWkmrNwflMkzUdrM4bPja8kmheueuqGGBYa1QtP0ZqiHK4yHCnC6AiRv61fgiVIads-95PsNyTlFWjD9v83nSgOrBFby2Qdb4QryWEpbqgcjlFC8oGSkRLzATxfylnbojUYIMsRBM2iJ8yqoSD9l_cka3ZsLZv2yNGyjP4zWqXN6VncVTyDK_WDN415rdUU35Q6MhuVxMyLzH",
 },
 {
  id: 5,
  name: "Silence ANC Headphones",
  desc: "Active noise cancellation with 40-hour battery life.",
  price: "$349.00",
  rating: "4.9",
  badge: null,
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAPTLMKQGbmkJy7vkvDx36dk3FP_b7BKLwlBAqOpadmpHA6CPn6QTsyhYyjFC-eoyWCJ80oOzvBMD8-EgswDYKILo_2Z3DNfdTBiSIHdAVIn0OALkfXcy1K0KtPPyUhleNatUamJp7ElfqeHX-NVvKgXzMMedcFdCB2IJfuKP4RCeviDWeC3byM0vS8s1SvDYsk_tEQkdGO71dnwuPFcdvj3hWjaKz2__R1EkS1MYOCIArWkdKShD2P",
 },
 {
  id: 6,
  name: "Pivot Task Lamp",
  desc: "Smart LED with touch-sensitive dimming and warm tone control.",
  price: "$128.00",
  originalPrice: "$160.00",
  rating: "4.6",
  badge: { text: "Sale -20%", color: "bg-[#ffdad6] text-[#93000a]" },
  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO_UvQFwGRJI54pkZJwoHpCN_aiEQFAPiCLfLDIIMm6udn14hjJbR3mDR_ktYCKbwbVnIVioQmXGdqBqT3sr513YNtIdZ0qi8dfCV2O94Y0m78CyhRW3_3kerCYEjn0brIwrgNaC_pvX5loigI7S1cJjqSJ5Ckha3V7nsGRyjxpt1ye8LP5ZROuR6fpKdN3uRjvmZulaTotfIVwt8BGmy3IRgkl4jJ0h6jWRLjUfmwtW3Pa5R4HuK4",
 },
];

export default function WishlistPage() {
 const [items, setItems] = useState(initialProducts);
 const [toast, setToast] = useState(false);

 const removeItem = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));

 const addToCart = () => {
  setToast(true);
  setTimeout(() => setToast(false), 3000);
 };

 return (
  <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
   <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
    .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
    .wishlist-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .wishlist-card:hover { transform: translateY(-4px); box-shadow: 0px 12px 40px rgba(0,0,0,0.08); }
   `}</style>


   <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
    {/* Top navbar */}
    <header className="w-full h-16 sticky top-0 bg-[#f8f9fa] shadow-sm z-40 flex items-center justify-between px-6">
     <div className="flex items-center gap-2">
      <span className="text-[#003527] font-semibold text-xl">Jernih Creatife</span>
     </div>
     <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
      {["Home", "Shop", "Deals"].map((item) => (
       <a key={item} href="#" className="text-[#404944] hover:text-[#003527] transition-colors">{item}</a>
      ))}
      <a href="#" className="text-[#003527] border-b-2 border-[#003527] pb-1">Wishlist</a>
     </div>
     <div className="flex items-center gap-4">
      <div className="relative hidden sm:block">
       <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#404944] text-lg">search</span>
       <input className="pl-10 pr-4 py-2 bg-[#edeeef] border-none rounded-full text-sm w-56 focus:ring-2 focus:ring-[#003527] outline-none" placeholder="Search products..." type="text" />
      </div>
      <div className="flex items-center gap-2">
       <button className="material-symbols-outlined text-[#003527]">notifications</button>
       <button className="material-symbols-outlined text-[#003527]">shopping_cart</button>
       <button className="material-symbols-outlined text-[#003527]">account_circle</button>
      </div>
     </div>
    </header>

    <div className="px-6 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
       <div>
        <h1 className="text-[#003527] font-semibold tracking-tight mb-1" style={{ fontSize: "clamp(32px,5vw,48px)", lineHeight: "1.1" }}>
         Your Wishlist
        </h1>
        <p className="text-[#575e70] text-base md:text-lg">
         A curated collection of items you&apos;ve saved for later.
        </p>
       </div>
       <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-[#404944]">{items.length} Items Saved</span>
        <button className="flex items-center gap-1 px-5 py-2 border border-[#707974] rounded-full text-sm font-semibold hover:bg-[#e7e8e9] transition-colors">
         <span className="material-symbols-outlined text-lg">share</span> Share List
        </button>
       </div>
      </div>

      {/* Grid */}
      {items.length > 0 ? (
       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((product) => (
         <div key={product.id} className="wishlist-card bg-white rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] group relative">
          {/* Delete button */}
          <div className="absolute top-4 right-4 z-10">
           <button
            onClick={() => removeItem(product.id)}
            className="w-10 h-10 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-full text-[#ba1a1a] hover:bg-white transition-colors shadow-sm"
            aria-label="Hapus dari wishlist"
           >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
           </button>
          </div>

          {/* Image */}
          <div className="aspect-[4/5] overflow-hidden bg-[#f3f4f5] relative">
           {product.badge && (
            <span className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${product.badge.color}`}>
             {product.badge.text}
            </span>
           )}
           <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover"
           />
          </div>

          {/* Info */}
          <div className="p-6">
           <div className="flex justify-between items-start mb-1">
            <h3 className="text-[#003527] font-semibold text-xl">{product.name}</h3>
            <div className="flex items-center bg-[#b0f0d6] text-[#064e3b] text-xs font-semibold px-2 py-1 rounded shrink-0 ml-2">
             <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
             <span className="ml-1">{product.rating}</span>
            </div>
           </div>
           <p className="text-[#575e70] text-sm mb-5">{product.desc}</p>
           <div className="flex items-center justify-between">
            <div>
             <span className="text-[#003527] font-semibold text-xl">{product.price}</span>
             {"originalPrice" in product && product.originalPrice && (
              <span className="block text-xs text-[#575e70] line-through">{product.originalPrice}</span>
             )}
            </div>
            <button
             onClick={addToCart}
             className="bg-[#003527] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#064e3b] transition-all active:scale-95"
            >
             Add to Cart
            </button>
           </div>
          </div>
         </div>
        ))}
       </div>
      ) : (
       /* Empty state */
       <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-[#e1e3e4] mb-6" style={{ fontSize: "80px" }}>favorite_border</span>
        <h2 className="text-[#003527] font-semibold text-2xl mb-3">Your wishlist is empty</h2>
        <p className="text-[#575e70] text-lg max-w-md mb-10">
         Start exploring our curated collection and save your favorite items for later.
        </p>
        <button className="bg-[#003527] text-white px-16 py-4 rounded-full text-sm font-semibold hover:shadow-lg transition-all active:scale-95">
         Explore Collections
        </button>
       </div>
      )}
     </div>
   </main>

   {/* Toast */}
   <div
    className={`fixed bottom-6 right-6 z-50 bg-[#064e3b] text-[#80bea6] px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 ${
     toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
    }`}
   >
    <span className="material-symbols-outlined">check_circle</span>
    <span className="text-sm font-semibold">Item added to your cart</span>
   </div>
  </div>
 );
}
