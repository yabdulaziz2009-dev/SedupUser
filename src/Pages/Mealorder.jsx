// import { useState, useRef, useEffect, useMemo, useCallback } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Plus,
//   Clock,
//   Pencil,
//   Trash2,
//   X,
//   Upload,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────────────────────

// const DAY_LABELS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// const MONTH_NAMES = ["January","February","March","April","May","June",
//                      "July","August","September","October","November","December"];
// const CATEGORIES  = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];

// // ─────────────────────────────────────────────────────────────────────────────
// // DATE UTILITIES  (pure functions, no side-effects)
// // ─────────────────────────────────────────────────────────────────────────────

// /** "2025-04-28" — stable key that never depends on locale / timezone */
// const toDateKey = (d) => {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// };

// /** Monday of the week that contains `ref`, shifted by `weekOffset` */
// const getMondayOf = (ref, weekOffset = 0) => {
//   const d = new Date(ref);
//   d.setHours(0, 0, 0, 0);
//   const dow = d.getDay(); // 0=Sun
//   d.setDate(d.getDate() - ((dow + 6) % 7) + weekOffset * 7);
//   return d;
// };

// /** 7 Date objects Mon-Sun for a given Monday */
// const buildWeek = (monday) =>
//   Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(monday);
//     d.setDate(monday.getDate() + i);
//     return d;
//   });

// /** All Date objects in a calendar month */
// const buildMonth = (year, month) => {
//   const days = [];
//   const d = new Date(year, month, 1);
//   while (d.getMonth() === month) {
//     days.push(new Date(d));
//     d.setDate(d.getDate() + 1);
//   }
//   return days;
// };

// /** "Apr 28 – May 4" */
// const fmtRange = (days) => {
//   const f = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
//   return `${f(days[0])} – ${f(days[6])}`;
// };

// /** "12:30 PM" → "12:30" for <input type="time"> */
// const toTimeInput = (display) => {
//   if (!display) return "";
//   const m = display.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
//   if (!m) return "";
//   let hr = parseInt(m[1], 10);
//   const min = m[2];
//   const period = m[3].toUpperCase();
//   if (period === "PM" && hr < 12) hr += 12;
//   if (period === "AM" && hr === 12) hr = 0;
//   return `${String(hr).padStart(2, "0")}:${min}`;
// };

// /** "13:30" → "1:30 PM" */
// const fromTimeInput = (val) => {
//   if (!val) return "";
//   const [h, min] = val.split(":");
//   const hr = parseInt(h, 10);
//   const period = hr >= 12 ? "PM" : "AM";
//   const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
//   return `${hr12}:${min} ${period}`;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SEED DATA  — keyed by "YYYY-MM-DD", relative to today so it always shows
// // ─────────────────────────────────────────────────────────────────────────────

// const buildSeedMeals = () => {
//   const today  = new Date();
//   const monday = getMondayOf(today, 0);
//   const week   = buildWeek(monday);

//   return {
//     [toDateKey(week[1])]: {
//       title: "Green Salad Bowl",
//       restaurant: "Green Leaf Cafe",
//       time: "12:30 PM",
//       category: "Lunch",
//       image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
//     },
//     [toDateKey(week[3])]: {
//       title: "Atlantic Salmon",
//       restaurant: "Ocean Catch",
//       time: "6:45 PM",
//       category: "Dinner",
//       image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
//     },
//     [toDateKey(week[0])]: {
//       title: "Avocado Toast",
//       restaurant: "Morning Bloom",
//       time: "8:00 AM",
//       category: "Breakfast",
//       image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=300&fit=crop",
//     },
//   };
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SHARED PRIMITIVES
// // ─────────────────────────────────────────────────────────────────────────────

// function ActivityDot({ active }) {
//   return (
//     <span
//       className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
//         active ? "bg-red-500" : "bg-stone-200"
//       }`}
//     />
//   );
// }

// function TimeBadge({ time }) {
//   return (
//     <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-[3px] shadow-md">
//       <Clock size={9} className="text-stone-400" />
//       <span className="text-[10px] font-semibold text-stone-700 leading-none tracking-tight">
//         {time}
//       </span>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // WEEK DAY CARD
// // ─────────────────────────────────────────────────────────────────────────────

// function WeekDayCard({ date, meal, isWeekend, onAdd, onEdit, onDelete }) {
//   const [hovered, setHovered] = useState(false);

//   // 0=Mon … 6=Sun from JS getDay() (0=Sun,1=Mon…)
//   const dow     = (date.getDay() + 6) % 7;
//   const dayName = DAY_LABELS[dow];
//   const dayNum  = date.getDate();
//   const isToday = toDateKey(date) === toDateKey(new Date());

//   if (isWeekend) {
//     return (
//       <div className="flex flex-col min-h-[232px]">
//         <div className="flex items-center justify-between mb-3 h-6">
//           <span className="text-sm font-medium text-stone-300">
//             {dayName}{" "}
//             <span className="font-normal">{dayNum}</span>
//           </span>
//           <ActivityDot active={false} />
//         </div>
//         <div className="flex-1 rounded-2xl bg-stone-50/80 flex items-center justify-center select-none">
//           <span className="text-xs text-stone-300 font-medium tracking-wide uppercase">
//             Weekend off
//           </span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-[232px]">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3 h-6">
//         <span
//           className={`text-sm font-semibold leading-none ${
//             isToday ? "text-red-600" : "text-stone-800"
//           }`}
//         >
//           {dayName}{" "}
//           <span
//             className={`font-normal ${isToday ? "text-red-400" : "text-stone-400"}`}
//           >
//             {dayNum}
//           </span>
//         </span>
//         <ActivityDot active={!!meal} />
//       </div>

