/**
 * src/pages/MealOrder.jsx
 *
 * Imports all API logic from ../services/api — zero hardcoded data.
 * UI design unchanged.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock,
  Pencil, Trash2, X, Check, Search,
  UtensilsCrossed, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";

import {
  foodApi,
  categoryApi,
  orderApi,
  normalizeFoodItem,
  normalizeOrder,
  buildScheduledAt,
} from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TIME_SLOTS = [
  "7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

// ─────────────────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const toDateKey = (d) => {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const getMondayOf = (ref, weekOffset = 0) => {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + weekOffset * 7);
  return d;
};

const buildWeek = (monday) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

const buildMonth = (year, month) => {
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const fmtRange = (days) => {
  const f = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${f(days[0])} – ${f(days[6])}`;
};

const getUpcomingWeekdays = (count = 14) => {
  const result = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (result.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) result.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return result;
};

/** "12:30 PM" → "12:30" for <input type="time"> */
const toTimeInput = (display) => {
  if (!display) return "";
  const m = display.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return "";
  let hr = parseInt(m[1], 10);
  if (m[3].toUpperCase() === "PM" && hr < 12) hr += 12;
  if (m[3].toUpperCase() === "AM" && hr === 12) hr = 0;
  return `${String(hr).padStart(2, "0")}:${m[2]}`;
};

