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

/** Lấy dữ liệu JSON tĩnh trong thư mục /data. */
async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${path}`);
  return res.json();
}

/** Hiển thị khung lỗi thân thiện khi không tải được dữ liệu. */
function showFetchError(container, extra = "") {
  container.innerHTML = "";
  container.appendChild(
    el("div", { class: "error-box" }, [
      el("strong", { text: "Không tải được dữ liệu." }),
      el("p", {
        text:
          "Nếu bạn đang mở trực tiếp file HTML (đường dẫn bắt đầu bằng file://), trình duyệt sẽ chặn việc đọc file JSON. " +
          "Hãy chạy thử bằng local server (ví dụ: `python3 -m http.server`) hoặc truy cập qua địa chỉ GitHub Pages đã publish. " +
          extra,
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
});