//       {/* Body */}
//       {meal ? (
//         <div
//           className={`flex-1 rounded-2xl overflow-hidden border relative cursor-default
//             transition-all duration-200
//             ${hovered
//               ? "border-red-300 shadow-lg shadow-red-100 scale-[1.015]"
//               : "border-red-100 shadow-sm"
//             }`}
//           onMouseEnter={() => setHovered(true)}
//           onMouseLeave={() => setHovered(false)}
//         >
//           <img
//             src={meal.image}
//             alt={meal.title}
//             className="w-full h-[118px] object-cover"
//             loading="lazy"
//           />
//           <TimeBadge time={meal.time} />

//           {/* Action overlay */}
//           <div
//             className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/25 transition-opacity duration-150 ${
//               hovered ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             <button
//               onClick={onEdit}
//               className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-stone-50 hover:scale-110 active:scale-95 transition-transform"
//             >
//               <Pencil size={12} className="text-stone-700" />
//             </button>
//             <button
//               onClick={onDelete}
//               className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 active:scale-95 transition-transform"
//             >
//               <Trash2 size={12} className="text-red-500" />
//             </button>
//           </div>

//           <div className="px-3 pt-2 pb-3">
//             <p className="text-sm font-semibold text-stone-800 truncate leading-tight">
//               {meal.title}
//             </p>
//             <p className="text-[11px] text-stone-400 truncate mt-0.5">
//               {meal.restaurant}
//             </p>
//           </div>
//         </div>
//       ) : (
//         <button
//           onClick={onAdd}
//           className="flex-1 rounded-2xl border-2 border-dashed border-stone-200
//             flex flex-col items-center justify-center gap-2
//             hover:border-red-300 hover:bg-red-50/40 hover:shadow-sm
//             active:scale-[0.98] transition-all duration-200 group"
//         >
//           <div
//             className="w-9 h-9 rounded-full border-2 border-stone-200
//               group-hover:border-red-400 group-hover:bg-red-50
//               flex items-center justify-center transition-all duration-200"
//           >
//             <Plus size={16} className="text-stone-300 group-hover:text-red-400 transition-colors" />
//           </div>
//           <span className="text-xs font-medium text-stone-300 group-hover:text-red-400 transition-colors">
//             Add Meal
//           </span>
//         </button>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MONTHLY CELL
// // ─────────────────────────────────────────────────────────────────────────────

// function MonthCell({ date, meal, isToday, onAdd, onEdit, onDelete }) {
//   const [hovered, setHovered] = useState(false);
//   const dow       = (date.getDay() + 6) % 7;
//   const isWeekend = dow === 5 || dow === 6;

//   return (
//     <div
//       className={`relative rounded-xl border p-2 flex flex-col min-h-[88px] transition-all duration-200
//         ${isWeekend
//           ? "bg-stone-50/60 border-stone-100"
//           : isToday
//           ? "border-red-300 bg-red-50/20 shadow-sm"
//           : "border-stone-100 bg-white hover:border-stone-200 hover:shadow-sm"
//         }`}
//       onMouseEnter={() => !isWeekend && setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Day number */}
//       <div className="flex items-center justify-between mb-1">
//         <span
//           className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full
//             ${isToday
//               ? "bg-red-600 text-white"
//               : isWeekend
//               ? "text-stone-300"
//               : "text-stone-500"
//             }`}
//         >
//           {date.getDate()}
//         </span>
//         {meal && !isWeekend && <ActivityDot active />}
//       </div>

//       {/* Meal or add trigger */}
//       {!isWeekend && (
//         meal ? (
//           <div className="relative flex-1">
//             <img
//               src={meal.image}
//               alt={meal.title}
//               className="w-full h-9 object-cover rounded-lg"
//               loading="lazy"
//             />
//             <p className="text-[10px] font-semibold text-stone-700 truncate mt-1 leading-tight">
//               {meal.title}
//             </p>
//             <p className="text-[9px] text-stone-400 truncate">{meal.time}</p>

//             {hovered && (
//               <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center gap-1">
//                 <button
//                   onClick={onEdit}
//                   className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow hover:bg-stone-50 transition-colors"
//                 >
//                   <Pencil size={10} className="text-stone-700" />
//                 </button>
//                 <button
//                   onClick={onDelete}
//                   className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
//                 >
//                   <Trash2 size={10} className="text-red-500" />
//                 </button>
//               </div>
//             )}
//           </div>
//         ) : (
//           hovered && (
//             <button
//               onClick={onAdd}
//               className="flex-1 flex items-center justify-center gap-1 text-stone-300 hover:text-red-400 transition-colors mt-1"
//             >
//               <Plus size={11} />
//               <span className="text-[10px] font-medium">Add</span>
//             </button>
//           )
//         )
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MEAL MODAL
// // props:
// //   open        — boolean
// //   onClose     — () => void
// //   onSave      — (dateKey: string, meal: object) => void
// //   initialData — meal object | null  (null = new meal)
// //   initialDate — "YYYY-MM-DD" | null  (null = Plan Order flow, user picks date)
// //   planOrder   — boolean: true when opened from "Plan Order" button
// // ─────────────────────────────────────────────────────────────────────────────

