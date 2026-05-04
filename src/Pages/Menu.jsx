import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIES = ["All", "Food", "Snack", "Drinks", "Sweets"];

const formatPrice = (price) => "$" + (price / 10000).toFixed(2);
const getRating = (name) => (4.2 + (name.length % 8) * 0.1).toFixed(1);

// ─── FoodCard ─────────────────────────────────────────────────
function FoodCard({ item, cart, onAdd, onRemove }) {
  const cartItem = cart.find((i) => i._id === item._id);
  const qty = cartItem ? cartItem.qty : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex flex-col border border-gray-100">
      <Link to={`/item/${item._id}`}>
      <div className="relative h-[152px] bg-gray-100 overflow-hidden flex-shrink-0">
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
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
          {getRating(item.name)}
        </div>
        {!item.stockAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[11px] font-semibold bg-red-500 px-2 py-0.5 rounded-full">
              Mavjud emas
            </span>
          </div>
        )}
      </div>
      </Link>

      {/* Body */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-[13px] text-gray-900 line-clamp-2 leading-snug">
          {item.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Price + Qty controls */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <span className="text-orange-500 font-extrabold text-sm flex-shrink-0">
            {formatPrice(item.price)}
          </span>

          {/* Qty buttons */}
          {qty === 0 ? (
            // Hali qo'shilmagan — faqat Add tugmasi
            <button
              onClick={() => item.stockAvailable && onAdd(item)}
              disabled={!item.stockAvailable}
              className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 flex-shrink-0 ${
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
          ) : (
            // Qo'shilgan — − soni + tugmalari
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => onRemove(item._id)}
                className="w-6 h-6 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-500 font-bold text-sm flex items-center justify-center transition-colors active:scale-95"
              >
                −
              </button>
              <span className="text-[13px] font-bold text-gray-800 w-4 text-center">
                {qty}
              </span>
              <button
                onClick={() => onAdd(item)}
                className="w-6 h-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center justify-center transition-colors active:scale-95"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CartDrawer ───────────────────────────────────────────────
function CartDrawer({ cart, onClose, onAdd, onRemove }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <svg
              className="w-4 h-4 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Savatcha
            {cart.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
              <svg
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-xs text-gray-400">Savatcha bo'sh</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-orange-500">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => onRemove(item._id)}
                    className="w-5 h-5 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-500 text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold text-gray-700 w-4 text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onAdd(item)}
                    className="w-5 h-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Jami:</span>
              <span className="font-bold text-gray-800">
                {formatPrice(total)}
              </span>
            </div>
            <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Buyurtma berish →
            </button>
          </div>
        )}
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
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
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

  const addToCart = (item) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === item._id);
      return ex
        ? prev.map((i) => (i._id === item._id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === id);
      if (!ex) return prev;
      return ex.qty === 1
        ? prev.filter((i) => i._id !== id)
        : prev.map((i) => (i._id === id ? { ...i, qty: i.qty - 1 } : i));
    });
  };

  const filtered = foods.filter((item) => {
    const matchCat =
      activeCategory === "All" || item.subcategory === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ══ HEADER ══ */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <p className="text-orange-500 font-extrabold text-lg leading-tight">
              FreshDash
            </p>
            <p className="text-gray-400 text-[10px]">
              Modern Culinary Delivery
            </p>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
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
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors relative"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Savatcha
            {cartCount > 0 && (
              <span className="bg-white text-orange-500 text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Explore Menu
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Discover delicious meals from top local restaurants, delivered fresh
            and fast.
          </p>
        </div>

        {/* ── Category filter ── */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={
                activeCategory === cat
                  ? { backgroundColor: "#f97316", color: "#ffffff" }
                  : {
                      backgroundColor: "#ffffff",
                      color: "#4b5563",
                      border: "1px solid #e5e7eb",
                    }
              }
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 hover:border-orange-300"
            >
              {cat}
            </button>
          ))}
          <span className="ml-2 text-xs text-gray-300">
            {filtered.length} items
          </span>
        </div>

        {/* ── States ── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse"
              >
                <div className="h-[152px] bg-gray-100" />
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
              <FoodCard
                key={item._id}
                item={item}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onAdd={addToCart}
          onRemove={removeFromCart}
        />
      )}
    </div>
  );
}