/** "13:30" → "1:30 PM" */
const fromTimeInput = (val) => {
  if (!val) return "";
  const [hStr, minStr] = val.split(":");
  const hr = parseInt(hStr, 10);
  if (isNaN(hr)) return "";
  const period = hr >= 12 ? "PM" : "AM";
  const hr12   = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${hr12}:${minStr} ${period}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useCatalog() {
  const [foods,      setFoods]      = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [foodData, catData] = await Promise.all([
        foodApi.getAll(),
        categoryApi.getAll(),
      ]);

      const foodList = Array.isArray(foodData) ? foodData : foodData?.data ?? [];
      const catList  = Array.isArray(catData)  ? catData  : catData?.data  ?? [];

      setFoods(foodList.map(normalizeFoodItem));
      setCategories(["All", ...catList.map((c) => c.name ?? c.title ?? String(c))]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { foods, categories, loading, error, reload: load };
}

function useOrders() {
  const [mealsByDate, setMealsByDate] = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getAll();
      const list = Array.isArray(data) ? data : data?.data ?? [];
      const map  = {};
      list.forEach((order) => {
        const { dateKey, meal } = normalizeOrder(order);
        if (dateKey) map[dateKey] = meal;
      });
      setMealsByDate(map);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { mealsByDate, setMealsByDate, loading, error, reload: load };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

function ActivityDot({ active }) {
  return (
    <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
      active ? "bg-red-500" : "bg-stone-200"
    }`} />
  );
}

function TimeBadge({ time }) {
  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-[3px] shadow-md">
      <Clock size={9} className="text-stone-400" />
      <span className="text-[10px] font-semibold text-stone-700 leading-none">{time}</span>
    </div>
  );
}

function Spinner({ size = 18, className = "" }) {
  return <Loader2 size={size} className={`animate-spin text-stone-400 ${className}`} />;
}

function InlineError({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-600">
      <AlertCircle size={14} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 font-semibold hover:text-red-800 transition-colors flex-shrink-0"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEK DAY CARD
// ─────────────────────────────────────────────────────────────────────────────

function WeekDayCard({ date, meal, isWeekend, onAdd, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const dow     = (date.getDay() + 6) % 7;
  const isToday = toDateKey(date) === toDateKey(new Date());

  if (isWeekend) {
    return (
      <div className="flex flex-col min-h-[232px]">
        <div className="flex items-center justify-between mb-3 h-6">
          <span className="text-sm font-medium text-stone-300">
            {DAY_LABELS[dow]} <span className="font-normal">{date.getDate()}</span>
          </span>
          <ActivityDot active={false} />
        </div>
        <div className="flex-1 rounded-2xl bg-stone-50/80 flex items-center justify-center">
          <span className="text-xs text-stone-300 font-medium tracking-wide uppercase">Weekend off</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[232px]">
      <div className="flex items-center justify-between mb-3 h-6">
        <span className={`text-sm font-semibold leading-none ${isToday ? "text-red-600" : "text-stone-800"}`}>
          {DAY_LABELS[dow]}{" "}
          <span className={`font-normal ${isToday ? "text-red-400" : "text-stone-400"}`}>
            {date.getDate()}
          </span>
        </span>
        <ActivityDot active={!!meal} />
      </div>

      {meal ? (
        <div
          className={`flex-1 rounded-2xl overflow-hidden border relative transition-all duration-200 ${
            hovered
              ? "border-red-300 shadow-lg shadow-red-100 scale-[1.015]"
              : "border-red-100 shadow-sm"
          }`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={meal.image || FALLBACK_IMG}
            alt={meal.title}
            className="w-full h-[118px] object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          />
          <TimeBadge time={meal.time} />

          <div className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/25 transition-opacity duration-150 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}>
            <button
              onClick={onEdit}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform"
            >
              <Pencil size={12} className="text-stone-700" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-transform"
            >
              <Trash2 size={12} className="text-red-500" />
            </button>
          </div>

          <div className="px-3 pt-2 pb-3">
            <p className="text-sm font-semibold text-stone-800 truncate leading-tight">{meal.title}</p>
            <p className="text-[11px] text-stone-400 truncate mt-0.5">{meal.restaurant}</p>
          </div>
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="flex-1 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-2 hover:border-red-300 hover:bg-red-50/40 active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-full border-2 border-stone-200 group-hover:border-red-400 group-hover:bg-red-50 flex items-center justify-center transition-all">
            <Plus size={16} className="text-stone-300 group-hover:text-red-400 transition-colors" />
          </div>
          <span className="text-xs font-medium text-stone-300 group-hover:text-red-400 transition-colors">
            Add Meal
          </span>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTH CELL
// ─────────────────────────────────────────────────────────────────────────────

function MonthCell({ date, meal, isToday, onAdd, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const dow       = (date.getDay() + 6) % 7;
  const isWeekend = dow === 5 || dow === 6;

  return (
    <div
      className={`relative rounded-xl border p-2 flex flex-col min-h-[88px] transition-all duration-200 ${
        isWeekend
          ? "bg-stone-50/60 border-stone-100"
          : isToday
          ? "border-red-300 bg-red-50/20 shadow-sm"
          : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
      }`}
      onMouseEnter={() => !isWeekend && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
          isToday ? "bg-red-600 text-white" : isWeekend ? "text-stone-300" : "text-stone-500"
        }`}>
          {date.getDate()}
        </span>
        {meal && !isWeekend && <ActivityDot active />}
      </div>

      {!isWeekend && (meal ? (
        <div className="relative flex-1">
          <img
            src={meal.image || FALLBACK_IMG}
            alt={meal.title}
            className="w-full h-9 object-cover rounded-lg"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
          />
          <p className="text-[10px] font-semibold text-stone-700 truncate mt-1 leading-tight">{meal.title}</p>
          <p className="text-[9px] text-stone-400 truncate">{meal.time}</p>
          {hovered && (
            <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center gap-1">
              <button onClick={onEdit} className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                <Pencil size={10} className="text-stone-700" />
              </button>
              <button onClick={onDelete} className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow">
                <Trash2 size={10} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
      ) : (
        hovered && (
          <button onClick={onAdd} className="flex-1 flex items-center justify-center gap-1 text-stone-300 hover:text-red-400 transition-colors mt-1">
            <Plus size={11} />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN ORDER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function PlanOrderModal({ open, onClose, onSaved, prefillDateKey, prefillMeal }) {
  const isEdit     = !!prefillMeal;
  const hasPrefill = !!prefillDateKey;

  const [step,         setStep]         = useState(1);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [activeCat,    setActiveCat]    = useState("All");
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState(null);

  const searchRef    = useRef(null);
  const upcomingDays = useMemo(() => getUpcomingWeekdays(14), []);

  const { foods, categories, loading: catalogLoading, error: catalogError, reload: reloadCatalog } = useCatalog();

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setSubmitError(null);
    setSubmitting(false);
    setSearchQuery("");
    setActiveCat("All");

    if (isEdit) {
      setSelectedMeal(prefillMeal);
      setSelectedDate(prefillDateKey ?? "");
      setSelectedTime(prefillMeal.time ?? "");
      setStep(3);
    } else if (hasPrefill) {
      setSelectedMeal(null);
      setSelectedDate(prefillDateKey);
      setSelectedTime("");
      setStep(1);
    } else {
      setSelectedMeal(null);
      setSelectedDate("");
      setSelectedTime("");
      setStep(1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open && step === 1) setTimeout(() => searchRef.current?.focus(), 100);
  }, [open, step]);

  const filteredFoods = useMemo(() => foods.filter((f) => {
    const matchCat    = activeCat === "All" || f.category === activeCat;
    const matchSearch = !searchQuery ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [foods, activeCat, searchQuery]);

  const totalSteps = isEdit ? 1 : hasPrefill ? 2 : 3;
  const stepIndex  = isEdit ? 0 : step - 1;
  // hasPrefill: step1=meal → step2=time (no day step)
  // no hasPrefill: step1=meal → step2=day → step3=time
  const canGoNext = step === 1
    ? !!selectedMeal
    : step === 2 && !hasPrefill
    ? !!selectedDate
    : false;
  const canConfirm = !!selectedMeal && !!selectedDate && !!selectedTime;

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const scheduledAt = buildScheduledAt(selectedDate, selectedTime);
      if (!scheduledAt) {
        setSubmitError("Invalid date or time. Please re-select.");
        setSubmitting(false);
        return;
      }

      // food_id as Number (backend may reject strings)
      const payload = {
        food_id:      Number(selectedMeal.id),
        scheduled_at: scheduledAt,      // "2026-05-08T12:00:00"
        quantity:     1,
      };

      // Debug: remove after confirming backend works
      console.log("[MealOrder] POST /orders payload:", payload);

      let saved;
      if (isEdit && prefillMeal?.orderId) {
        saved = await orderApi.update(prefillMeal.orderId, payload);
      } else {
        saved = await orderApi.create(payload);
      }

      onSaved(selectedDate, {
        ...selectedMeal,
        time:    selectedTime,
        orderId: saved?.id ?? prefillMeal?.orderId,
      });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
        onClick={!submitting ? onClose : undefined}
      />

      <div className="relative bg-white w-full sm:max-w-[520px] sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-stone-800 tracking-tight leading-tight">
              {isEdit ? "Edit Meal" : "Plan New Order"}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {step === 1 && "Choose a meal from the menu"}
              {step === 2 && !hasPrefill && "Pick a delivery day"}
              {((step === 2 && hasPrefill) || step === 3 || isEdit) && "Set your meal time"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEdit && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${
                    i < stepIndex ? "w-2 h-2 bg-red-600"
                    : i === stepIndex ? "w-5 h-2 bg-red-600"
                    : "w-2 h-2 bg-stone-200"
                  }`} />
                ))}
              </div>
            )}
            <button
              onClick={!submitting ? onClose : undefined}
              disabled={submitting}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <X size={14} className="text-stone-500" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 min-h-0">

          {/* Step 1 — Meal catalog */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meals or restaurants…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                      activeCat === cat
                        ? "bg-red-700 text-white shadow-sm"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {catalogLoading ? (
                <div className="flex items-center justify-center py-16 gap-2">
                  <Spinner />
                  <span className="text-sm text-stone-400">Loading menu…</span>
                </div>
              ) : catalogError ? (
                <InlineError message={catalogError} onRetry={reloadCatalog} />
              ) : filteredFoods.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-300 gap-2">
                  <UtensilsCrossed size={32} />
                  <p className="text-sm">No meals found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredFoods.map((meal) => {
                    const isSelected = selectedMeal?.id === meal.id;
                    return (
                      <button
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal)}
                        className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "border-red-600 shadow-lg shadow-red-100"
                            : "border-transparent hover:border-stone-200 shadow-sm"
                        }`}
                      >
                        <img
                          src={meal.image || FALLBACK_IMG}
                          alt={meal.title}
                          className="w-full h-28 object-cover"
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow">
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <span className="text-[9px] font-semibold text-white uppercase tracking-wide">
                            {meal.category}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="text-sm font-bold text-stone-800 leading-tight truncate">{meal.title}</p>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">{meal.restaurant}</p>
                          {meal.price && (
                            <p className="text-xs font-semibold text-red-600 mt-1">{meal.price}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Day selection */}
          {step === 2 && !hasPrefill && !isEdit && (
            <div className="flex flex-col gap-3">
              {selectedMeal && (
                <div className="flex items-center gap-3 bg-stone-50 rounded-2xl p-3 mb-1">
                  <img
                    src={selectedMeal.image || FALLBACK_IMG}
                    alt={selectedMeal.title}
                    className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-stone-800 truncate">{selectedMeal.title}</p>
                    <p className="text-xs text-stone-400 truncate">{selectedMeal.restaurant}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Select delivery day</p>

              <div className="flex flex-col gap-2">
                {upcomingDays.map((d) => {
                  const key      = toDateKey(d);
                  const isActive = key === selectedDate;
                  const isToday  = key === toDateKey(new Date());
                  const dow      = DAY_LABELS[(d.getDay() + 6) % 7];

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDate(key)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all duration-150 active:scale-[0.99] ${
                        isActive
                          ? "border-red-600 bg-red-50 shadow-sm"
                          : "border-stone-100 bg-white hover:border-stone-200"
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isActive ? "bg-red-600" : "bg-stone-100"}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${isActive ? "text-red-200" : "text-stone-400"}`}>{dow}</span>
                        <span className={`text-lg font-black leading-tight ${isActive ? "text-white" : "text-stone-700"}`}>{d.getDate()}</span>
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${isActive ? "text-red-700" : "text-stone-700"}`}>
                          {isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "long" })}
                        </p>
                        <p className="text-xs text-stone-400">
                          {d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                        </p>
                      </div>
                      {isActive && (
                        <div className="ml-auto w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Time selection */}
          {((step === 2 && hasPrefill) || step === 3 || isEdit) && (
            <div className="flex flex-col gap-4">
              {/* Recap */}
              <div className="bg-stone-50 rounded-2xl p-3 flex items-center gap-3">
                <img
                  src={selectedMeal?.image || FALLBACK_IMG}
                  alt={selectedMeal?.title}
                  className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-800 truncate">{selectedMeal?.title}</p>
                  <p className="text-xs text-stone-400">{selectedMeal?.restaurant}</p>
                </div>
                {selectedDate && !isEdit && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold text-stone-600">
                      {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </p>
                    {!hasPrefill && !isEdit && (
                      <button onClick={() => setStep(2)} className="text-[11px] text-red-500 font-semibold hover:text-red-700 transition-colors">
                        Change
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick chips */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Quick pick</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIME_SLOTS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 ${
                        selectedTime === t
                          ? "bg-red-700 text-white shadow-sm"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom time input */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Or custom time</p>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="time"
                    value={toTimeInput(selectedTime)}
                    onChange={(e) => {
                      const converted = fromTimeInput(e.target.value);
                      if (converted) setSelectedTime(converted);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
                  />
                </div>
                {selectedTime && (
                  <p className="text-[11px] text-stone-400 mt-1.5 pl-1">
                    Selected: <span className="font-semibold text-stone-600">{selectedTime}</span>
                  </p>
                )}
              </div>

              {submitError && <InlineError message={submitError} />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t border-stone-100 mt-1">
          <div className="flex gap-3">
            {!isEdit && step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                ← Back
              </button>
            )}

            {(isEdit || step === 1) && (
              <button
                onClick={!submitting ? onClose : undefined}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {!isEdit && step < (hasPrefill ? 2 : 3) ? (
              <button
                onClick={() => canGoNext && setStep((s) => s + 1)}
                disabled={!canGoNext}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                  canGoNext
                    ? "bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-700/20"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!canConfirm || submitting}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  canConfirm && !submitting
                    ? "bg-red-700 hover:bg-red-800 text-white shadow-lg shadow-red-700/20"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  <><Spinner size={14} /><span>Saving…</span></>
                ) : isEdit ? "Save Changes" : "Confirm Order ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function WeeklyView({ weekOffset, setWeekOffset, mealsByDate, onOpenModal, onDelete }) {
  const monday = useMemo(() => getMondayOf(new Date(), weekOffset), [weekOffset]);
  const days   = useMemo(() => buildWeek(monday), [monday]);

  const label =
    weekOffset === 0  ? "This Week"  :
    weekOffset === -1 ? "Last Week"  :
    weekOffset === 1  ? "Next Week"  : "Week";

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold text-stone-800">{label}</h2>
          <span className="text-sm text-stone-400 font-medium">{fmtRange(days)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((o) => o - 1)} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all">
            <ChevronLeft size={15} className="text-stone-500" />
          </button>
          <button onClick={() => setWeekOffset((o) => o + 1)} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all">
            <ChevronRight size={15} className="text-stone-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((date) => {
          const key       = toDateKey(date);
          const dow       = (date.getDay() + 6) % 7;
          const isWeekend = dow === 5 || dow === 6;
          return (
            <WeekDayCard
              key={key}
              date={date}
              meal={mealsByDate[key] ?? null}
              isWeekend={isWeekend}
              onAdd={()   => onOpenModal(key, null)}
              onEdit={()  => onOpenModal(key, mealsByDate[key])}
              onDelete={() => onDelete(key)}
            />
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY VIEW
// ─────────────────────────────────────────────────────────────────────────────

function MonthlyView({ monthOffset, setMonthOffset, mealsByDate, onOpenModal, onDelete }) {
  const base = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const year     = base.getFullYear();
  const month    = base.getMonth();
  const days     = useMemo(() => buildMonth(year, month), [year, month]);
  const startDow = (days[0].getDay() + 6) % 7;
  const todayKey = toDateKey(new Date());

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-5">
        <h2 className="text-xl font-bold text-stone-800">
          {MONTH_NAMES[month]} <span className="text-stone-400 font-medium">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthOffset((o) => o - 1)} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all">
            <ChevronLeft size={15} className="text-stone-500" />
          </button>
          <button onClick={() => setMonthOffset((o) => o + 1)} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all">
            <ChevronRight size={15} className="text-stone-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAY_LABELS.map((d, i) => (
          <div key={d} className={`text-center text-[11px] font-semibold tracking-wide uppercase ${i >= 5 ? "text-stone-300" : "text-stone-400"}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: startDow }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((date) => {
          const key = toDateKey(date);
          return (
            <MonthCell
              key={key}
              date={date}
              meal={mealsByDate[key] ?? null}
              isToday={key === todayKey}
              onAdd={()   => onOpenModal(key, null)}
              onEdit={()  => onOpenModal(key, mealsByDate[key])}
              onDelete={() => onDelete(key)}
            />
          );
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function MealOrder() {
  const [currentView,  setCurrentView]  = useState("weekly");
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [monthOffset,  setMonthOffset]  = useState(0);

  const { mealsByDate, setMealsByDate, loading: ordersLoading, error: ordersError, reload: reloadOrders } = useOrders();

  const [modal, setModal] = useState({ open: false, dateKey: null, editMeal: null });

  const openModal     = useCallback((dateKey, editMeal = null) => setModal({ open: true, dateKey, editMeal }), []);
  const openPlanOrder = useCallback(() => setModal({ open: true, dateKey: null, editMeal: null }), []);
  const closeModal    = useCallback(() => setModal({ open: false, dateKey: null, editMeal: null }), []);

  const handleSaved = useCallback((dateKey, newMeal) => {
    if (!dateKey) return;
    setMealsByDate((prev) => ({ ...prev, [dateKey]: newMeal }));
    closeModal();
  }, [closeModal, setMealsByDate]);

  const handleDelete = useCallback(async (dateKey) => {
    const meal = mealsByDate[dateKey];
    if (!meal) return;

    // Optimistic remove
    setMealsByDate((prev) => { const n = { ...prev }; delete n[dateKey]; return n; });

    if (meal.orderId) {
      try {
        await orderApi.remove(meal.orderId);
      } catch {
        // Rollback on failure
        setMealsByDate((prev) => ({ ...prev, [dateKey]: meal }));
      }
    }
  }, [mealsByDate, setMealsByDate]);

  return (
    <div className="min-h-screen bg-white px-10 py-10 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1
            className="text-[46px] font-black text-stone-900 leading-tight tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Meal Planning
          </h1>
          <p className="text-[15px] text-stone-400 mt-1">
            Organize your week of effortless vitality.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center bg-stone-100 rounded-full p-[3px]">
            {["weekly", "monthly"].map((v) => (
              <button
                key={v}
                onClick={() => setCurrentView(v)}
                className={`px-5 py-[7px] rounded-full text-sm font-medium capitalize transition-all duration-200 ${
                  currentView === v ? "bg-white shadow text-stone-800" : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={openPlanOrder}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 active:scale-[0.97] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-red-700/25"
          >
            <Plus size={16} />
            Plan Order
          </button>
        </div>
      </div>

      {/* Orders status */}
      {ordersLoading && (
        <div className="flex items-center gap-2 text-stone-400 text-sm mt-4">
          <Spinner size={14} />
          <span>Loading your orders…</span>
        </div>
      )}
      {ordersError && !ordersLoading && (
        <div className="mt-4">
          <InlineError message={`Could not load orders: ${ordersError}`} onRetry={reloadOrders} />
        </div>
      )}

      {/* View */}
      {currentView === "weekly" ? (
        <WeeklyView
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          mealsByDate={mealsByDate}
          onOpenModal={openModal}
          onDelete={handleDelete}
        />
      ) : (
        <MonthlyView
          monthOffset={monthOffset}
          setMonthOffset={setMonthOffset}
          mealsByDate={mealsByDate}
          onOpenModal={openModal}
          onDelete={handleDelete}
        />
      )}

      <PlanOrderModal
        open={modal.open}
        onClose={closeModal}
        onSaved={handleSaved}
        prefillDateKey={modal.dateKey}
        prefillMeal={modal.editMeal}
      />
    </div>
  );
}