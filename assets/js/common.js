/* =========================================================
   Tiện ích dùng chung cho toàn bộ website
   ========================================================= */

/** Tạo một DOM element nhanh gọn, tránh nối chuỗi HTML không an toàn. */
function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.class) node.className = options.class;
  if (options.text !== undefined && options.text !== null) node.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== false) {
        node.setAttribute(key, value === true ? "" : value);
      }
    });
  }
  children.filter(Boolean).forEach((child) => {
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  return node;
}

/** Chỉ cho phép http(s), đường dẫn tương đối hoặc "#" — chặn javascript:/data: trong dữ liệu JSON. */
function safeHref(href) {
  const value = (href || "").trim();
  if (!value || value === "#") return "#";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "#"; // scheme lạ (javascript:, data:, ...)
  return value; // đường dẫn tương đối, ví dụ files/tai-lieu.pdf
}

/** Tạo thẻ <a> an toàn, tự thêm target/rel khi là link ngoài. */
function linkEl(href, text, options = {}) {
  const safe = safeHref(href);
  const isExternal = /^https?:\/\//i.test(safe);
  return el(
    "a",
    {
      class: options.class,
      attrs: {
        href: safe,
        target: isExternal ? "_blank" : undefined,
        rel: isExternal ? "noopener noreferrer" : undefined,
      },
    },
    [text]
  );
}

/* ---------- Bộ icon line-art (SVG dựng bằng DOM, không dùng innerHTML) ---------- */
const ICONS = {
  book: { paths: ["M4 5.5c2.2-1.4 5-1.4 7 .2v12.8c-2-1.6-4.8-1.6-7-.2V5.5Z", "M20 5.5c-2.2-1.4-5-1.4-7 .2v12.8c2-1.6 4.8-1.6 7-.2V5.5Z"] },
  star: { paths: ["M12 3.5l2.47 5.21 5.75.58-4.3 3.94 1.2 5.67L12 15.9l-5.12 3-1.2-5.67-4.3-3.94 5.75-.58L12 3.5Z"] },
  briefcase: { paths: ["M4 8.5h16v9a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.5v-9Z", "M9 8.5V6.8A1.8 1.8 0 0 1 10.8 5h2.4A1.8 1.8 0 0 1 15 6.8v1.7", "M4 13h16"] },
  trophy: { paths: ["M8 4.5h8v4a4 4 0 0 1-8 0v-4Z", "M8 5.3H5.3a2.8 2.8 0 0 0 2.8 3.7", "M16 5.3h2.7a2.8 2.8 0 0 1-2.8 3.7", "M12 12.5v3.6", "M9.3 19.5h5.4", "M10.2 16.1h3.6v3.4h-3.6v-3.4Z"] },
  pin: { paths: ["M12 20.5s6.5-6.8 6.5-11.3a6.5 6.5 0 1 0-13 0c0 4.5 6.5 11.3 6.5 11.3Z", "M12 11.3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"] },
  arrow: { paths: ["M4.5 12h14.5", "M13 6.5 19.5 12 13 17.5"] },
  search: { paths: ["M4 11a7 7 0 1 1 14 0 7 7 0 0 1-14 0Z", "M15.8 15.8 20.5 20.5"] },
  sun: { paths: ["M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z", "M12 2.5v2.2", "M12 19.3v2.2", "M4.2 4.2l1.6 1.6", "M18.2 18.2l1.6 1.6", "M2.5 12h2.2", "M19.3 12h2.2", "M4.2 19.8l1.6-1.6", "M18.2 5.8l1.6-1.6"] },
  moon: { paths: ["M20 14.8A8.5 8.5 0 1 1 9.2 4a7 7 0 0 0 10.8 10.8Z"] },
};

/** Dựng một icon SVG bằng DOM API (an toàn, không qua innerHTML). */
function icon(name, options = {}) {
  const def = ICONS[name];
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("class", options.class || "icon");
  if (def) {
    def.paths.forEach((d) => {
      // Phong cách quyết định cách tô (viền mảnh / khối đặc / song sắc...) qua CSS,
      // dựa trên việc nét vẽ này là hình kín (kết thúc bằng Z) hay chỉ là một nét mở.
      const closed = /z\s*$/i.test(d.trim());
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.setAttribute("class", "icon-path " + (closed ? "icon-path--closed" : "icon-path--open"));
      svg.appendChild(path);
    });
  }
  return svg;
}

/** Lấy dữ liệu JSON tĩnh trong thư mục /data. */
async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${path}`);
  return res.json();
}

/** Hiển thị khung lỗi thân thiện khi không tải được dữ liệu. */
function showFetchError(container) {
  container.innerHTML = "";
  container.appendChild(
    el("div", { class: "error-box" }, [
      el("strong", { text: "Không tải được dữ liệu." }),
      el("p", {
        text:
          "Nếu bạn đang mở trực tiếp file HTML (đường dẫn bắt đầu bằng file://), trình duyệt sẽ chặn việc đọc file JSON. " +
          "Hãy chạy thử bằng local server (ví dụ: `python3 -m http.server`) hoặc truy cập qua địa chỉ GitHub Pages đã publish.",
      }),
    ])
  );
}

function debounce(fn, wait = 220) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function parseDateSafe(str) {
  if (!str) return null;
  const d = new Date(`${str}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateVN(str) {
  const d = parseDateSafe(str);
  if (!d) return str || "";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Số ngày từ hôm nay đến mốc thời gian (âm nghĩa là đã qua). */
function daysUntil(str) {
  const target = parseDateSafe(str);
  if (!target) return null;
  return Math.round((target - startOfToday()) / 86400000);
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "vi"));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- Giao diện sáng / tối ---------- */
function syncThemeToggleIcon(btn) {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  btn.innerHTML = "";
  btn.appendChild(icon(current === "dark" ? "sun" : "moon"));
  btn.setAttribute("aria-label", current === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối");
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  syncThemeToggleIcon(btn);
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("btc-theme", next);
    } catch (err) {
      /* localStorage có thể bị chặn (chế độ ẩn danh) — bỏ qua, theme vẫn áp dụng cho phiên hiện tại */
    }
    syncThemeToggleIcon(btn);
  });
}

