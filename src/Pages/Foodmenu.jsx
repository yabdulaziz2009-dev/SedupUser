import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL + "food";

const CATEGORIES = ["All", "Food", "Snack", "Drinks", "Sweets"];

const formatPrice = (price) => "$" + (price / 10000).toFixed(2);
const getRating = (name) => (4.2 + (name.length % 8) * 0.1).toFixed(1);

// ─── FoodCard ─────────────────────────────────────────────────
function FoodCard({ item }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col border border-gray-100 cursor-pointer"
      onClick={() => navigate(`/item/${item._id}`)}
    >
      {/* Image */}
      <div className="relative h-[160px] bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
          }}
        />
        {/* Rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
          <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
          {getRating(item.name)}
        </div>

        {/* Category badge */}
        {item.subcategory && (
          <div className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-600 shadow-sm">
            {item.subcategory}
          </div>
        )}

        {/* Out of stock overlay */}
        {!item.stockAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[11px] font-semibold bg-red-500 px-2 py-0.5 rounded-full">
              Mavjud emas
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-[13px] text-gray-900 line-clamp-1 leading-snug">
          {item.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {item.description || "Mazali va yangi tayyorlangan taom"}
        </p>

        {/* Price + Arrow */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-orange-500 font-extrabold text-sm">
            {formatPrice(item.price)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/item/${item._id}`);
            }}
            disabled={!item.stockAvailable}
            className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
              item.stockAvailable
                ? "bg-orange-500 hover:bg-orange-600 active:scale-95 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function FoodMenu() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          // Duplicate nomlarni olib tashlash
          const seen = new Map();
          data.data.forEach((item) => seen.set(item.name, item));
          setFoods([...seen.values()]);
        } else {
          setError("Ma'lumot yuklanmadi");
        }
      })
      .catch(() => setError("Server bilan ulanishda xatolik"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = foods.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.subcategory === activeCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ══ HEADER ══ */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <p className="text-orange-500 font-extrabold text-xl tracking-tight leading-tight">
              FreshDash
            </p>
            <p className="text-gray-400 text-[10px] leading-none">
              Modern Culinary Delivery
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Taom qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
        </div>
      </header>

      {/* ══ CONTENT ══ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Menyuni ko'ring
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Eng mazali taomlarni tanlang — tez va yangi yetkazib beriladi.
          </p>
        </div>

        {/* ── Category filter ── */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-2 text-xs text-gray-300 flex-shrink-0">
            {filtered.length} ta
          </span>
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="h-[160px] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded-full" />
                  <div className="h-2.5 bg-gray-100 rounded-full w-2/3" />
                  <div className="flex justify-between mt-3">
                    <div className="h-3 bg-gray-100 rounded-full w-1/4" />
                    <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl max-w-sm">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-xs text-gray-400">Hech narsa topilmadi</p>
          </div>
        )}

        {/* ── Food Grid ── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <FoodCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}