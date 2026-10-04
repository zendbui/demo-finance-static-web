/* Trang Môn học: liệt kê môn, tìm kiếm, lọc theo học kỳ, xem tài liệu/link/bài làm tốt */

function renderCourseCard(course) {
  const details = el("details", {});
  const summary = el("summary", {}, [
    el("div", { class: "course-summary-main" }, [
      el("span", { class: "course-code", text: course.code || "" }),
      el("h3", { text: course.name || "(Chưa đặt tên môn học)" }),
      el("div", {
        class: "course-meta",
        text: [course.semester, course.credits ? `${course.credits} tín chỉ` : null].filter(Boolean).join(" · "),
      }),
    ]),
  ]);

  const body = el("div", { class: "course-body" }, [
    course.description ? el("p", { class: "course-desc", text: course.description }) : null,
    buildSection("Tài liệu tham khảo", course.references, (item) =>
      el("li", {}, [linkEl(item.link, item.title)])
    ),
    buildSection("Link tham khảo", course.links, (item) =>
      el("li", {}, [linkEl(item.url, item.title)])
    ),
    buildSection("Bài làm tốt tiêu biểu", course.showcases, (item) =>
      el("li", {}, [
        linkEl(item.url, item.title),
        el("span", { text: ` — ${item.student || "Sinh viên"} (${item.cohort || ""})` }),
      ])
    ),
  ]);

  details.appendChild(summary);
  details.appendChild(body);
  return el("article", { class: "course-card" }, [details]);
}

function buildSection(title, items, renderItem) {
  const section = el("div", { class: "course-section" }, [el("h4", { text: title })]);
  if (!items || items.length === 0) {
    section.appendChild(el("p", { class: "muted-note", text: "Chưa có dữ liệu, sẽ cập nhật sau." }));
    return section;
  }
  const ul = el("ul", {}, items.map(renderItem));
  section.appendChild(ul);
  return section;
}

async function initCoursesPage() {
  const grid = document.getElementById("course-list");
  const emptyState = document.getElementById("course-empty");
  const searchInput = document.getElementById("course-search");
  const semesterSelect = document.getElementById("course-semester");
  const resultsCount = document.getElementById("course-results-count");
  if (!grid) return;

  let courses = [];
  try {
    courses = await fetchJSON("data/courses.json");
  } catch (err) {
    showFetchError(grid);
    return;
  }

  uniqueSorted(courses.map((c) => c.semester)).forEach((sem) => {
    semesterSelect.appendChild(el("option", { attrs: { value: sem }, text: sem }));
  });

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const sem = semesterSelect.value;
    const filtered = courses.filter((c) => {
      const haystack = [c.name, c.code, c.description].filter(Boolean).join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesSemester = !sem || c.semester === sem;
      return matchesQuery && matchesSemester;
    });

    grid.innerHTML = "";
    filtered.forEach((c, idx) => {
      const card = renderCourseCard(c);
      card.style.setProperty("--i", idx);
      grid.appendChild(card);
    });
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `${filtered.length}/${courses.length} môn học`;
  }

  searchInput.addEventListener("input", debounce(render));
  semesterSelect.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", initCoursesPage);