/* ---------- Ngày hiện tại trên thanh meta ---------- */
function initMetaDate() {
  const dateEl = document.getElementById("today-date");
  if (!dateEl) return;
  const formatted = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  dateEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/* ---------- Bộ chuyển phong cách thiết kế (xem trước 9 phong cách) ---------- */
const STYLE_OPTIONS = [
  { key: "brutalism", label: "Brutalism & Neo-Brutalism" },
  { key: "minimal", label: "Minimalism" },
  { key: "flat", label: "Flat Design" },
  { key: "swiss", label: "Swiss Style" },
  { key: "editorial", label: "Editorial Style" },
  { key: "bento", label: "Bento Box" },
  { key: "glass", label: "Glassmorphism" },
  { key: "clay", label: "Claymorphism" },
  { key: "aurora", label: "Aurora & Mesh Gradient" },
];

function applyStyle(key) {
  document.documentElement.setAttribute("data-style", key);
  try {
    localStorage.setItem("btc-style", key);
  } catch (err) {
    /* localStorage có thể bị chặn — bỏ qua, phong cách vẫn áp dụng cho phiên hiện tại */
  }
}

function initStyleSwitcher() {
  if (document.querySelector(".style-switcher")) return;
  const current = document.documentElement.getAttribute("data-style") || "brutalism";

  const panel = el("div", { class: "style-switcher-panel", attrs: { id: "style-switcher-panel", role: "menu" } });
  panel.hidden = true;

  const list = el("div", { class: "style-switcher-list" });
  STYLE_OPTIONS.forEach((opt) => {
    const btn = el("button", {
      class: "style-switcher-option" + (opt.key === current ? " is-active" : ""),
      text: opt.label,
      attrs: {
        type: "button",
        "data-style-key": opt.key,
        role: "menuitemradio",
        "aria-checked": opt.key === current ? "true" : "false",
      },
    });
    btn.addEventListener("click", () => {
      applyStyle(opt.key);
      list.querySelectorAll(".style-switcher-option").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-checked", active ? "true" : "false");
      });
    });
    list.appendChild(btn);
  });

  panel.appendChild(el("p", { class: "style-switcher-title", text: "Chọn phong cách để xem trước" }));
  panel.appendChild(list);

  const toggle = el("button", {
    class: "style-switcher-toggle",
    text: "Phong cách",
    attrs: { type: "button", "aria-expanded": "false", "aria-controls": "style-switcher-panel" },
  });
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = panel.hidden;
    panel.hidden = !isOpen;
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !panel.contains(event.target) && event.target !== toggle) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const wrap = el("div", { class: "style-switcher" }, [toggle, panel]);
  document.body.appendChild(wrap);
}

/* ---------- Hiệu ứng xuất hiện khi cuộn tới ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((item) => observer.observe(item));
}

/* ---------- Khởi tạo chung cho mọi trang ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === currentFile || (currentFile === "" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initThemeToggle();
  initMetaDate();
  initScrollReveal();
  initStyleSwitcher();
});