// const BLANK_FORM = { title: "", restaurant: "", time: "", category: "Lunch", image: "" };

// // Next 14 weekdays (Mon–Fri) starting from today, formatted for the date picker
// function getSelectableDays(count = 14) {
//   const days = [];
//   const d = new Date();
//   d.setHours(0, 0, 0, 0);
//   while (days.length < count) {
//     const dow = d.getDay(); // 0=Sun 6=Sat
//     if (dow !== 0 && dow !== 6) {
//       days.push(new Date(d));
//     }
//     d.setDate(d.getDate() + 1);
//   }
//   return days;
// }

// function MealModal({ open, onClose, onSave, initialData, initialDate, planOrder }) {
//   const fileRef = useRef(null);
//   const [form,        setForm]       = useState(BLANK_FORM);
//   const [preview,     setPreview]    = useState("");
//   const [selectedKey, setSelectedKey] = useState(""); // only used in planOrder mode

//   const selectableDays = useMemo(() => getSelectableDays(14), []);

//   // Sync every time modal opens
//   useEffect(() => {
//     if (open) {
//       const data = initialData ?? BLANK_FORM;
//       setForm(data);
//       setPreview(data.image ?? "");
//       // Pre-select: if we have a specific date use it, else first available weekday
//       if (planOrder) {
//         setSelectedKey(initialDate ?? toDateKey(selectableDays[0]));
//       } else {
//         setSelectedKey(initialDate ?? "");
//       }
//     }
//   }, [open, initialData, initialDate, planOrder, selectableDays]);

//   const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

//   const handleFile = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const url = URL.createObjectURL(file);
//     setPreview(url);
//     set("image", url);
//   };

//   const handleSave = () => {
//     if (!form.title.trim()) return;
//     const dateKey = planOrder ? selectedKey : initialDate;
//     if (!dateKey) return;
//     onSave(dateKey, { ...form, image: preview || form.image });
//   };

//   const isValid = form.title.trim() && form.time && (!planOrder || selectedKey);

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Backdrop */}
//       <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />

//       {/* Panel */}
//       <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[440px] mx-4 p-6 z-10">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-5">
//           <div>
//             <h2 className="text-[17px] font-bold text-stone-800 tracking-tight leading-tight">
//               {planOrder ? "Plan New Order" : initialData ? "Edit Meal" : "Add Meal"}
//             </h2>
//             {planOrder && (
//               <p className="text-xs text-stone-400 mt-0.5">
//                 Choose a day, time and meal details
//               </p>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-all"
//           >
//             <X size={14} className="text-stone-500" />
//           </button>
//         </div>

//         {/* ── DAY PICKER  (Plan Order only) ───────────────────────────────── */}
//         {planOrder && (
//           <div className="mb-4">
//             <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">
//               Select Day
//             </label>
//             <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
//               {selectableDays.map((d) => {
//                 const key   = toDateKey(d);
//                 const isAct = key === selectedKey;
//                 const dow   = DAY_LABELS[(d.getDay() + 6) % 7];
//                 const num   = d.getDate();
//                 const mon   = d.toLocaleDateString("en-US", { month: "short" });
//                 return (
//                   <button
//                     key={key}
//                     onClick={() => setSelectedKey(key)}
//                     className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all duration-150 ${
//                       isAct
//                         ? "bg-red-700 border-red-700 text-white shadow-md shadow-red-700/20"
//                         : "bg-stone-50 border-stone-200 text-stone-600 hover:border-red-300 hover:bg-red-50"
//                     }`}
//                   >
//                     <span className={`text-[10px] font-semibold uppercase tracking-wide ${isAct ? "text-red-200" : "text-stone-400"}`}>
//                       {dow}
//                     </span>
//                     <span className="text-sm font-bold leading-tight">{num}</span>
//                     <span className={`text-[10px] ${isAct ? "text-red-200" : "text-stone-400"}`}>{mon}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── IMAGE UPLOAD ────────────────────────────────────────────────── */}
//         <div
//           className="relative mb-4 rounded-2xl overflow-hidden bg-stone-100 h-32 flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors group"
//           onClick={() => fileRef.current?.click()}
//         >
//           {preview ? (
//             <>
//               <img src={preview} alt="preview" className="w-full h-full object-cover" />
//               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
//                 <Upload size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//               </div>
//             </>
//           ) : (
//             <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-stone-500 transition-colors">
//               <Upload size={20} />
//               <span className="text-xs font-medium">Upload meal photo</span>
//             </div>
//           )}
//           <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
//         </div>

