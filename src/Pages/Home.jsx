import { useState } from "react";
import { MdStar, MdFavorite, MdFavoriteBorder, MdDirectionsBike, MdSearch, MdHome, MdHistory, MdPerson, MdShoppingCart } from "react-icons/md";

/* ─── DATA ─────────────────────────────────────────────── */
const CATEGORIES = [
  { id: "pizza",   label: "Pizza",   emoji: "🍕" },
  { id: "burger",  label: "Burger",  emoji: "🍔" },
  { id: "sushi",   label: "Sushi",   emoji: "🍣" },
  { id: "asian",   label: "Asian",   emoji: "🥢" },
  { id: "healthy", label: "Healthy", emoji: "🥗" },
  { id: "dessert", label: "Dessert", emoji: "🍰" },
];

const FEATURED = [
  {
    id: 1,
    name: "Urban Crave Burger",
    tags: "American · Burgers · Comfort Food",
    time: "20–30 min",
    rating: 4.9,
    delivery: "Free delivery on $20+",
    free: true,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  },
  {
    id: 2,
    name: "Kiku Sushi Studio",
    tags: "Japanese · Sushi · High-end",
    time: "35–45 min",
    rating: 4.8,
    delivery: "$2.99 delivery",
    free: false,
    img: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80",
  },
  {
    id: 3,
    name: "Green Bowl Co.",
    tags: "Healthy · Vegan · Fresh",
    time: "15–25 min",
    rating: 4.7,
    delivery: "Free delivery on $15+",
    free: true,
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  },
  {
    id: 4,
    name: "Pizza Fiamma",
    tags: "Italian · Pizza · Wood-fired",
    time: "25–35 min",
    rating: 4.6,
    delivery: "$1.99 delivery",
    free: false,
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
  },
];

const NAV_LINKS = ["Home", "Browse", "Orders", "Profile"];

/* ─── STAR ICON ─────────────────────────────────────────── */

/* ─── RESTAURANT CARD ───────────────────────────────────── */
function RestCard({ r }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={r.img}
          alt={r.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
          <MdStar className="text-amber-400 w-3 h-3" />
          <span className="text-xs font-bold text-gray-800">{r.rating}</span>
        </div>
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          {liked ? (
            <MdFavorite className="w-4 h-4 text-red-500" />
          ) : (
            <MdFavoriteBorder className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{r.name}</h3>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2 mt-0.5">{r.time}</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">{r.tags}</p>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${r.free ? "text-emerald-600" : "text-gray-500"}`}>
          <MdDirectionsBike className="w-3.5 h-3.5" />
          {r.delivery}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function FreshDashHome() {
  const [activeCategory, setActiveCategory] = useState("burger");
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="min-h-screen bg-[#f7f6f3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.20s; }
        .fade-up-4 { animation-delay: 0.28s; }
        @keyframes heroPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.03); }
        }
        .hero-img { animation: heroPulse 8s ease-in-out infinite; }
      `}</style>

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-display text-xl font-black text-emerald-700 tracking-tight">
            FreshDash
          </span>
          <div className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <button
                key={l}
                className={`px-3 py-1.5 rounded-xl text-sm transition-all ${
                  l === "Home"
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {l}
              </button>
            ))}
            {/* Cart */}
            <button className="ml-2 w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors relative">
              <MdShoppingCart className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 pb-12">

        {/* ── HERO BANNER ──────────────────────────────────── */}
        <div className="fade-up fade-up-1 mt-5 rounded-3xl overflow-hidden relative h-52 shadow-lg">
          {/* BG image */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80"
              alt="hero"
              className="hero-img w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-7">
            <span className="inline-block text-[10px] font-bold tracking-widest uppercase bg-emerald-400 text-emerald-950 px-2.5 py-1 rounded-full mb-3 w-fit">
              Limited Time Offer
            </span>
            <h2 className="font-display text-3xl font-black text-white leading-tight mb-2">
              Savor the Season
            </h2>
            <p className="text-white/75 text-xs leading-relaxed mb-4 max-w-xs">
              Get 20% off your first order from our curated list of vibrant, locally-sourced restaurants.
            </p>
            <button className="w-fit bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-2xl transition-all shadow-md">
              Claim Offer
            </button>
          </div>
        </div>

        {/* ── SEARCH ───────────────────────────────────────── */}
        <div className="fade-up fade-up-2 mt-5 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm transition-all"
          />
        </div>

        {/* ── CRAVINGS ─────────────────────────────────────── */}
        <div className="fade-up fade-up-2 mt-7">
          <h2 className="font-bold text-gray-900 mb-3 text-base">Cravings</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                  activeCategory === c.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <span className="text-base">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── FEATURED ─────────────────────────────────────── */}
        <div className="fade-up fade-up-3 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-base">Featured</h2>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              See All →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {FEATURED.map((r, i) => (
              <div
                key={r.id}
                className="fade-up"
                style={{ animationDelay: `${0.28 + i * 0.07}s` }}
              >
                <RestCard r={r} />
              </div>
            ))}
          </div>
        </div>

        {/* ── PROMO STRIP ──────────────────────────────────── */}
        <div className="fade-up fade-up-4 mt-8 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-emerald-200">
          <div>
            <p className="text-white/80 text-xs mb-1">Refer a friend & earn</p>
            <p className="text-white font-bold text-lg leading-tight">$10 Credit<br/>each time 🎉</p>
          </div>
          <button className="bg-white text-emerald-700 font-bold text-sm px-5 py-2.5 rounded-2xl hover:bg-emerald-50 transition-colors shadow-sm flex-shrink-0">
            Invite Now
          </button>
        </div>

        {/* ── BOTTOM NAV (mobile feel) ─────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100 flex justify-around py-3 z-50">
          {[
            { icon: MdHome, label: "Home", active: true },
            { icon: MdSearch, label: "Search" },
            { icon: MdHistory, label: "Orders" },
            { icon: MdPerson, label: "Profile" },
          ].map((item) => (
            <button key={item.label} className={`flex flex-col items-center gap-1 px-4 ${item.active ? "text-emerald-600" : "text-gray-400"}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}