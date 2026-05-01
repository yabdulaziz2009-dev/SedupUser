import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Star, Plus, Minus, X, Check,
  Link2, Upload, ImageOff, ChevronRight,
  Flame, Zap, Wheat, Droplets, Send, Loader2,
  Heart, Share2, Info
} from "lucide-react";

// ─── PRODUCT DATA (o'zgaruvchi — map tayyor bo'lganda shu yerdan olasiz) ───
const ELEMENT = {
  id: "classic-cheeseburger",
  name: "Classic Cheeseburger",
  tagline: "Signature grass-fed beef patty",
  description:
    "Our perfectly seasoned 100% grass-fed beef patty, topped with melty aged cheddar, crisp local lettuce, ripe organic tomatoes, house-made pickles, and our secret FreshDash sauce on a toasted artisanal brioche bun.",
  basePrice: 12.99,
  rating: 4.8,
  reviewCount: 240,
  image:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  nutrition: [
    { label: "Cal", value: "650", icon: Flame },
    { label: "Protein", value: "32g", icon: Zap },
    { label: "Carbs", value: "45g", icon: Wheat },
    { label: "Fat", value: "38g", icon: Droplets },
  ],
  modifications: [
    { key: "brioche", label: "Brioche Bun", extra: 0, priceLabel: "Included" },
    { key: "gluten", label: "Gluten-Free Bun", extra: 1.5, priceLabel: "+$1.50" },
    { key: "lettuce", label: "Lettuce Wrap", extra: 0, priceLabel: "Free" },
  ],
  addons: [
    { key: "patty", label: "Extra Patty", price: 2.5 },
    { key: "avocado", label: "Avocado", price: 1.0 },
    { key: "cheese", label: "Extra Cheese", price: 0.75 },
    { key: "bacon", label: "Crispy Bacon", price: 1.25 },
  ],
};

const REVIEWS_API = "https://sedab-backend.onrender.com/api/reviews";

// ─── HELPERS ───────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "{}"); }
  catch { return {}; }
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(name = "?") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
function avatarColor(name = "") {
  const hues = [14, 160, 220, 280, 45];
  return `hsl(${hues[name.charCodeAt(0) % hues.length]},60%,72%)`;
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────
function StarRow({ rating, size = 14 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(rating) ? "#f59e0b" : "transparent"}
          color={i <= Math.round(rating) ? "#f59e0b" : "#d1cfc8"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function Toast({ msg, show }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: `translateX(-50%) translateY(${show ? 0 : 60}px)`,
        opacity: show ? 1 : 0,
        transition: "all 0.35s cubic-bezier(.34,1.56,.64,1)",
        background: "#1a1208",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 40,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: 0.2,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        zIndex: 9999,
        whiteSpace: "nowrap",
      }}
    >
      <ShoppingCart size={16} />
      {msg}
    </div>
  );
}