//         {/* ── FORM FIELDS ─────────────────────────────────────────────────── */}
//         <div className="space-y-3">
//           <input
//             value={form.title}
//             onChange={(e) => set("title", e.target.value)}
//             placeholder="Meal title (e.g. Atlantic Salmon)"
//             className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
//           />
//           <input
//             value={form.restaurant}
//             onChange={(e) => set("restaurant", e.target.value)}
//             placeholder="Restaurant or source"
//             className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
//           />
//           <div className="grid grid-cols-2 gap-3">
//             {/* Time picker */}
//             <div className="relative">
//               <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
//               <input
//                 type="time"
//                 value={toTimeInput(form.time)}
//                 onChange={(e) => set("time", fromTimeInput(e.target.value))}
//                 className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
//               />
//             </div>
//             {/* Category */}
//             <select
//               value={form.category}
//               onChange={(e) => set("category", e.target.value)}
//               className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
//             >
//               {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* ── ACTIONS ─────────────────────────────────────────────────────── */}
//         <div className="flex gap-3 mt-6">
//           <button
//             onClick={onClose}
//             className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={!isValid}
//             className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-[0.98] ${
//               isValid
//                 ? "bg-red-700 hover:bg-red-800 text-white shadow-red-700/20"
//                 : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
//             }`}
//           >
//             {planOrder ? "Confirm Order" : initialData ? "Save Changes" : "Add Meal"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // WEEKLY VIEW
// // ─────────────────────────────────────────────────────────────────────────────

// function WeeklyView({ weekOffset, setWeekOffset, mealsByDate, onOpenModal, onDelete }) {
//   const today  = useMemo(() => new Date(), []);
//   const monday = useMemo(() => getMondayOf(today, weekOffset), [today, weekOffset]);
//   const days   = useMemo(() => buildWeek(monday), [monday]);

//   const label = weekOffset === 0  ? "This Week"
//               : weekOffset === -1 ? "Last Week"
//               : weekOffset === 1  ? "Next Week"
//               : "Week";

//   return (
//     <>
//       {/* Section header */}
//       <div className="flex items-center justify-between mt-8 mb-6">
//         <div className="flex items-baseline gap-3">
//           <h2 className="text-xl font-bold text-stone-800">{label}</h2>
//           <span className="text-sm text-stone-400 font-medium">{fmtRange(days)}</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setWeekOffset((o) => o - 1)}
//             className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
//           >
//             <ChevronLeft size={15} className="text-stone-500" />
//           </button>
//           <button
//             onClick={() => setWeekOffset((o) => o + 1)}
//             className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
//           >
//             <ChevronRight size={15} className="text-stone-500" />
//           </button>
//         </div>
//       </div>

//       {/* 7-column grid */}
//       <div className="grid grid-cols-7 gap-4">
//         {days.map((date) => {
//           const key       = toDateKey(date);
//           const dow       = (date.getDay() + 6) % 7;
//           const isWeekend = dow === 5 || dow === 6;

//           return (
//             <WeekDayCard
//               key={key}
//               date={date}
//               meal={mealsByDate[key] ?? null}
//               isWeekend={isWeekend}
//               onAdd={() => onOpenModal(key, null)}
//               onEdit={() => onOpenModal(key, mealsByDate[key])}
//               onDelete={() => onDelete(key)}
//             />
//           );
//         })}
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MONTHLY VIEW
// // ─────────────────────────────────────────────────────────────────────────────

// function MonthlyView({ monthOffset, setMonthOffset, mealsByDate, onOpenModal, onDelete }) {
//   const base = useMemo(() => {
//     const d = new Date();
//     d.setDate(1);
//     d.setMonth(d.getMonth() + monthOffset);
//     return d;
//   }, [monthOffset]);

//   const year  = base.getFullYear();
//   const month = base.getMonth();
//   const days  = useMemo(() => buildMonth(year, month), [year, month]);

//   // Padding cells so grid starts on Monday
//   const startDow  = (days[0].getDay() + 6) % 7; // 0=Mon
//   const todayKey  = toDateKey(new Date());

//   return (
//     <>
//       {/* Section header */}
//       <div className="flex items-center justify-between mt-8 mb-5">
//         <h2 className="text-xl font-bold text-stone-800">
//           {MONTH_NAMES[month]}{" "}
//           <span className="text-stone-400 font-medium">{year}</span>
//         </h2>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setMonthOffset((o) => o - 1)}
//             className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
//           >
//             <ChevronLeft size={15} className="text-stone-500" />
//           </button>
//           <button
//             onClick={() => setMonthOffset((o) => o + 1)}
//             className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
//           >
//             <ChevronRight size={15} className="text-stone-500" />
//           </button>
//         </div>
//       </div>

//       {/* Day-name header row */}
//       <div className="grid grid-cols-7 gap-2 mb-2">
//         {DAY_LABELS.map((d, i) => (
//           <div
//             key={d}
//             className={`text-center text-[11px] font-semibold tracking-wide uppercase ${
//               i >= 5 ? "text-stone-300" : "text-stone-400"
//             }`}
//           >
//             {d}
//           </div>
//         ))}
//       </div>

//       {/* Calendar grid */}
//       <div className="grid grid-cols-7 gap-2">
//         {/* Leading empty cells */}
//         {Array.from({ length: startDow }).map((_, i) => (
//           <div key={`pad-${i}`} />
//         ))}

//         {days.map((date) => {
//           const key = toDateKey(date);
//           return (
//             <MonthCell
//               key={key}
//               date={date}
//               meal={mealsByDate[key] ?? null}
//               isToday={key === todayKey}
//               onAdd={() => onOpenModal(key, null)}
//               onEdit={() => onOpenModal(key, mealsByDate[key])}
//               onDelete={() => onDelete(key)}
//             />
//           );
//         })}
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ROOT PAGE
// // ─────────────────────────────────────────────────────────────────────────────

