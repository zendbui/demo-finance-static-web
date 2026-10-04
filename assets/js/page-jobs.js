/* Trang Tuyển dụng: tổng hợp tin từ nhiều nguồn, lọc/sắp xếp, cảnh báo sắp hết hạn */

function jobDeadlineBadge(job) {
  const d = daysUntil(job.deadline);
  if (d === null) return null;
  if (d < 0) return el("span", { class: "badge badge-muted", text: "Đã hết hạn" });
  if (d <= 7) return el("span", { class: "badge badge-urgent", text: `Còn ${d} ngày` });
  return el("span", { class: "badge badge-info", text: `Hạn ${formatDateVN(job.deadline)}` });
}

function renderJobCard(job) {
  return el("article", { class: "list-card" }, [
    el("div", { class: "list-card-top" }, [el("h3", { text: job.title || "Vị trí tuyển dụng" }), jobDeadlineBadge(job)]),
    el("div", { class: "org", text: job.company || "" }),
    el("div", { class: "meta-row" }, [
      job.location ? el("span", { class: "icon-inline" }, [icon("pin"), job.location]) : null,
      job.postedDate ? el("span", { text: `Đăng: ${formatDateVN(job.postedDate)}` }) : null,
      job.source ? el("span", { text: `Nguồn: ${job.source}` }) : null,
    ]),
    job.tags && job.tags.length
      ? el(
          "div",
          { class: "tag-row" },
          job.tags.map((t) => el("span", { class: "tag-chip", text: t }))
        )
      : null,
    el("div", { class: "actions" }, [
      el("a", {
        class: "btn btn-outline",
        attrs: { href: safeHref(job.url || job.sourceUrl), target: "_blank", rel: "noopener noreferrer" },
      }, ["Xem chi tiết", icon("arrow")]),
    ]),
  ]);
}

async function initJobsPage() {
  const grid = document.getElementById("jobs-list");
  const emptyState = document.getElementById("jobs-empty");
  const searchInput = document.getElementById("jobs-search");
  const locationSelect = document.getElementById("jobs-location");
  const sortSelect = document.getElementById("jobs-sort");
  const showExpiredCheckbox = document.getElementById("jobs-show-expired");
  const resultsCount = document.getElementById("jobs-results-count");
  if (!grid) return;

  let jobs = [];
  try {
    jobs = await fetchJSON("data/jobs.json");
  } catch (err) {
    showFetchError(grid);
    return;
  }

  uniqueSorted(jobs.map((j) => j.location)).forEach((loc) => {
    locationSelect.appendChild(el("option", { attrs: { value: loc }, text: loc }));
  });

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const loc = locationSelect.value;
    const showExpired = showExpiredCheckbox.checked;

    let filtered = jobs.filter((j) => {
      const haystack = [j.title, j.company, (j.tags || []).join(" ")].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesLocation = !loc || j.location === loc;
      const expired = (daysUntil(j.deadline) ?? 0) < 0;
      return matchesQuery && matchesLocation && (showExpired || !expired);
    });

    filtered = filtered.slice().sort((a, b) => {
      if (sortSelect.value === "deadline") {
        return (parseDateSafe(a.deadline) || 0) - (parseDateSafe(b.deadline) || 0);
      }
      return (parseDateSafe(b.postedDate) || 0) - (parseDateSafe(a.postedDate) || 0);
    });

    grid.innerHTML = "";
    filtered.forEach((j, idx) => {
      const card = renderJobCard(j);
      card.style.setProperty("--i", idx);
      grid.appendChild(card);
    });
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `${filtered.length}/${jobs.length} tin`;
  }

  searchInput.addEventListener("input", debounce(render));
  locationSelect.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  showExpiredCheckbox.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", initJobsPage);