function ReviewCard({ review }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImg = review.img_url && !imgErr;
  return (
    <div
      style={{
        padding: "20px 0",
        borderBottom: "1px solid #f0ebe0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {review.img_url && !imgErr ? (
          <img
            src={review.img_url}
            alt=""
            onError={() => setImgErr(true)}
            style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: avatarColor(review.name),
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {initials(review.name)}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1208" }}>{review.name || "Anonymous"}</span>
            <span style={{ fontSize: 12, color: "#b5a98a" }}>{fmtDate(review.created_at || review.date || review.createdAt)}</span>
          </div>
          <StarRow rating={review.rating || review.stars || 5} size={13} />
        </div>
      </div>
      <p style={{ fontSize: 14, color: "#4a4030", lineHeight: 1.65, margin: 0 }}>
        {review.comment || review.text || review.body || ""}
      </p>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function CheeseburgerPage() {
  const [qty, setQty] = useState(() => {
    const c = getCart();
    return c[ELEMENT.id]?.qty || 1;
  });
  const [mod, setMod] = useState(ELEMENT.modifications[0]);
  const [addons, setAddons] = useState({});
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [imgHovered, setImgHovered] = useState(false);

  // reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);

  // form
  const [rName, setRName] = useState("");
  const [rRating, setRRating] = useState(0);
  const [rHoverRating, setRHoverRating] = useState(0);
  const [rComment, setRComment] = useState("");
  const [imgMode, setImgMode] = useState("none");
  const [imgUrl, setImgUrl] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });
  const fileRef = useRef();

  const total = (ELEMENT.basePrice + mod.extra + Object.values(addons).reduce((a, b) => a + b, 0)) * qty;

  useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    setReviewsLoading(true);
    setReviewsError(false);
    try {
      const res = await fetch(REVIEWS_API);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.reviews || data.data || []);
      setReviews(arr);
    } catch {
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  }

  function showToast(msg) {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }

  function handleQty(delta) {
    const next = qty + delta;
    if (next < 0) return;
    setQty(next);
    const cart = getCart();
    if (next === 0) { delete cart[ELEMENT.id]; }
    else {
      cart[ELEMENT.id] = { name: ELEMENT.name, price: total / qty, qty: next };
    }
    saveCart(cart);
  }

  function handleAddToCart() {
    const q = qty < 1 ? 1 : qty;
    setQty(q);
    const cart = getCart();
    cart[ELEMENT.id] = { name: ELEMENT.name, price: total / qty, qty: q };
    saveCart(cart);
    showToast(`${q}× ${ELEMENT.name} added!`);
  }

  function toggleAddon(key, price) {
    setAddons((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key]; else n[key] = price;
      return n;
    });
  }

  function handleImgMode(mode) {
    setImgMode(mode);
    setImgUrl("");
    setImgFile(null);
    setImgPreview(null);
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!rName.trim()) return setFormMsg({ type: "error", text: "Please enter your name." });
    if (!rRating) return setFormMsg({ type: "error", text: "Please select a rating." });
    if (!rComment.trim()) return setFormMsg({ type: "error", text: "Please write a comment." });

    let img_url = null;
    if (imgMode === "url" && imgUrl.trim()) img_url = imgUrl.trim();
    else if (imgMode === "file" && imgPreview) img_url = imgPreview;

    setSubmitting(true);
    setFormMsg({ type: "", text: "" });
    try {
      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rName.trim(), rating: rRating, comment: rComment.trim(), img_url }),
      });
      if (!res.ok) throw new Error();
      setFormMsg({ type: "success", text: "Review posted! Thank you." });
      setRName(""); setRRating(0); setRComment(""); handleImgMode("none");
      setTimeout(loadReviews, 800);
    } catch {
      setFormMsg({ type: "error", text: "Could not post. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div style={{ background: "#1a1208", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 60% 50%, #3d2a0a 0%, #1a1208 70%)",
          }}
        />
        <div
          style={{
            maxWidth: 1100, margin: "0 auto", padding: "40px 24px 0",
            display: "grid", gridTemplateColumns: "1fr 480px", gap: 48,
            alignItems: "flex-end", position: "relative",
          }}
        >
          {/* Left info */}
          <div style={{ paddingBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{
                background: "#e85a2b", color: "#fff", borderRadius: 30,
                padding: "4px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.8,
              }}>
                BESTSELLER
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.08)", borderRadius: 30, padding: "4px 12px" }}>
                <StarRow rating={ELEMENT.rating} size={13} />
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{ELEMENT.rating}</span>
                <span style={{ color: "#a09070", fontSize: 12 }}>({ELEMENT.reviewCount}+)</span>
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 800,
              color: "#fff", lineHeight: 1.1, margin: "0 0 8px",
            }}>
              {ELEMENT.name.split(" ").map((w, i) => (
                <span key={i} style={{ display: "block" }}>{w}</span>
              ))}
            </h1>
            <p style={{ color: "#b5a98a", fontSize: 16, margin: "0 0 28px", lineHeight: 1.6 }}>
              {ELEMENT.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: "#e85a2b", letterSpacing: -1 }}>
                ${ELEMENT.basePrice.toFixed(2)}
              </span>
              <button
                onClick={() => setLiked(l => !l)}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.15)",
                  background: liked ? "#e85a2b" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <Heart size={18} fill={liked ? "#fff" : "none"} color={liked ? "#fff" : "#a09070"} />
              </button>
              <button style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.15)",
                background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}>
                <Share2 size={18} color="#a09070" />
              </button>
            </div>
          </div>

          {/* Right: floating image */}
          <div
            style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 0 }}
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            <div style={{
              width: 420, height: 420,
              position: "relative",
              transform: imgHovered ? "translateY(-12px) scale(1.03)" : "translateY(0) scale(1)",
              transition: "transform 0.5s cubic-bezier(.34,1.56,.64,1)",
            }}>
              <div style={{
                position: "absolute", bottom: -20, left: "10%", right: "10%", height: 40,
                background: "rgba(232,90,43,0.35)", borderRadius: "50%",
                filter: "blur(20px)",
                transform: imgHovered ? "scaleX(1.1)" : "scaleX(1)",
                transition: "transform 0.5s ease",
              }} />
              <img
                src={ELEMENT.image}
                alt={ELEMENT.name}
                style={{
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  borderRadius: "50% 50% 40% 40% / 40% 40% 30% 30%",
                  border: "4px solid rgba(255,255,255,0.06)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "flex-start" }}>

        {/* LEFT col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Nutrition */}
          <Card>
            <SectionLabel>Nutrition facts</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 12 }}>
              {ELEMENT.nutrition.map(({ label, value, icon: Icon }) => (
                <div key={label} style={{
                  background: "#faf7f0", borderRadius: 14, padding: "14px 10px",
                  textAlign: "center", border: "1px solid #ede8da",
                }}>
                  <Icon size={16} color="#e85a2b" style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1a1208", lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: "#a09070", marginTop: 3, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Modifications */}
          <Card>
            <SectionLabel>Bun style</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {ELEMENT.modifications.map((m) => (
                <ModRow
                  key={m.key}
                  item={m}
                  selected={mod.key === m.key}
                  onClick={() => setMod(m)}
                  type="radio"
                />
              ))}
            </div>
          </Card>

          {/* Add-ons */}
          <Card>
            <SectionLabel>Add-ons</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {ELEMENT.addons.map((a) => (
                <ModRow
                  key={a.key}
                  item={{ key: a.key, label: a.label, priceLabel: `+$${a.price.toFixed(2)}` }}
                  selected={!!addons[a.key]}
                  onClick={() => toggleAddon(a.key, a.price)}
                  type="check"
                />
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT col: Cart sticky + Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Cart card */}
          <div style={{ position: "sticky", top: 20 }}>
            <Card accent>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#a09070", fontWeight: 500 }}>Total price</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={13} color="#ccc" />
                  <span style={{ fontSize: 11, color: "#b5a98a" }}>incl. add-ons</span>
                </div>
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: "#e85a2b", letterSpacing: -1, marginBottom: 20 }}>
                ${total.toFixed(2)}
              </div>

              {/* Qty */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#faf7f0", borderRadius: 14, padding: "6px 6px", marginBottom: 14, border: "1px solid #ede8da" }}>
                <QtyBtn onClick={() => handleQty(-1)} icon={<Minus size={16} />} />
                <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1208", minWidth: 32, textAlign: "center" }}>{qty}</span>
                <QtyBtn onClick={() => handleQty(1)} icon={<Plus size={16} />} />
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  width: "100%", padding: "15px 0",
                  background: "linear-gradient(135deg, #e85a2b, #c94518)",
                  color: "#fff", border: "none", borderRadius: 14,
                  fontSize: 16, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: "0 6px 24px rgba(232,90,43,0.32)",
                  transition: "transform 0.15s, box-shadow 0.15s",
                  letterSpacing: 0.3,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(232,90,43,0.42)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 24px rgba(232,90,43,0.32)"; }}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
                onMouseUp={e => e.currentTarget.style.transform = "translateY(-2px)"}
              >
                <ShoppingCart size={18} />
                Add to Cart · ${total.toFixed(2)}
              </button>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Bun", value: mod.label },
                  ...Object.keys(addons).map(k => ({ label: ELEMENT.addons.find(a => a.key === k)?.label, value: `+$${addons[k].toFixed(2)}` })),
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#a09070" }}>
                    <span>{label}</span><span style={{ fontWeight: 600, color: "#6b5c40" }}>{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── REVIEWS ──────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderTop: "1px solid #ede8da", padding: "48px 24px 60px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 800, color: "#1a1208" }}>
              Reviews
            </h2>
            {reviews.length > 0 && (
              <span style={{ background: "#faf7f0", border: "1px solid #ede8da", borderRadius: 30, padding: "4px 14px", fontSize: 13, color: "#6b5c40", fontWeight: 600 }}>
                {reviews.length} total
              </span>
            )}
          </div>

          {reviewsLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#a09070", fontSize: 14, padding: "20px 0" }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Loading reviews...
            </div>
          ) : reviewsError ? (
            <div style={{ color: "#e85a2b", fontSize: 14, padding: "20px 0" }}>Could not load reviews. <button onClick={loadReviews} style={{ color: "#e85a2b", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>Retry</button></div>
          ) : reviews.length === 0 ? (
            <p style={{ color: "#a09070", fontSize: 14, padding: "20px 0" }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r, i) => <ReviewCard key={r.id || i} review={r} />)
          )}

          {/* Write review */}
          <div style={{ marginTop: 48, paddingTop: 40, borderTop: "1px solid #ede8da" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a1208", marginBottom: 24 }}>
              Write a Review
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <FormField label="Your name">
                <input
                  value={rName} onChange={e => setRName(e.target.value)}
                  placeholder="Ali Karimov"
                  style={inputStyle}
                />
              </FormField>
              <FormField label="Rating">
                <div style={{ display: "flex", gap: 4, paddingTop: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <button
                      key={i}
                      onClick={() => setRRating(i)}
                      onMouseEnter={() => setRHoverRating(i)}
                      onMouseLeave={() => setRHoverRating(0)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.1s" }}
                      onMouseDown={e => e.currentTarget.style.transform = "scale(0.85)"}
                      onMouseUp={e => e.currentTarget.style.transform = "scale(1.1)"}
                    >
                      <Star
                        size={28}
                        fill={i <= (rHoverRating || rRating) ? "#f59e0b" : "transparent"}
                        color={i <= (rHoverRating || rRating) ? "#f59e0b" : "#d1cfc8"}
                        strokeWidth={1.5}
                      />
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {/* Image upload */}
            <FormField label="Photo (optional)" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {[
                  { key: "none", icon: <ImageOff size={15} />, label: "None" },
                  { key: "url", icon: <Link2 size={15} />, label: "URL" },
                  { key: "file", icon: <Upload size={15} />, label: "File" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => handleImgMode(opt.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 10,
                      border: `1.5px solid ${imgMode === opt.key ? "#e85a2b" : "#e0dbd0"}`,
                      background: imgMode === opt.key ? "#fff5f1" : "#faf7f0",
                      color: imgMode === opt.key ? "#e85a2b" : "#6b5c40",
                      fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
              {imgMode === "url" && (
                <div style={{ marginTop: 10 }}>
                  <input
                    value={imgUrl} onChange={e => setImgUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    style={{ ...inputStyle, width: "100%" }}
                  />
                  {imgUrl && (
                    <img src={imgUrl} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, marginTop: 8, border: "1px solid #ede8da" }} onError={() => {}} />
                  )}
                </div>
              )}
              {imgMode === "file" && (
                <div style={{ marginTop: 10 }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ ...inputStyle, cursor: "pointer", background: "#faf7f0", textAlign: "left", color: "#6b5c40" }}
                  >
                    {imgFile ? imgFile.name : "Choose image…"}
                  </button>
                  {imgPreview && (
                    <img src={imgPreview} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, marginTop: 8, border: "1px solid #ede8da" }} />
                  )}
                </div>
              )}
            </FormField>

            <FormField label="Comment" style={{ marginBottom: 20 }}>
              <textarea
                value={rComment} onChange={e => setRComment(e.target.value)}
                placeholder="Share your experience with this burger…"
                rows={4}
                style={{ ...inputStyle, width: "100%", resize: "vertical", minHeight: 100, lineHeight: 1.6 }}
              />
            </FormField>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "13px 28px", background: submitting ? "#ccc" : "#1a1208",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#2d2010"; }}
              onMouseLeave={e => { e.currentTarget.style.background = submitting ? "#ccc" : "#1a1208"; }}
            >
              {submitting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
              {submitting ? "Posting…" : "Post Review"}
            </button>

            {formMsg.text && (
              <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500, color: formMsg.type === "error" ? "#e85a2b" : "#22a06b" }}>
                {formMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast msg={toast.msg} show={toast.show} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #c0b8a8; }
        input:focus, textarea:focus { outline: none; border-color: #e85a2b !important; box-shadow: 0 0 0 3px rgba(232,90,43,0.12); }
      `}</style>
    </div>
  );
}

// ─── TINY HELPERS ──────────────────────────────────────────────────────────
function Card({ children, accent }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 20,
      padding: "22px 24px",
      border: accent ? "1.5px solid #f0c4b0" : "1px solid #ede8da",
      boxShadow: accent ? "0 4px 24px rgba(232,90,43,0.08)" : "0 2px 12px rgba(26,18,8,0.04)",
    }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#a09070", letterSpacing: 1.2, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function ModRow({ item, selected, onClick, type }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "13px 16px", borderRadius: 12, cursor: "pointer",
        border: `1.5px solid ${selected ? "#e85a2b" : hov ? "#d0c8b8" : "#ede8da"}`,
        background: selected ? "#fff5f1" : hov ? "#fdfaf6" : "#fff",
        transition: "all 0.18s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 20, height: 20, borderRadius: type === "radio" ? "50%" : 6,
          border: `2px solid ${selected ? "#e85a2b" : "#ccc"}`,
          background: selected ? "#e85a2b" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", flexShrink: 0,
        }}>
          {selected && <Check size={11} color="#fff" strokeWidth={3} />}
        </div>
        <span style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? "#1a1208" : "#4a4030" }}>
          {item.label}
        </span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: item.priceLabel === "Free" ? "#22a06b" : selected ? "#e85a2b" : "#a09070" }}>
        {item.priceLabel}
      </span>
    </div>
  );
}

function QtyBtn({ onClick, icon }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 40, height: 40, borderRadius: 10, border: "none",
        background: hov ? "#e85a2b" : "#fff",
        color: hov ? "#fff" : "#1a1208",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.18s", flexShrink: 0,
        boxShadow: hov ? "0 2px 8px rgba(232,90,43,0.28)" : "none",
      }}
    >
      {icon}
    </button>
  );
}

function FormField({ label, children, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#a09070", letterSpacing: 0.8, textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "10px 14px",
  border: "1.5px solid #e0dbd0",
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  color: "#1a1208",
  background: "#fff",
  transition: "border-color 0.2s, box-shadow 0.2s",
  width: "100%",
};