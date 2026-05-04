import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL; // yoki to'g'ridan-to'g'ri base URL

const formatPrice = (price) => "$" + (price / 10000).toFixed(2);
const getRating = (name) => (4.2 + (name.length % 8) * 0.1).toFixed(1);

const SIZES = ["Small", "Medium", "Large"];
const EXTRAS = ["Extra Cheese", "Extra Sauce", "No Onion", "Extra Patty"];

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const found = data.data.find((i) => i._id === id);
          if (found) setItem(found);
          else setError("Mahsulot topilmadi");
        } else {
          setError("Ma'lumot yuklanmadi");
        }
      })
      .catch(() => setError("Server bilan ulanishda xatolik"))
      .finally(() => setLoading(false));
  }, [id]);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) =>
      prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]
    );
  };

  const handleAddToCart = () => {
    // Cart logikangizga moslashtiring
    // Masalan: addToCart({ ...item, qty, selectedSize, selectedExtras })
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-sm">{error || "Topilmadi"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-orange-500 text-sm font-semibold hover:underline"
        >
          ← Orqaga qaytish
        </button>
      </div>
    );
  }

  const totalPrice = formatPrice(item.price * qty);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-orange-500 font-extrabold text-lg">FreshDash</p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">

          {/* Image */}
          <div className="relative md:w-[380px] flex-shrink-0 h-64 md:h-auto bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
              }}
            />
            {/* Rating */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {getRating(item.name)}
            </div>
            {!item.stockAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-red-500 px-3 py-1 rounded-full">
                  Mavjud emas
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 p-6 flex flex-col gap-5">
            {/* Name + Price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
                  {item.name}
                </h1>
                {item.subcategory && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    {item.subcategory}
                  </span>
                )}
              </div>
              <span className="text-2xl font-extrabold text-orange-500 flex-shrink-0">
                {formatPrice(item.price)}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description ||
                "Mazali va yangi tayyorlangan, sifatli ingredientlardan tayyorlangan taom. Har bir buyurtmada eng yuqori sifat kafolatlanadi."}
            </p>

            {/* Nutrition (mock) */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Calories", value: "480" },
                { label: "Protein", value: "32g" },
                { label: "Carbs", value: "45g" },
                { label: "Fat", value: "24g" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl px-3 py-2 text-center"
                >
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Modifications */}
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Modifications</p>
              <div className="space-y-2">
                {EXTRAS.map((extra) => (
                  <label
                    key={extra}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedExtras.includes(extra)
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-300 group-hover:border-orange-300"
                        }`}
                        onClick={() => toggleExtra(extra)}
                      >
                        {selectedExtras.includes(extra) && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{extra}</span>
                    </div>
                    <span className="text-xs text-gray-400">+$0.99</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Add-ons</p>
              <div className="flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      selectedSize === size
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-auto">
              {/* Qty */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-500 font-bold text-lg flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="text-base font-bold text-gray-800 w-6 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-8 h-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!item.stockAvailable}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  item.stockAvailable
                    ? added
                      ? "bg-green-500 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {added ? "✓ Qo'shildi!" : `Savatga qo'shish — ${totalPrice}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