// export default function MealOrder() {
//   // ── view state ──────────────────────────────────────────────────────────────
//   const [currentView,  setCurrentView]  = useState("weekly");   // "weekly" | "monthly"
//   const [weekOffset,   setWeekOffset]   = useState(0);          // integer: weeks from today
//   const [monthOffset,  setMonthOffset]  = useState(0);          // integer: months from today

//   // ── meals: { "YYYY-MM-DD": { title, restaurant, time, category, image } } ──
//   const [mealsByDate, setMealsByDate] = useState(() => buildSeedMeals());

//   // ── modal ────────────────────────────────────────────────────────────────────
//   // planOrder=true  → user picks date inside the modal (Plan Order button flow)
//   // planOrder=false → dateKey already known (Add Meal / Edit on a specific day)
//   const [modal, setModal] = useState({
//     open: false,
//     dateKey: null,   // null when planOrder=true (user picks inside modal)
//     editData: null,
//     planOrder: false,
//   });

//   const openModal = useCallback((dateKey, editData = null) => {
//     setModal({ open: true, dateKey, editData, planOrder: false });
//   }, []);

//   const openPlanOrder = useCallback(() => {
//     setModal({ open: true, dateKey: null, editData: null, planOrder: true });
//   }, []);

//   const closeModal = useCallback(() => {
//     setModal({ open: false, dateKey: null, editData: null, planOrder: false });
//   }, []);

//   // onSave receives (dateKey, mealData) — dateKey comes from modal when planOrder=true
//   const handleSave = useCallback((dateKey, data) => {
//     if (!dateKey) return;
//     setMealsByDate((prev) => ({ ...prev, [dateKey]: data }));
//     closeModal();
//   }, [closeModal]);

//   const handleDelete = useCallback((dateKey) => {
//     setMealsByDate((prev) => {
//       const next = { ...prev };
//       delete next[dateKey];
//       return next;
//     });
//   }, []);

//   return (
//     <div className="min-h-screen bg-white px-10 py-10 font-sans">

//       {/* ── Page header ─────────────────────────────────────────────────────── */}
//       <div className="flex items-start justify-between mb-2">
//         <div>
//           <h1
//             className="text-[46px] font-black text-stone-900 leading-tight tracking-tight"
//             style={{ fontFamily: "'Georgia', serif" }}
//           >
//             Meal Planning
//           </h1>
//           <p className="text-[15px] text-stone-400 mt-1">
//             Organize your week of effortless vitality.
//           </p>
//         </div>

//         <div className="flex items-center gap-3 mt-2">
//           {/* Weekly / Monthly pill toggle */}
//           <div className="flex items-center bg-stone-100 rounded-full p-[3px]">
//             {(["weekly", "monthly"] ).map((v) => (
//               <button
//                 key={v}
//                 onClick={() => setCurrentView(v)}
//                 className={`px-5 py-[7px] rounded-full text-sm font-medium capitalize transition-all duration-200 ${
//                   currentView === v
//                     ? "bg-white shadow text-stone-800"
//                     : "text-stone-500 hover:text-stone-700"
//                 }`}
//               >
//                 {v.charAt(0).toUpperCase() + v.slice(1)}
//               </button>
//             ))}
//           </div>

//           {/* CTA */}
//           <button
//             onClick={openPlanOrder}
//             className="flex items-center gap-2 bg-red-700 hover:bg-red-800 active:scale-[0.97] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg shadow-red-700/25"
//           >
//             <Plus size={16} />
//             Plan Order
//           </button>
//         </div>
//       </div>

//       {/* ── View render ─────────────────────────────────────────────────────── */}
//       {currentView === "weekly" ? (
//         <WeeklyView
//           weekOffset={weekOffset}
//           setWeekOffset={setWeekOffset}
//           mealsByDate={mealsByDate}
//           onOpenModal={openModal}
//           onDelete={handleDelete}
//         />
//       ) : (
//         <MonthlyView
//           monthOffset={monthOffset}
//           setMonthOffset={setMonthOffset}
//           mealsByDate={mealsByDate}
//           onOpenModal={openModal}
//           onDelete={handleDelete}
//         />
//       )}

//       {/* ── Modal ───────────────────────────────────────────────────────────── */}
//       <MealModal
//         open={modal.open}
//         onClose={closeModal}
//         onSave={handleSave}
//         initialData={modal.editData}
//         initialDate={modal.dateKey}
//         planOrder={modal.planOrder}
//       />
//     </div>
//   );
// }





import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  UtensilsCrossed,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// Quick-pick time slots shown as chips
const TIME_SLOTS = [
  "7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM",
  "12:00 PM","12:30 PM","1:00 PM","1:30 PM",
  "6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM",
];

// ─────────────────────────────────────────────────────────────────────────────
// MEAL CATALOG  — the "menu" customers choose from
// ─────────────────────────────────────────────────────────────────────────────

