/**
 * api.js — centralized Axios instance + typed API calls
 *
 * Base URL is read from Vite env: VITE_API_URL
 * Fallback: https://sedab-backend.onrender.com/api
 *
 * Usage:
 *   import { foodApi, categoryApi, orderApi } from "@/services/api";
 */

import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_URL ?? "https://sedab-backend.onrender.com/api";

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token on every request if present in localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize server errors into a single { message } shape
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ??
      err.response?.data?.detail ??
      err.message ??
      "Unknown error";
    return Promise.reject(new Error(message));
  }
);

export default http;

// ─────────────────────────────────────────────────────────────────────────────
// FOOD  /api/food
// ─────────────────────────────────────────────────────────────────────────────

export const foodApi = {
  /** GET /api/food — returns array of food items */
  getAll: () => http.get("/food").then((r) => r.data),

  /** GET /api/food/:id */
  getById: (id) => http.get(`/food/${id}`).then((r) => r.data),

  /**
   * POST /api/food
   * Backend expects multipart/form-data when image is a File,
   * or JSON when image is already a URL string.
   *
   * Payload shape (from Swagger):
   *   name, description, price, category_id, image (file or url)
   */
  create: (payload) => {
    const isFile = payload.image instanceof File;

    if (isFile) {
      const fd = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      return http
        .post("/food", fd, { headers: { "Content-Type": "multipart/form-data" } })
        .then((r) => r.data);
    }

    return http.post("/food", payload).then((r) => r.data);
  },

  /** PUT /api/food/:id */
  update: (id, payload) => http.put(`/food/${id}`, payload).then((r) => r.data),

  /** DELETE /api/food/:id */
  remove: (id) => http.delete(`/food/${id}`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES  /api/categories
// ─────────────────────────────────────────────────────────────────────────────

export const categoryApi = {
  /** GET /api/categories */
  getAll: () => http.get("/categories").then((r) => r.data),

  /** POST /api/categories */
  create: (payload) => http.post("/categories", payload).then((r) => r.data),

  /** PUT /api/categories/:id */
  update: (id, payload) =>
    http.put(`/categories/${id}`, payload).then((r) => r.data),

  /** DELETE /api/categories/:id */
  remove: (id) => http.delete(`/categories/${id}`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS  /api/orders  (Buyurtmalar)
// ─────────────────────────────────────────────────────────────────────────────

export const orderApi = {
  /** GET /api/orders */
  getAll: () => http.get("/orders").then((r) => r.data),

  /**
   * POST /api/orders
   *
   * Expected payload shape (adjust field names to match your Swagger schema):
   * {
   *   food_id      : number | string,
   *   scheduled_at : "YYYY-MM-DD HH:mm"  (ISO-ish datetime string)
   *   quantity     : number              (default 1)
   * }
   */
  create: (payload) => http.post("/orders", payload).then((r) => r.data),

  /** GET /api/orders/:id */
  getById: (id) => http.get(`/orders/${id}`).then((r) => r.data),

  /** PUT /api/orders/:id */
  update: (id, payload) => http.put(`/orders/${id}`, payload).then((r) => r.data),

  /** DELETE /api/orders/:id */
  remove: (id) => http.delete(`/orders/${id}`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// CHEF  /api/chef  (if needed by your UI)
// ─────────────────────────────────────────────────────────────────────────────

export const chefApi = {
  getById: (id) => http.get(`/chef/${id}`).then((r) => r.data),
  update:  (id, payload) => http.put(`/chef/${id}`, payload).then((r) => r.data),
  remove:  (id) => http.delete(`/chef/${id}`).then((r) => r.data),
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a "YYYY-MM-DD HH:mm" string from a date key + "12:30 PM" time string.
 * This is what the backend /api/orders expects in `scheduled_at`.
 */
export const buildScheduledAt = (dateKey, displayTime) => {
  // dateKey = "2026-05-03"
  // displayTime = "12:30 PM"
  if (!dateKey || !displayTime) return null;

  const match = displayTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return null;

  let hr = parseInt(match[1], 10);
  const min = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hr < 12) hr += 12;
  if (period === "AM" && hr === 12) hr = 0;

  // ISO 8601 format — backend expects "2026-05-08T12:00:00"
  return `${dateKey}T${String(hr).padStart(2, "0")}:${min}:00`;
};

/**
 * Parse a backend food object into the shape our UI expects.
 * Adjust field names (name vs title, image_url vs image, etc.)
 * to match the actual Swagger response schema.
 */
export const normalizeFoodItem = (item) => ({
  // Backend may send id as: id | _id | food_id
  id:         item.id ?? item._id ?? item.food_id,
  title:      item.name ?? item.title ?? "Untitled",
  restaurant: item.restaurant ?? item.chef_name ?? item.source ?? "",
  category:   item.category?.name ?? item.category ?? "Other",
  price:      item.price != null ? `$${Number(item.price).toFixed(2)}` : "",
  image:      item.image_url ?? item.image ?? "",
});

/**
 * Parse a backend order into the flat shape our calendar expects.
 * { dateKey: "YYYY-MM-DD", meal: { ...foodItem, time: "12:30 PM" } }
 */
export const normalizeOrder = (order) => {
  // scheduled_at can be "2026-05-03T12:00:00" or "2026-05-03 12:00"
  const raw = order.scheduled_at ?? order.date ?? "";
  const normalized = raw.replace("T", " ");          // always "YYYY-MM-DD HH:mm..."
  const [datePart, timePart] = normalized.split(" ");

  let displayTime = "";
  if (timePart) {
    const [h, m] = timePart.split(":");
    const hr = parseInt(h, 10);
    const period = hr >= 12 ? "PM" : "AM";
    const hr12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
    displayTime = `${hr12}:${m} ${period}`;
  }

  const food = order.food ?? order.meal ?? {};

  return {
    dateKey: datePart,
    orderId: order.id,
    meal: {
      ...normalizeFoodItem(food),
      time: displayTime,
      orderId: order.id,
    },
  };
};