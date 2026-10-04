/* Trang Bài làm tốt: tổng hợp showcase từ tất cả môn học, lọc theo môn & khoá */

function flattenShowcases(courses) {
  const items = [];
  courses.forEach((course) => {
    (course.showcases || []).forEach((s) => {
      items.push({ ...s, courseName: course.name, courseCode: course.code });
    });
  });
  return items;
}

function renderShowcaseCard(item) {
  return el("article", { class: "list-card" }, [
    el("div", { class: "list-card-top" }, [
      el("h3", { text: item.title || "Bài làm" }),
      item.cohort ? el("span", { class: "badge badge-info", text: item.cohort }) : null,
    ]),
    el("div", { class: "org", text: item.courseName ? `${item.courseCode ? item.courseCode + " · " : ""}${item.courseName}` : "" }),
    el("div", { class: "meta-row" }, [el("span", { text: `Sinh viên: ${item.student || "—"}` })]),
    el("div", { class: "actions" }, [linkEl(item.url, "Xem bài làm →", { class: "btn btn-outline" })]),
  ]);
}

async function initShowcasePage() {
  const grid = document.getElementById("showcase-list");
  const emptyState = document.getElementById("showcase-empty");
  const searchInput = document.getElementById("showcase-search");
  const courseSelect = document.getElementById("showcase-course");
  const cohortSelect = document.getElementById("showcase-cohort");
  const resultsCount = document.getElementById("showcase-results-count");
  if (!grid) return;

  let items = [];
  try {
    const courses = await fetchJSON("data/courses.json");
    items = flattenShowcases(courses);
  } catch (err) {
    showFetchError(grid);
    return;
  }

  uniqueSorted(items.map((i) => i.courseName)).forEach((name) => {
    courseSelect.appendChild(el("option", { attrs: { value: name }, text: name }));
  });
  uniqueSorted(items.map((i) => i.cohort)).forEach((cohort) => {
    cohortSelect.appendChild(el("option", { attrs: { value: cohort }, text: cohort }));
  });

  function render() {
    const q = searchInput.value.trim().toLowerCase();
    const course = courseSelect.value;
    const cohort = cohortSelect.value;
    const filtered = items.filter((i) => {
      const haystack = [i.title, i.student, i.courseName].filter(Boolean).join(" ").toLowerCase();
      return (!q || haystack.includes(q)) && (!course || i.courseName === course) && (!cohort || i.cohort === cohort);
    });

    grid.innerHTML = "";
    filtered.forEach((i) => grid.appendChild(renderShowcaseCard(i)));
    emptyState.hidden = filtered.length !== 0;
    resultsCount.textContent = `${filtered.length}/${items.length} bài làm`;
  }

  searchInput.addEventListener("input", debounce(render));
  courseSelect.addEventListener("change", render);
  cohortSelect.addEventListener("change", render);
  render();
}

document.addEventListener("DOMContentLoaded", initShowcasePage);
