import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL; // e.g. https://sedab-backend.onrender.com/api/
const ITEMS_URL = BASE_URL + "food"; // GET /api/food → all items
const ORDERS_URL = BASE_URL + "orders"; // POST /api/orders

const formatPrice = (price) => "$" + (price / 10000).toFixed(2);
const getRating = (name) => (4.2 + (name.length % 8) * 0.1).toFixed(1);

const EXTRAS = [
  { label: "Extra Cheese", price: 99 },
  { label: "Extra Sauce", price: 49 },
  { label: "No Onion", price: 0 },
  { label: "Extra Patty", price: 199 },
];

const SIZES = ["Small", "Medium", "Large"];

// ─── Nutrition mock (based on item id hash) ────────────────────
function getNutrition(item) {
  const h = item._id
    ? item._id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
    : 0;
  return {
    calories: 350 + (h % 250),
    protein: 18 + (h % 20) + "g",
    carbs: 30 + (h % 30) + "g",
    fat: 10 + (h % 18) + "g",
  };
}

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order state
  const [selectedSize, setSelectedSize] = useState("Medium");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [qty, setQty] = useState(1);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetch(ITEMS_URL)
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

  const toggleExtra = (label) => {
    setSelectedExtras((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label]
    );
  };

  // Extra narx hisob
  const extrasTotal = selectedExtras.reduce((sum, label) => {
    const ex = EXTRAS.find((e) => e.label === label);
    return sum + (ex ? ex.price : 0);
  }, 0);

  const basePrice = item ? item.price : 0;
  const totalPrice = (basePrice * qty + extrasTotal * qty) / 10000;

  const handleOrder = async () => {
    if (!customerName.trim()) {
      setSubmitError("Ism kiriting");
      return;
    }
    if (!location.trim()) {
      setSubmitError("Manzil kiriting");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const body = {
      customerName: customerName.trim(),
      location: location.trim(),
      foods: [
        {
          foodId: item._id,
          quantity: qty,
        },
      ],
      size: selectedSize,
      extras: selectedExtras,
      totalPrice: Math.round(totalPrice * 10000), // tiyin
    };

    try {
      const res = await fetch(ORDERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok || data.success) {
        setSuccess(true);
      } else {
        setSubmitError(data.msg || "Buyurtma yuborishda xatolik");
      }
    } catch {
      setSubmitError("Internet yoki server xatoligi");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-400 text-sm">{error || "Topilmadi"}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-orange-500 text-sm font-semibold hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Orqaga qaytish
        </button>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-gray-900">Buyurtma qabul qilindi!</h2>
          <p className="text-sm text-gray-400 mt-1">
            {customerName}, buyurtmangiz tez orada yetkaziladi 🚀
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 w-full max-w-xs shadow-sm">
          <div className="flex items-center gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-xl object-cover"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80"; }}
            />
            <div>
              <p className="text-sm font-bold text-gray-900">{item.name}</p>
              <p className="text-xs text-orange-500">${totalPrice.toFixed(2)} × {qty}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ← Menyuga qaytish
        </button>
      </div>
    );
  }

  const nutrition = getNutrition(item);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <p className="text-orange-500 font-extrabold text-lg tracking-tight">FreshDash</p>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col lg:flex-row">

          {/* ── Image panel ── */}
          <div className="relative lg:w-[360px] flex-shrink-0 h-64 lg:h-auto bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
              }}
            />
            {/* Rating */}
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              {getRating(item.name)}
            </div>
            {/* Category */}
            {item.subcategory && (
              <div className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-600 shadow">
                {item.subcategory}
              </div>
            )}
            {/* Out of stock */}
            {!item.stockAvailable && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-red-500 px-3 py-1 rounded-full">
                  Mavjud emas
                </span>
              </div>
            )}
          </div>

          {/* ── Details + Order form ── */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto">

            {/* Name + Price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {item.name}
                </h1>
                {item.subcategory && (
                  <span className="inline-block mt-1 text-[11px] font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                    {item.subcategory}
                  </span>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-2xl font-extrabold text-orange-500 block">
                  {formatPrice(item.price)}
                </span>
                <span className="text-[10px] text-gray-400">bir dona</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 leading-relaxed">
              {item.description ||
                "Mazali va yangi tayyorlangan, sifatli ingredientlardan tayyorlangan taom. Har bir buyurtmada eng yuqori sifat kafolatlanadi."}
            </p>

            {/* Nutrition */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Kaloriya", value: nutrition.calories },
                { label: "Protein", value: nutrition.protein },
                { label: "Uglerod", value: nutrition.carbs },
                { label: "Yog'", value: nutrition.fat },
              ].map(({ label, value }) => (
                <div key={label} className="bg-orange-50 rounded-xl px-2 py-2 text-center">
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Customer info */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-800">Buyurtmachi ma'lumotlari</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Ismingiz"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                               transition-all placeholder-gray-400 text-gray-800"
                  />
                </div>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Manzilingiz"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50
                               focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400
                               transition-all placeholder-gray-400 text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2">Hajm</p>
              <div className="flex gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                      selectedSize === size
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div>
              <p className="text-sm font-bold text-gray-800 mb-2.5">Qo'shimchalar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXTRAS.map(({ label, price }) => {
                  const active = selectedExtras.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleExtra(label)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                        active
                          ? "bg-orange-50 border-orange-400 text-orange-700"
                          : "bg-white border-gray-200 text-gray-700 hover:border-orange-200"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            active ? "border-orange-500 bg-orange-500" : "border-gray-300"
                          }`}
                        >
                          {active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </span>
                        {label}
                      </span>
                      {price > 0 && (
                        <span className="text-[11px] text-gray-400 font-medium">
                          +${(price / 100).toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Qty + Order button */}
            <div className="flex items-center gap-4">
              {/* Qty */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1.5 border border-gray-100">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-500 font-bold flex items-center justify-center transition-colors active:scale-95 text-base"
                >
                  −
                </button>
                <span className="text-base font-bold text-gray-800 w-6 text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center transition-colors active:scale-95 text-base"
                >
                  +
                </button>
              </div>

              {/* Order CTA */}
              <button
                onClick={handleOrder}
                disabled={!item.stockAvailable || submitting}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !item.stockAvailable
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : submitting
                    ? "bg-orange-300 text-white cursor-wait"
                    : "bg-orange-500 hover:bg-orange-600 text-white active:scale-[0.98] shadow-sm"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    Buyurtma berish — ${totalPrice.toFixed(2)}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Inline error */}
            {submitError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-500 text-xs px-3 py-2 rounded-xl">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {submitError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}