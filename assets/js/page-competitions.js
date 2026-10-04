/* Trang Cuộc thi: trạng thái tự tính theo ngày hiện tại (sắp diễn ra / đang diễn ra / đã kết thúc) */

function getCompetitionStatus(comp) {
  const today = startOfToday();
  const start = parseDateSafe(comp.startDate);
  const end = parseDateSafe(comp.deadline);
  if (end && today > end) return { key: "ended", label: "Đã kết thúc", badgeClass: "badge-muted" };
  if (start && today < start) return { key: "upcoming", label: "Sắp diễn ra", badgeClass: "badge-info" };
  return { key: "ongoing", label: "Đang diễn ra", badgeClass: "badge-success" };
}

function renderCompetitionCard(comp) {
  const status = getCompetitionStatus(comp);
  const dateRange = [
    comp.startDate ? `Bắt đầu: ${formatDateVN(comp.startDate)}` : null,
    comp.deadline ? `Hạn: ${formatDateVN(comp.deadline)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return el("article", { class: "list-card" }, [
    el("div", { class: "list-card-top" }, [
      el("h3", { text: comp.name || "Cuộc thi" }),
      el("span", { class: `badge ${status.badgeClass}`, text: status.label }),
    ]),
    comp.organizer ? el("div", { class: "org", text: `Tổ chức: ${comp.organizer}` }) : null,
    comp.description ? el("p", { text: comp.description }) : null,
    dateRange ? el("div", { class: "meta-row" }, [el("span", { text: dateRange })]) : null,
    el("div", { class: "actions" }, [linkEl(comp.url, "Xem thông tin / Đăng ký →", { class: "btn btn-outline" })]),
  ]);
}

async function initCompetitionsPage() {
  const grid = document.getElementById("competitions-list");
  const emptyState = document.getElementById("competitions-empty");
  const searchInput = document.getElementById("competitions-search");
  const statusSelect = document.getElementById("competitions-status");
  const resultsCount = document.getElementById("competitions-results-count");
  if (!grid) return;

  let competitions = [];
  try {
    competitions = await fetchJSON("data/competitions.json");
  } catch (err) {
    showFetchError(grid);
    return;
  }

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const statusFilter = statusSelect.value;

    let filtered = competitions.filter((c) => {
      const haystack = [c.name, c.organizer, c.description].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesStatus = !statusFilter || getCompetitionStatus(c).key === statusFilter;
      return matchesQuery && matchesStatus;
    });

    filtered = filtered.slice().sort((a, b) => (parseDateSafe(a.deadline) || 0) - (parseDateSafe(b.deadline) || 0));

    grid.innerHTML = "";
    filtered.forEach((c) => grid.appendChild(renderCompetitionCard(c)));
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `${filtered.length}/${competitions.length} cuộc thi`;
  }

  searchInput.addEventListener("input", debounce(render));
  statusSelect.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", initCompetitionsPage);