const MEAL_CATALOG = [
  {
    id: "m1",
    title: "Green Salad Bowl",
    restaurant: "Green Leaf Cafe",
    category: "Lunch",
    price: "$12.50",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  },
  {
    id: "m2",
    title: "Atlantic Salmon",
    restaurant: "Ocean Catch",
    category: "Dinner",
    price: "$24.00",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
  },
  {
    id: "m3",
    title: "Avocado Toast",
    restaurant: "Morning Bloom",
    category: "Breakfast",
    price: "$9.00",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&h=300&fit=crop",
  },
  {
    id: "m4",
    title: "Grilled Chicken Bowl",
    restaurant: "FitEats",
    category: "Lunch",
    price: "$14.00",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  },
  {
    id: "m5",
    title: "Beef Tacos",
    restaurant: "Taco Fiesta",
    category: "Dinner",
    price: "$13.50",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
  },
  {
    id: "m6",
    title: "Acai Berry Bowl",
    restaurant: "Bloom Kitchen",
    category: "Breakfast",
    price: "$11.00",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
  },
  {
    id: "m7",
    title: "Margherita Pizza",
    restaurant: "Napoli House",
    category: "Dinner",
    price: "$16.00",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
  },
  {
    id: "m8",
    title: "Caesar Salad",
    restaurant: "The Garden",
    category: "Lunch",
    price: "$11.50",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop",
  },
  {
    id: "m9",
    title: "Smoothie Bowl",
    restaurant: "Morning Bloom",
    category: "Breakfast",
    price: "$10.00",
    image: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop",
  },
];

const CATALOG_CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner"];

// ─────────────────────────────────────────────────────────────────────────────
// DATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

// Next N weekdays (Mon–Fri) starting from today
const getUpcomingWeekdays = (count = 14) => {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const toTimeInput = (display) => {
  if (!display) return "";
  const m = display.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return "";
  let hr = parseInt(m[1], 10);
  if (m[3].toUpperCase() === "PM" && hr < 12) hr += 12;
  if (m[3].toUpperCase() === "AM" && hr === 12) hr = 0;
  return `${String(hr).padStart(2, "0")}:${m[2]}`;
};

const fromTimeInput = (val) => {
  if (!val) return "";
  const [h, min] = val.split(":");
  const hr = parseInt(h, 10);
  const period = hr >= 12 ? "PM" : "AM";
  const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${hr12}:${min} ${period}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const buildSeedMeals = () => {
  const monday = getMondayOf(new Date(), 0);
  const week = buildWeek(monday);
  return {
    [toDateKey(week[1])]: { ...MEAL_CATALOG[0], time: "12:30 PM" },
    [toDateKey(week[3])]: { ...MEAL_CATALOG[1], time: "6:45 PM" },
    [toDateKey(week[0])]: { ...MEAL_CATALOG[2], time: "8:00 AM" },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function ActivityDot({ active }) {
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
        active ? "bg-red-500" : "bg-stone-200"
      }`}
    />
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

// ─────────────────────────────────────────────────────────────────────────────
// WEEK DAY CARD
// ─────────────────────────────────────────────────────────────────────────────

function WeekDayCard({ date, meal, isWeekend, onAdd, onEdit, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const dow = (date.getDay() + 6) % 7;
  const dayName = DAY_LABELS[dow];
  const dayNum = date.getDate();
  const isToday = toDateKey(date) === toDateKey(new Date());

  if (isWeekend) {
    return (
      <div className="flex flex-col min-h-[232px]">
        <div className="flex items-center justify-between mb-3 h-6">
          <span className="text-sm font-medium text-stone-300">
            {dayName} <span className="font-normal">{dayNum}</span>
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
          {dayName}{" "}
          <span className={`font-normal ${isToday ? "text-red-400" : "text-stone-400"}`}>
            {dayNum}
          </span>
        </span>
        <ActivityDot active={!!meal} />
      </div>

      {meal ? (
        <div
          className={`flex-1 rounded-2xl overflow-hidden border relative transition-all duration-200 ${
            hovered ? "border-red-300 shadow-lg shadow-red-100 scale-[1.015]" : "border-red-100 shadow-sm"
          }`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img src={meal.image} alt={meal.title} className="w-full h-[118px] object-cover" loading="lazy" />
          <TimeBadge time={meal.time} />

          <div
            className={`absolute inset-0 flex items-center justify-center gap-2 bg-black/25 transition-opacity duration-150 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
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
  const dow = (date.getDay() + 6) % 7;
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
        <span
          className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
            isToday ? "bg-red-600 text-white" : isWeekend ? "text-stone-300" : "text-stone-500"
          }`}
        >
          {date.getDate()}
        </span>
        {meal && !isWeekend && <ActivityDot active />}
      </div>

      {!isWeekend && (
        meal ? (
          <div className="relative flex-1">
            <img src={meal.image} alt={meal.title} className="w-full h-9 object-cover rounded-lg" loading="lazy" />
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
        )
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAN ORDER MODAL  — 3-step wizard
//   Step 1: Pick a meal from catalog
//   Step 2: Pick a day
//   Step 3: Pick a time  →  Confirm
//
// Also used for "Edit" (skips to step 3, meal + day already known)
// ─────────────────────────────────────────────────────────────────────────────

function PlanOrderModal({ open, onClose, onSave, prefillDateKey, prefillMeal }) {
  const isEdit = !!prefillMeal;

  // step: 1 | 2 | 3
  const [step, setStep] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const upcomingDays = useMemo(() => getUpcomingWeekdays(14), []);

  // Reset / prefill whenever modal opens
  useEffect(() => {
    if (open) {
      if (isEdit) {
        setSelectedMeal(prefillMeal);
        setSelectedDateKey(prefillDateKey ?? "");
        setSelectedTime(prefillMeal.time ?? "");
        setStep(3); // edit jumps straight to time step
      } else if (prefillDateKey) {
        // opened from a specific day card → skip to step 1 (meal pick), day pre-selected
        setSelectedMeal(null);
        setSelectedDateKey(prefillDateKey);
        setSelectedTime("");
        setStep(1);
      } else {
        // Plan Order from header button
        setSelectedMeal(null);
        setSelectedDateKey("");
        setSelectedTime("");
        setStep(1);
      }
      setSearchQuery("");
      setActiveCategory("All");
    }
  }, [open, isEdit, prefillMeal, prefillDateKey]);

  const filteredMeals = useMemo(() => {
    return MEAL_CATALOG.filter((m) => {
      const matchCat = activeCategory === "All" || m.category === activeCategory;
      const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const canConfirm = selectedMeal && selectedDateKey && selectedTime;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onSave(selectedDateKey, { ...selectedMeal, time: selectedTime });
  };

  // Step titles & progress
  const steps = isEdit
    ? [{ label: "Time" }]
    : prefillDateKey
    ? [{ label: "Meal" }, { label: "Time" }]
    : [{ label: "Meal" }, { label: "Day" }, { label: "Time" }];

  const totalSteps = steps.length;
  const currentStepIndex = isEdit ? 0 : prefillDateKey ? step - 1 : step - 1;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-[520px] sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh]">

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-stone-800 tracking-tight leading-tight">
              {isEdit ? "Edit Meal Time" : "Plan New Order"}
            </h2>
            {!isEdit && (
              <p className="text-xs text-stone-400 mt-0.5">
                {step === 1 && "Choose a meal from the menu"}
                {step === 2 && "Pick a delivery day"}
                {step === 3 && "Set your meal time"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Step indicator dots */}
            {!isEdit && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i < currentStepIndex
                        ? "w-2 h-2 bg-red-600"
                        : i === currentStepIndex
                        ? "w-5 h-2 bg-red-600"
                        : "w-2 h-2 bg-stone-200"
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-all"
            >
              <X size={14} className="text-stone-500" />
            </button>
          </div>
        </div>

        {/* ── STEP CONTENT ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">

          {/* ── STEP 1: MEAL SELECTION ─────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meals or restaurants..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
                />
              </div>

              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {CATALOG_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                      activeCategory === cat
                        ? "bg-red-700 text-white shadow-sm"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Meal grid */}
              {filteredMeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-stone-300">
                  <UtensilsCrossed size={32} />
                  <p className="text-sm mt-2">No meals found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredMeals.map((meal) => {
                    const isSelected = selectedMeal?.id === meal.id;
                    return (
                      <button
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal)}
                        className={`relative rounded-2xl overflow-hidden border-2 text-left transition-all duration-150 active:scale-[0.98] ${
                          isSelected
                            ? "border-red-600 shadow-lg shadow-red-100"
                            : "border-transparent hover:border-stone-200"
                        }`}
                      >
                        <img
                          src={meal.image}
                          alt={meal.title}
                          className="w-full h-28 object-cover"
                          loading="lazy"
                        />
                        {/* Selected checkmark */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow">
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                        {/* Category chip */}
                        <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <span className="text-[9px] font-semibold text-white uppercase tracking-wide">
                            {meal.category}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <p className="text-sm font-bold text-stone-800 leading-tight truncate">
                            {meal.title}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">{meal.restaurant}</p>
                          <p className="text-xs font-semibold text-red-600 mt-1">{meal.price}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: DAY SELECTION ──────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              {/* Selected meal recap */}
              {selectedMeal && (
                <div className="flex items-center gap-3 bg-stone-50 rounded-2xl p-3">
                  <img
                    src={selectedMeal.image}
                    alt={selectedMeal.title}
                    className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">{selectedMeal.title}</p>
                    <p className="text-xs text-stone-400 truncate">{selectedMeal.restaurant}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="ml-auto flex-shrink-0 text-xs text-red-500 font-semibold hover:text-red-700 transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-1">
                Select delivery day
              </p>

              {/* Day list */}
              <div className="flex flex-col gap-2">
                {upcomingDays.map((d) => {
                  const key = toDateKey(d);
                  const isSelected = key === selectedDateKey;
                  const isToday = key === toDateKey(new Date());
                  const dow = DAY_LABELS[(d.getDay() + 6) % 7];
                  const dayNum = d.getDate();
                  const mon = d.toLocaleDateString("en-US", { month: "long" });

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDateKey(key)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all duration-150 active:scale-[0.99] ${
                        isSelected
                          ? "border-red-600 bg-red-50 shadow-sm"
                          : "border-stone-100 bg-white hover:border-stone-200"
                      }`}
                    >
                      {/* Day pill */}
                      <div
                        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-red-600" : "bg-stone-100"
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase tracking-wide leading-none ${isSelected ? "text-red-200" : "text-stone-400"}`}>
                          {dow}
                        </span>
                        <span className={`text-lg font-black leading-tight ${isSelected ? "text-white" : "text-stone-700"}`}>
                          {dayNum}
                        </span>
                      </div>

                      <div className="text-left">
                        <p className={`text-sm font-semibold ${isSelected ? "text-red-700" : "text-stone-700"}`}>
                          {isToday ? "Today" : d.toLocaleDateString("en-US", { weekday: "long" })}
                        </p>
                        <p className="text-xs text-stone-400">{mon} {dayNum}</p>
                      </div>

                      {isSelected && (
                        <div className="ml-auto w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 3: TIME SELECTION ─────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              {/* Recap card — meal + day */}
              <div className="bg-stone-50 rounded-2xl p-3 flex items-center gap-3">
                <img
                  src={selectedMeal?.image}
                  alt={selectedMeal?.title}
                  className="w-12 h-12 object-cover rounded-xl flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-stone-800 truncate">{selectedMeal?.title}</p>
                  <p className="text-xs text-stone-400">{selectedMeal?.restaurant}</p>
                </div>
                {selectedDateKey && !isEdit && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold text-stone-600">
                      {new Date(selectedDateKey + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[11px] text-red-500 font-semibold hover:text-red-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Quick time chips */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Quick pick
                </p>
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
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Or set custom time
                </p>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="time"
                    value={toTimeInput(selectedTime)}
                    onChange={(e) => setSelectedTime(fromTimeInput(e.target.value))}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ACTIONS ───────────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-2 flex-shrink-0 border-t border-stone-100">
          <div className="flex gap-3 mt-4">
            {/* Back button (steps 2+) */}
            {!isEdit && step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all"
              >
                ← Back
              </button>
            )}

            {/* Cancel on step 1 */}
            {(isEdit || step === 1) && (
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            )}

            {/* Next / Confirm */}
            {!isEdit && step < (prefillDateKey ? 2 : 3) ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedMeal) return;
                  if (step === 2 && !selectedDateKey) return;
                  setStep((s) => s + 1);
                }}
                disabled={
                  (step === 1 && !selectedMeal) ||
                  (step === 2 && !selectedDateKey)
                }
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-[0.98] ${
                  (step === 1 && !selectedMeal) || (step === 2 && !selectedDateKey)
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                    : "bg-red-700 hover:bg-red-800 text-white shadow-red-700/20"
                }`}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!canConfirm}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg active:scale-[0.98] ${
                  canConfirm
                    ? "bg-red-700 hover:bg-red-800 text-white shadow-red-700/20"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                }`}
              >
                {isEdit ? "Save Changes" : "Confirm Order ✓"}
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
  const today = useMemo(() => new Date(), []);
  const monday = useMemo(() => getMondayOf(today, weekOffset), [today, weekOffset]);
  const days = useMemo(() => buildWeek(monday), [monday]);

  const label =
    weekOffset === 0 ? "This Week" :
    weekOffset === -1 ? "Last Week" :
    weekOffset === 1 ? "Next Week" : "Week";

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="text-xl font-bold text-stone-800">{label}</h2>
          <span className="text-sm text-stone-400 font-medium">{fmtRange(days)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
          >
            <ChevronLeft size={15} className="text-stone-500" />
          </button>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
          >
            <ChevronRight size={15} className="text-stone-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {days.map((date) => {
          const key = toDateKey(date);
          const dow = (date.getDay() + 6) % 7;
          const isWeekend = dow === 5 || dow === 6;
          return (
            <WeekDayCard
              key={key}
              date={date}
              meal={mealsByDate[key] ?? null}
              isWeekend={isWeekend}
              onAdd={() => onOpenModal(key, null)}
              onEdit={() => onOpenModal(key, mealsByDate[key])}
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

  const year = base.getFullYear();
  const month = base.getMonth();
  const days = useMemo(() => buildMonth(year, month), [year, month]);
  const startDow = (days[0].getDay() + 6) % 7;
  const todayKey = toDateKey(new Date());

  return (
    <>
      <div className="flex items-center justify-between mt-8 mb-5">
        <h2 className="text-xl font-bold text-stone-800">
          {MONTH_NAMES[month]} <span className="text-stone-400 font-medium">{year}</span>
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
          >
            <ChevronLeft size={15} className="text-stone-500" />
          </button>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 active:scale-95 transition-all"
          >
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
              onAdd={() => onOpenModal(key, null)}
              onEdit={() => onOpenModal(key, mealsByDate[key])}
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
  const [currentView, setCurrentView] = useState("weekly");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const [mealsByDate, setMealsByDate] = useState(() => buildSeedMeals());

  // modal: { open, dateKey|null, editMeal|null, isPlanOrder }
  const [modal, setModal] = useState({ open: false, dateKey: null, editMeal: null });

  // From day card "Add Meal" or "Edit" — dateKey known
  const openModal = useCallback((dateKey, editMeal = null) => {
    setModal({ open: true, dateKey, editMeal });
  }, []);

  // From header "Plan Order" — dateKey not yet chosen
  const openPlanOrder = useCallback(() => {
    setModal({ open: true, dateKey: null, editMeal: null });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, dateKey: null, editMeal: null });
  }, []);

  const handleSave = useCallback((dateKey, data) => {
    if (!dateKey) return;
    setMealsByDate((prev) => ({ ...prev, [dateKey]: data }));
    closeModal();
  }, [closeModal]);

  const handleDelete = useCallback((dateKey) => {
    setMealsByDate((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-white px-10 py-10 font-sans">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
        onSave={handleSave}
        prefillDateKey={modal.dateKey}
        prefillMeal={modal.editMeal}
      />
    </div>
  );
}