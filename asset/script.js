// fading start
const observerOptions = {
  threshold: 0.08, // 10% of the element must be visible before it fades in
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      // Optional: observer.unobserve(entry.target); // Check this if you only want it to fade in ONCE
    } else {
      entry.target.classList.remove("active"); // Remove this if you don't want it to fade back out
    }
  });
}, observerOptions);

// Target all elements with the .reveal class
document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// fading end

function initPageNavigation() {
  const navItems = document.querySelectorAll(".nav-item[data-page]");
  const pages = document.querySelectorAll(".page");

  function showPage(target) {
    pages.forEach((p) =>
      p.classList.toggle("active", p.id === "page-" + target),
    );
    navItems.forEach((n) =>
      n.classList.toggle("active", n.dataset.page === target),
    );
    document.querySelector(".main").scrollTo({ top: 0, behavior: "instant" });
  }

  document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showPage(el.dataset.page);
    });
  });

  // Exposed so other sections (like search results) can jump to a page too
  window.goToPage = showPage;
}

/* NOTIFICATIONS & MESSAGES POP-OVERS */
function initPopover(buttonId, popoverId) {
  const button = document.getElementById(buttonId);
  const popover = document.getElementById(popoverId);
  if (!button || !popover) return;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    const willShow = !popover.classList.contains("show");
    closeAllPopovers();
    if (willShow) {
      popover.classList.add("show");
      getPopoverBackdrop().classList.add("show");
    }
  });

  // Clicking inside the pop-over itself should not close it
  popover.addEventListener("click", (e) => e.stopPropagation());
}

// One shared, semi-transparent backdrop element used by every pop-over.
// It is created once and re-used so we don't litter the page with copies.
function getPopoverBackdrop() {
  let backdrop = document.getElementById("popoverBackdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "popoverBackdrop";
    backdrop.className = "popover-backdrop";
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", closeAllPopovers);
  }
  return backdrop;
}

function closeAllPopovers() {
  document
    .querySelectorAll(".popover.show")
    .forEach((p) => p.classList.remove("show"));
  const backdrop = document.getElementById("popoverBackdrop");
  if (backdrop) backdrop.classList.remove("show");
}

function initAllPopovers() {
  initPopover("notifBtn", "notifPopover");
  initPopover("msgBtn", "msgPopover");
  initPopover("filterBtn", "filterPopover");
  initPopover("termBtn", "termPopover");
  initPopover("gpaBtn", "gpaPopover");

  // Clicking anywhere else on the page closes whatever pop-over is open
  document.addEventListener("click", closeAllPopovers);
}

/* CALENDAR POP-UP (January - December, any year) */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Which month/year the calendar is currently showing.
// Starts on today's real month/year.
const calendarState = {
  month: new Date().getMonth(), // 0 = January ... 11 = December
  year: new Date().getFullYear(),
};

function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  const label = document.getElementById("calendarMonthLabel");
  grid.innerHTML = "";

  label.textContent = `${MONTH_NAMES[calendarState.month]} ${calendarState.year}`;

  const firstDayOfMonth = new Date(
    calendarState.year,
    calendarState.month,
    1,
  ).getDay(); // 0=Sun
  const daysInMonth = new Date(
    calendarState.year,
    calendarState.month + 1,
    0,
  ).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getMonth() === calendarState.month &&
    today.getFullYear() === calendarState.year;

  // Empty placeholder cells so day "1" lands on the correct weekday column
  for (let i = 0; i < firstDayOfMonth; i++) {
    const empty = document.createElement("span");
    empty.className = "cal-day cal-day-empty";
    grid.appendChild(empty);
  }

  // One cell per day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("span");
    cell.className = "cal-day";
    cell.textContent = day;
    if (isCurrentMonth && day === today.getDate()) {
      cell.classList.add("cal-day-today");
    }
    grid.appendChild(cell);
  }
}

function changeCalendarMonth(delta) {
  calendarState.month += delta;
  if (calendarState.month < 0) {
    calendarState.month = 11;
    calendarState.year -= 1;
  } else if (calendarState.month > 11) {
    calendarState.month = 0;
    calendarState.year += 1;
  }
  renderCalendar();
}

function initCalendar() {
  const openBtn = document.getElementById("openCalendar");
  const closeBtn = document.getElementById("closeCalendar");
  const modal = document.getElementById("calendarModal");
  const prevBtn = document.getElementById("calPrevBtn");
  const nextBtn = document.getElementById("calNextBtn");

  openBtn.addEventListener("click", () => {
    renderCalendar();
    modal.classList.add("show");
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("show"));

  // Clicking the dark overlay outside the calendar box also closes it
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("show");
  });

  prevBtn.addEventListener("click", () => changeCalendarMonth(-1));
  nextBtn.addEventListener("click", () => changeCalendarMonth(1));
}

/* SECTION 6: SEARCH BAR */
const SEARCH_INDEX = [
  { label: "Dashboard", tag: "Page", page: "dashboard", icon: "fa-house" },
  {
    label: "Courses Offered",
    tag: "Page",
    page: "courses",
    icon: "fa-book-open",
  },
  {
    label: "Attendance",
    tag: "Page",
    page: "attendance",
    icon: "fa-calendar-check",
  },
  { label: "Grades / GPA", tag: "Page", page: "grades", icon: "fa-chart-line" },
  {
    label: "Assignments",
    tag: "Page",
    page: "assignments",
    icon: "fa-clipboard-list",
  },
  {
    label: "Timetable",
    tag: "Page",
    page: "timetable",
    icon: "fa-table-cells-large",
  },
  {
    label: "Announcements",
    tag: "Page",
    page: "announcements",
    icon: "fa-bullhorn",
  },

  { label: "Web Development", tag: "Course", page: "courses", icon: "fa-code" },
  { label: "UI/UX Design", tag: "Course", page: "courses", icon: "fa-palette" },
  {
    label: "Ph.D. in Communication Engineering",
    tag: "Course",
    page: "courses",
    icon: "fa-tower-broadcast",
  },
  { label: "Robotics", tag: "Course", page: "courses", icon: "fa-robot" },
  {
    label: "Master's in Embedded Artificial Intelligence",
    tag: "Course",
    page: "courses",
    icon: "fa-brain",
  },
  {
    label: "Data Analytics",
    tag: "Course",
    page: "courses",
    icon: "fa-chart-line",
  },

  {
    label: "Instructor Precious",
    tag: "Person",
    page: "courses",
    icon: "fa-chalkboard-user",
  },
  {
    label: "Instructor Excel",
    tag: "Person",
    page: "courses",
    icon: "fa-chalkboard-user",
  },
  {
    label: "Sir. Jonathan",
    tag: "Person",
    page: "courses",
    icon: "fa-chalkboard-user",
  },
  {
    label: "Mr. Gameliel",
    tag: "Person",
    page: "courses",
    icon: "fa-chalkboard-user",
  },
  {
    label: "Mr. Yusuf",
    tag: "Person",
    page: "courses",
    icon: "fa-chalkboard-user",
  },

  {
    label: "Titration lab report",
    tag: "Assignment",
    page: "assignments",
    icon: "fa-flask",
  },
  {
    label: "Calculus problem set 4",
    tag: "Assignment",
    page: "assignments",
    icon: "fa-square-root-variable",
  },
  {
    label: "Cell division essay",
    tag: "Assignment",
    page: "assignments",
    icon: "fa-dna",
  },
  {
    label: "Poetry analysis",
    tag: "Assignment",
    page: "assignments",
    icon: "fa-feather",
  },
  {
    label: "Sorting algorithm demo",
    tag: "Assignment",
    page: "assignments",
    icon: "fa-code",
  },
];

function renderSearchResults(matches, resultsBox) {
  resultsBox.innerHTML = "";

  if (matches.length === 0) {
    resultsBox.innerHTML =
      '<div class="search-no-results">No matches found</div>';
    return;
  }

  matches.slice(0, 8).forEach((match) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-result-item";
    item.innerHTML = `
      <i class="fa-solid ${match.icon}"></i>
      <span>${match.label}</span>
      <span class="sr-tag">${match.tag}</span>
    `;
    item.addEventListener("click", () => {
      window.goToPage(match.page);
      resultsBox.classList.remove("show");
      document.getElementById("searchInput").value = "";
    });
    resultsBox.appendChild(item);
  });
}

function initSearch() {
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();

    if (query === "") {
      resultsBox.classList.remove("show");
      return;
    }

    const matches = SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query),
    );

    renderSearchResults(matches, resultsBox);
    resultsBox.classList.add("show");
  });

  // Close the results dropdown when clicking outside the search bar
  document.addEventListener("click", (e) => {
    if (!document.getElementById("searchBar").contains(e.target)) {
      resultsBox.classList.remove("show");
    }
  });
}

/* COURSES "FILTER" POP-OVER */
function initCourseFilter() {
  const grid = document.getElementById("courseGrid");
  const defaultOrder = Array.from(grid.children); // remember original order

  document
    .querySelectorAll("#filterPopover .popover-menu-item")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const sortType = button.dataset.sort;
        const cards = Array.from(grid.children);

        if (sortType === "default") {
          defaultOrder.forEach((card) => grid.appendChild(card));
        } else if (sortType === "az") {
          cards
            .sort((a, b) => a.dataset.name.localeCompare(b.dataset.name))
            .forEach((card) => grid.appendChild(card));
        } else if (sortType === "za") {
          cards
            .sort((a, b) => b.dataset.name.localeCompare(a.dataset.name))
            .forEach((card) => grid.appendChild(card));
        } else if (sortType === "progress-high") {
          cards
            .sort(
              (a, b) => Number(b.dataset.progress) - Number(a.dataset.progress),
            )
            .forEach((card) => grid.appendChild(card));
        } else if (sortType === "progress-low") {
          cards
            .sort(
              (a, b) => Number(a.dataset.progress) - Number(b.dataset.progress),
            )
            .forEach((card) => grid.appendChild(card));
        }

        closeAllPopovers();
      });
    });
}

/* ATTENDANCE "THIS TERM" POP-OVER */
function initTermSwitcher() {
  const label = document.getElementById("termBtnLabel");
  const eyebrow = document.getElementById("attendanceEyebrow");

  document
    .querySelectorAll("#termPopover .popover-menu-item")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const term = button.textContent;
        label.textContent = term;
        eyebrow.textContent = `${term} · 2025/2026`;
        closeAllPopovers();
      });
    });

}

function attendance(a) {
  const courseGrid = document.querySelectorAll(".course-attendance");
  const selectedCourseGrid = document.querySelector(`.${a}`);

  courseGrid.forEach((i) => {
    i.classList.remove("active");
    selectedCourseGrid.classList.add("active");
  });
}

/* GPA "SCORES" POP-OVER */
function initScoreSwitcher() {
  const label = document.getElementById("gpaBtnLabel");
  const eyebrow = document.getElementById("gpaEyebrow");

  document
    .querySelectorAll("#gpaPopover .popover-menu-item")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const term = button.textContent;
        label.textContent = term;
        eyebrow.textContent = `${term} · 2025/2026`;
        closeAllPopovers();
      });
    });

}

function gpaScores(a) {
  const gpaGrid = document.querySelectorAll(".gpaGrid");
  const selectedScore = document.querySelector(`.gpaGrid.${a}`);

  gpaGrid.forEach((i) => {
    i.classList.remove("active");
    selectedScore.classList.add("active");
  });

  console.log(selectedScore);
}

/* ANNOUNCEMENTS "MARK ALL READ" */
function initAnnouncements() {
  const markAllReadBtn = document.getElementById("markAllReadBtn");
  const eyebrow = document.querySelector("#page-announcements .eyebrow");

  markAllReadBtn.addEventListener("click", () => {
    document
      .querySelectorAll("#announceList .announce-card")
      .forEach((card) => {
        card.classList.add("is-read");
      });
    eyebrow.textContent = "0 new";
  });
}

/* ========================================
   STUDENT PROFILES — DYNAMIC RENDERING
   ======================================== */

const STUDENTS_DATA = [
  {
    name: "Chioma Adeyemi",
    id: "STU-20503",
    course: "Data Science & Web Dev",
    image: "media/images/student3.jpeg",
    desc: "Chioma combines statistical rigor with creative problem-solving. Her recent capstone project on predictive healthcare analytics won the faculty innovation award. She mentors first-year students in Python and data visualization techniques.",
  },
  {
    name: "Ogunbiyi Iruwo",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/student2.jpeg",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Amara Nwosu",
    id: "STU-20481",
    course: "Web Dev & MicroSoft",
    image: "media/images/student1.png",
    desc: "A dedicated full-stack developer in training with a passion for artificial intelligence and human-computer interaction. Amara leads the university coding club and has contributed to three open-source projects this semester.",
  },
  {
    name: "Amara Nwo3u",
    id: "STU-20481",
    course: "Web Dev & MicroSoft",
    image: "media/images/student4.png",
    desc: "A dedicated full-stack developer in training with a passion for artificial intelligence and human-computer interaction. Amara leads the university coding club and has contributed to three open-source projects this semester.",
  },
  {
    name: "Ogunbiyi Iruwo",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/student5.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Ogunbiyi Iruwo",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/student6.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Ogunbiyi Iruwo",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/student7.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Ogunbiyi Iruwo",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/student8.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  }
];

function renderStudentProfiles() {
  const container = document.querySelector("#page-students .students-list");
  if (!container) return;

  container.innerHTML = STUDENTS_DATA.map((student, index) => {
    // Even index (0, 2...) → image on the left
    // Odd index (1, 3...) → image on the right
    const isLeft = index % 2 === 0;
    const directionClass = isLeft
      ? "student-card--left fade-in"
      : "student-card--right fade-in delay1";

    // Match your original DOM order: left cards put name first, right cards put ID first
    const metaHtml = isLeft
      ? `<h2>${student.name}</h2><span class="student-id">ID: ${student.id}</span>`
      : `<span class="student-id">ID: ${student.id}</span><h2>${student.name}</h2>`;

    return `
      <div class="student-profile-card student-card fade-in ${directionClass}">
        <div class="student-visual">
          <img src="${student.image}" alt="${student.name}">
        </div>
        <div class="student-info">
          <div class="student-meta">
            ${metaHtml}
          </div>
          <p class="student-course">${student.course}</p>
          <p class="student-desc">${student.desc}</p>
        </div>
      </div>
    `;
  }).join("");

  // Re-observe newly injected .fade-in elements for the scroll animation
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

/* ========================================
   INSTRUCTORS SLIDER
   ======================================== */

const INSTRUCTORS_DATA = [
  {
    name: "Akporuru .C",
    role: "Senior Instructure",
    course: "Web Development",
    image: "media/images/webdev-instructor1.png",
    experience: "5 yrs",
    students: "200+",
    rating: "4",
    tags: ["React", "Node.js", "Cloud"],
  },
  {
    name: "Miss. Doberechi",
    role: "Instructor",
    course: "Data Analytics & Communication",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    experience: "15 yrs",
    students: "350+",
    rating: "4.8",
    tags: ["5G", "Python", "ML"],
  },
  {
    name: "Precious Excel",
    role: "Lead Designer",
    course: "UI/UX Design",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
    experience: "8 yrs",
    students: "180+",
    rating: "4.9",
    tags: ["Figma", "Design Systems", "UX"],
  },
  {
    name: "Miss Daniella",
    role: "Research Fellow",
    course: "Robotics",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
    experience: "10 yrs",
    students: "120+",
    rating: "4.7",
    tags: ["ROS", "Arduino", "AI"],
  },
  {
    name: "Mr. Yusuf",
    role: "Assistant Professor",
    course: "Embedded AI",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
    experience: "7 yrs",
    students: "95+",
    rating: "4.8",
    tags: ["TinyML", "TensorFlow", "IoT"],
  },
  {
    name: "Dr. Nkechi Obi",
    role: "Department Head",
    course: "Computer Networking",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    experience: "18 yrs",
    students: "500+",
    rating: "5.0",
    tags: ["Cisco", "Security", "Cloud"],
  },
];

function renderInstructors() {
  const slider = document.getElementById("instructorsSlider");
  const dotsContainer = document.getElementById("sliderDots");
  if (!slider || !dotsContainer) return;

  // Render instructor cards
  slider.innerHTML = INSTRUCTORS_DATA.map((instructor, index) => {
    const tagsHtml = instructor.tags
      .map((tag) => `<span class="instructor-tag">${tag}</span>`)
      .join("");

    return `
      <div class="instructor-card fade-in delay1" data-index="${index}">
        <div class="instructor-visual">
          <img src="${instructor.image}" alt="${instructor.name}">
        </div>
        <div class="instructor-info">
          <div class="instructor-meta">
            <h3>${instructor.name}</h3>
          </div>
          <p class="instructor-role">${instructor.role} · ${instructor.course}</p>
          <div class="instructor-stats">
            <div><strong>${instructor.experience}</strong><span>Experience</span></div>
            <div><strong>${instructor.students}</strong><span>Students</span></div>
            <div><strong>${instructor.rating}</strong><span>Rating</span></div>
          </div>
          <div class="instructor-tags">
            ${tagsHtml}
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Render dots
  const totalSlides = Math.ceil(INSTRUCTORS_DATA.length / getCardsPerView());
  dotsContainer.innerHTML = Array.from(
    { length: totalSlides },
    (_, i) =>
      `<button class="slider-dot ${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="Go to slide ${i + 1}"></button>`,
  ).join("");

  // Re-observe newly injected .fade-in elements
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

/* ========================================
   score table
   ======================================== */

const student_scores = [
  // ===== SENIOR CLASS (56 students) =====
  {
    name: "Okengwu Ainsley",
    id: "WD-101",
    ca: "18",
    practical: "39",
    exam: "38",
    grade: "95",
  },
  {
    name: "Fulalo Bariaem Bright",
    id: "WD-102",
    ca: "17",
    practical: "30",
    exam: "45",
    grade: "92",
  },
  {
    name: "Otitieme David",
    id: "WD-103",
    ca: "19",
    practical: "29",
    exam: "42",
    grade: "90",
  },
  {
    name: "Chimezie Miracle",
    id: "WD-104",
    ca: "19",
    practical: "29",
    exam: "39",
    grade: "87",
  },
  {
    name: "Ugwuanyi Chidera",
    id: "WD-105",
    ca: "20",
    practical: "26",
    exam: "37",
    grade: "83",
  },
  {
    name: "Emenike Daniel Manuchimzi",
    id: "WD-106",
    ca: "17",
    practical: "30",
    exam: "36",
    grade: "83",
  },
  {
    name: "Henry Dominion Ehis",
    id: "WD-107",
    ca: "14",
    practical: "32",
    exam: "37",
    grade: "83",
  },
  {
    name: "Omitola Boluwatife Precious",
    id: "WD-108",
    ca: "15",
    practical: "26",
    exam: "40",
    grade: "81",
  },
  {
    name: "Ismaila Sumareh",
    id: "WD-109",
    ca: "15",
    practical: "26",
    exam: "40",
    grade: "81",
  },
  {
    name: "Nwachukwu Success",
    id: "WD-110",
    ca: "14",
    practical: "24",
    exam: "42",
    grade: "80",
  },
  {
    name: "Kiimyor Lah-Martins Nwiko",
    id: "WD-111",
    ca: "17",
    practical: "18",
    exam: "44",
    grade: "79",
  },
  {
    name: "Stephen Musa Christabel",
    id: "WD-112",
    ca: "Not Around",
    practical: "37",
    exam: "39",
    grade: "76",
  },
  {
    name: "Nnurum Victory",
    id: "WD-113",
    ca: "15",
    practical: "20",
    exam: "38",
    grade: "73",
  },
  {
    name: "Owhonda Manuchim Bestman",
    id: "WD-114",
    ca: "12",
    practical: "25",
    exam: "34",
    grade: "71",
  },
  {
    name: "Barisitan Martins J. Nwiko",
    id: "WD-115",
    ca: "15",
    practical: "18",
    exam: "36",
    grade: "69",
  },
  {
    name: "Sunday Emmanuel Obinna",
    id: "WD-116",
    ca: "17",
    practical: "10",
    exam: "42",
    grade: "69",
  },
  {
    name: "Iyalla Ibiapu",
    id: "WD-117",
    ca: "15",
    practical: "25",
    exam: "29",
    grade: "69",
  },
  {
    name: "Kaite Legend Eyovwerhuvwu",
    id: "WD-118",
    ca: "15",
    practical: "14",
    exam: "39",
    grade: "68",
  },
  {
    name: "Aderonomu Emmanuel",
    id: "WD-119",
    ca: "12",
    practical: "25",
    exam: "31",
    grade: "68",
  },
  {
    name: "Odoemelam Chinonso Favour",
    id: "WD-120",
    ca: "16",
    practical: "14",
    exam: "37",
    grade: "67",
  },
  {
    name: "Onwuneme Chioma",
    id: "WD-121",
    ca: "20",
    practical: "15",
    exam: "32",
    grade: "67",
  },
  {
    name: "Robinson Noble Monday",
    id: "WD-122",
    ca: "14",
    practical: "20",
    exam: "31",
    grade: "65",
  },
  {
    name: "Millennial Oriagbo Francakeni",
    id: "WD-123",
    ca: "9",
    practical: "20",
    exam: "34",
    grade: "63",
  },
  {
    name: "Okpara King Esemnuchi",
    id: "WD-124",
    ca: "12",
    practical: "24",
    exam: "24",
    grade: "60",
  },
  {
    name: "Ezekwe Ugohukwu Praise",
    id: "WD-125",
    ca: "14",
    practical: "18",
    exam: "27",
    grade: "59",
  },
  {
    name: "Nwachukwu Eucharia",
    id: "WD-126",
    ca: "16",
    practical: "16",
    exam: "27",
    grade: "59",
  },
  {
    name: "Sophia Chiamaka Okeke",
    id: "WD-127",
    ca: "5",
    practical: "23",
    exam: "31",
    grade: "59",
  },
  {
    name: "Princewill-Walt Chisom Destiny",
    id: "WD-128",
    ca: "13",
    practical: "24",
    exam: "21",
    grade: "58",
  },
  {
    name: "Ogunbiyi Irawo",
    id: "WD-129",
    ca: "15",
    practical: "15",
    exam: "27",
    grade: "57",
  },
  {
    name: "Simeon-Nenbee Ledidum",
    id: "WD-130",
    ca: "9",
    practical: "19",
    exam: "29",
    grade: "57",
  },
  {
    name: "Nserka Zenith Barigbon",
    id: "WD-131",
    ca: "15",
    practical: "10",
    exam: "30",
    grade: "55",
  },
  {
    name: "Oladipo John Iseoluwa",
    id: "WD-132",
    ca: "16",
    practical: "10",
    exam: "26",
    grade: "52",
  },
  {
    name: "Obed Ojukwu Entaogel",
    id: "WD-133",
    ca: "17",
    practical: "10",
    exam: "24",
    grade: "51",
  },
  {
    name: "Apapa David Sukarierri B",
    id: "WD-134",
    ca: "10",
    practical: "16",
    exam: "24",
    grade: "50",
  },
  {
    name: "Ogbonna Chibuike Emmanuel",
    id: "WD-135",
    ca: "10",
    practical: "16",
    exam: "20",
    grade: "46",
  },
  {
    name: "Oliver Destiny",
    id: "WD-136",
    ca: "Not Around",
    practical: "6",
    exam: "40",
    grade: "46",
  },
  {
    name: "Okeke Chioma T.A",
    id: "WD-137",
    ca: "Not Around",
    practical: "21",
    exam: "25",
    grade: "46",
  },
  {
    name: "Nmecha Precious Sobulacho",
    id: "WD-138",
    ca: "9",
    practical: "12",
    exam: "24",
    grade: "45",
  },
  {
    name: "Ire Gideon Chimnedum",
    id: "WD-139",
    ca: "9",
    practical: "6",
    exam: "29",
    grade: "44",
  },
  {
    name: "Onoja Nelson Osonimi",
    id: "WD-140",
    ca: "10",
    practical: "7",
    exam: "25",
    grade: "42",
  },
  {
    name: "Chukwuokeah God'answer",
    id: "WD-141",
    ca: "5",
    practical: "10",
    exam: "26",
    grade: "41",
  },
  {
    name: "Chukwuokeah God'slight",
    id: "WD-142",
    ca: "11",
    practical: "10",
    exam: "20",
    grade: "41",
  },
  {
    name: "Nwachukwu Amblessed",
    id: "WD-143",
    ca: "14",
    practical: "10",
    exam: "27",
    grade: "51",
  },
  {
    name: "Ibekwe Danie Chulawuebuka",
    id: "WD-144",
    ca: "9",
    practical: "11",
    exam: "20",
    grade: "40",
  },
  {
    name: "Divine Prince",
    id: "WD-145",
    ca: "4",
    practical: "12",
    exam: "24",
    grade: "40",
  },
  {
    name: "Marvis Daniel",
    id: "WD-146",
    ca: "Not Around",
    practical: "19",
    exam: "21",
    grade: "40",
  },
  {
    name: "Ire Daniel Chimdindu",
    id: "WD-147",
    ca: "12",
    practical: "10",
    exam: "21",
    grade: "43",
  },
  {
    name: "Wizor Breakthrough",
    id: "WD-148",
    ca: "Not Around",
    practical: "6",
    exam: "25",
    grade: "31",
  },
  {
    name: "Lawson Fortune Barahuma",
    id: "WD-149",
    ca: "9",
    practical: "12",
    exam: "22",
    grade: "43",
  },
  {
    name: "Leela Treasure",
    id: "WD-150",
    ca: "19",
    practical: "16",
    exam: "32",
    grade: "67",
  },
  {
    name: "Divine Sarima",
    id: "WD-151",
    ca: "Not Around",
    practical: "10",
    exam: "13",
    grade: "23",
  },
  {
    name: "Wizor Gabriel",
    id: "WD-152",
    ca: "12",
    practical: "13",
    exam: "10",
    grade: "35",
  },
  {
    name: "Njoku Donald",
    id: "WD-153",
    ca: "11",
    practical: "13",
    exam: "10",
    grade: "34",
  },
  {
    name: "Divine Francis Umomia",
    id: "WD-154",
    ca: "11",
    practical: "10",
    exam: "10",
    grade: "31",
  },
  {
    name: "Philip David Kumbut",
    id: "WD-155",
    ca: "7",
    practical: "12",
    exam: "10",
    grade: "29",
  },
  {
    name: "King-James Sophia Zina",
    id: "WD-156",
    ca: "Not Around",
    practical: "11",
    exam: "10",
    grade: "21",
  },

  // ===== JUNIOR CLASS (18 students) =====
  {
    name: "Stephen-Musa Christabel",
    id: "WD-157",
    ca: "13",
    practical: "39",
    exam: "29",
    grade: "81",
  },
  {
    name: "Onitari Hephzibah",
    id: "WD-158",
    ca: "12",
    practical: "28",
    exam: "30",
    grade: "80",
  },
  {
    name: "Ugwoha Derrick",
    id: "WD-159",
    ca: "19",
    practical: "17",
    exam: "41",
    grade: "77",
  },
  {
    name: "Esiri Gerald Ohenebrume",
    id: "WD-160",
    ca: "12",
    practical: "25",
    exam: "25",
    grade: "72",
  },
  {
    name: "Poroma Barinuaka",
    id: "WD-161",
    ca: "15",
    practical: "23",
    exam: "32",
    grade: "70",
  },
  {
    name: "Simeon-Nenbee Tombari",
    id: "WD-162",
    ca: "14",
    practical: "19",
    exam: "35",
    grade: "68",
  },
  {
    name: "Chimezie Somtochukwu Dominion",
    id: "WD-163",
    ca: "7",
    practical: "26",
    exam: "24",
    grade: "67",
  },
  {
    name: "Dominion",
    id: "WD-164",
    ca: "11",
    practical: "33",
    exam: "21",
    grade: "65",
  },
  {
    name: "Zina Sira-Martins Nwiko",
    id: "WD-165",
    ca: "17",
    practical: "16",
    exam: "20",
    grade: "63",
  },
  {
    name: "Bryan Stephen Musa",
    id: "WD-166",
    ca: "9",
    practical: "25",
    exam: "28",
    grade: "62",
  },
  {
    name: "Oyintan Hephzibah N.K",
    id: "WD-167",
    ca: "12",
    practical: "16",
    exam: "30",
    grade: "58",
  },
  {
    name: "Okoebor Davinia Efua",
    id: "WD-168",
    ca: "7",
    practical: "21",
    exam: "18",
    grade: "56",
  },
  {
    name: "Linus Bright",
    id: "WD-169",
    ca: "8",
    practical: "20",
    exam: "17",
    grade: "55",
  },
  {
    name: "Promise MaXwell Badubochi",
    id: "WD-170",
    ca: "11",
    practical: "10",
    exam: "30",
    grade: "51",
  },
  {
    name: "Wokocha Joshua",
    id: "WD-171",
    ca: "10",
    practical: "10",
    exam: "15",
    grade: "45",
  },
  {
    name: "Ire Chiemerie Joshua",
    id: "WD-172",
    ca: "7",
    practical: "19",
    exam: "18",
    grade: "44",
  },
  {
    name: "Bakidoo Believe Burabari",
    id: "WD-173",
    ca: "3",
    practical: "19",
    exam: "11",
    grade: "43",
  },
  {
    name: "Believe Baridoo",
    id: "WD-174",
    ca: "10",
    practical: "14",
    exam: "11",
    grade: "35",
  },
];

function renderScore() {
  const container = document.getElementById("student_scores");
  if (!container) return;

  // Helper to parse numerical scores safely ("-" or "Not Around" return 0)
  const parseScore = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Helper to assign academic grade based on total score percentage
  const calculateGrade = (total) => {
    if (total >= 70) return "A";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 45) return "D";
    if (total >= 40) return "E";
    return "F";
  };

  container.innerHTML = student_scores
    .map((person, index) => {
      const caScore = parseScore(person.ca);
      const practicalScore = parseScore(person.practical);
      const examScore = parseScore(person.exam);

      // Sum total points
      const totalScore = caScore + practicalScore + examScore;

      // Assign calculated grade
      const grade = calculateGrade(totalScore);

      // Dynamically select badge color based on performance
      const badgeClass = grade === "F" ? "badge-danger" : "badge-success";

      return `
      <tr data-index="${index}">
        <td class="student-no">${index + 1}</td>
        <td class="student-name">${person.name}</td>
        <td class="student-id">${person.id}</td>
        <td class="student-ca">${person.ca == "-" || person.ca == "Not Around" ? (person.ca = 0) : person.ca}</td>
        <td class="student-practical">${person.practical == "-" || person.practical == "Not Around" ? (person.practical = 0) : person.practical}</td>
        <td class="student-exam">${person.exam == "-" || person.exam == "Not Around" ? (person.exam = 0) : person.exam}</td>
        <td><span class="badge student-grade ${badgeClass}">${totalScore} ${grade}</span></td>
      </tr>
    `;
    })
    .join("");

  // Re-observe newly injected .fade-in elements
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

function getCardsPerView() {
  const width = window.innerWidth;
  if (width <= 900) return 1;
  return 2;
}

function initInstructorSlider() {
  const slider = document.getElementById("instructorsSlider");
  const prevBtn = document.getElementById("instructorPrev");
  const nextBtn = document.getElementById("instructorNext");
  const dotsContainer = document.getElementById("sliderDots");
  if (!slider || !prevBtn || !nextBtn) return;

  let currentSlide = 0;

  function getSlideWidth() {
    const card = slider.querySelector(".instructor-card");
    if (!card) return 0;
    return card.offsetWidth + 20; // card width + gap
  }

  function getTotalSlides() {
    return Math.ceil(INSTRUCTORS_DATA.length / getCardsPerView());
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.querySelectorAll(".slider-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function updateButtons() {
    const total = getTotalSlides();
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide >= total - 1;
  }

  function goToSlide(index) {
    const total = getTotalSlides();
    currentSlide = Math.max(0, Math.min(index, total - 1));
    const slideWidth = getSlideWidth();
    slider.scrollTo({
      left: currentSlide * slideWidth * getCardsPerView(),
      behavior: "smooth",
    });
    updateDots();
    updateButtons();
  }

  prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));

  // Dot navigation
  if (dotsContainer) {
    dotsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("slider-dot")) {
        goToSlide(Number(e.target.dataset.slide));
      }
    });
  }

  // Update on resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Re-render dots based on new cards per view
      const totalSlides = Math.ceil(
        INSTRUCTORS_DATA.length / getCardsPerView(),
      );
      dotsContainer.innerHTML = Array.from(
        { length: totalSlides },
        (_, i) =>
          `<button class="slider-dot ${i === currentSlide ? "active" : ""}" data-slide="${i}" aria-label="Go to slide ${i + 1}"></button>`,
      ).join("");
      goToSlide(currentSlide);
    }, 150);
  });

  // Scroll snap handling
  slider.addEventListener("scroll", () => {
    const slideWidth = getSlideWidth();
    const newSlide = Math.round(
      slider.scrollLeft / (slideWidth * getCardsPerView()),
    );
    if (newSlide !== currentSlide) {
      currentSlide = newSlide;
      updateDots();
      updateButtons();
    }
  });

  updateButtons();
}

/* RUN EVERYTHING ONCE THE PAGE HAS LOADED */
document.addEventListener("DOMContentLoaded", () => {
  renderStudentProfiles();
  renderInstructors();
  renderScore();
  initInstructorSlider();

  initPageNavigation();
  initAllPopovers();
  initCalendar();
  initSearch();
  initCourseFilter();
  initTermSwitcher();
  initScoreSwitcher();
  initAnnouncements();
});

/* STUDENT LIST EXPORT */
const exportBtn = document.querySelector("#download");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    // 1. Collect all student cards
    const studentCards = document.querySelectorAll(".gpaGrid.active tbody tr");

    const course = document.querySelector(".gpaGrid.active .card-head h3");

    console.log(studentCards)
    const students = [];

    studentCards.forEach((card) => {
      // Extract data safely
      const nameEl = card.querySelector("tr .student-name");
      const idEl = card.querySelector("tr .student-id");
      const caEl = card.querySelector("tr .student-ca");
      const practicalEl = card.querySelector("tr .student-practical");
      const examEl = card.querySelector("tr .student-exam");
      const gradeEl = card.querySelector("tr .student-grade");

      students.push({
        name: nameEl?.textContent.trim() || "Unknown",
        id: idEl?.textContent.trim() || "N/A",
        ca: caEl?.textContent.trim() || "",
        practical: practicalEl?.textContent.trim() || "",
        exam: examEl?.textContent.trim() || "",
        grade: gradeEl?.textContent.trim() || "",
      });
    });

    // 2. Build printable HTML document
    const printDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    let statsRows = "";
    students.forEach((s, index) => {

      statsRows += `
        <tr>
          <td class="num">${index + 1}</td>
          <td class="name">${s.name}</td>
          <td class="id">${s.id}</td>
          <td class="ca">${s.ca}</td>
          <td class="practical">${s.practical}</td>
          <td class="exam">${s.exam}</td>
          <td class="grade">${s.grade}</td>
        </tr>
      `;
    });

    const printableHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Student Report - ${printDate}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #222;
      line-height: 1.5;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #989999;
    }
    .header h1 {
      font-size: 27px;
      font-weight: bold;
      color: #2c3e50; margin-bottom: 6px; }
    .header p {
      color: #797676;
      font-size: 14px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead th {
      background: #2c3e50;
      color: #fff;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    tbody td {
      padding: 14px 12px;
      border-bottom: 1px solid #ddd;
      vertical-align: top;
    }
    tbody tr:nth-child(even) { background: #f8f9fa; }
    .num { width: 40px; text-align: center; font-weight: bold; color: #666; }
    .name { font-weight: 600; color: #2c3e50; min-width: 160px; }
    .id { font-family: monospace; color: #555; min-width: 110px; }
    .course { min-width: 180px; color: #444; }
    .stats { min-width: 140px; }
    .stat-box {
      display: inline-block;
      background: #e8f4f8;
      border: 1px solid #b8dcee;
      border-radius: 4px;
      padding: 4px 10px;
      margin: 2px 4px 2px 0;
      font-size: 13px;
    }
    .stat-box strong { color: #1a5276; margin-right: 4px; }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
    .download-btn {
      display: block;
      margin: 20px auto 0;
      padding: 10px 24px;
      background: #2c3e50;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .download-btn:hover { background: #1a252f; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${course.textContent} Report</h1>
    <p>Generated on ${printDate} &bull; ${students.length} student(s)</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>ID</th>
        <th>CA</th>
        <th>Practical</th>
        <th>Exam</th>
        <th>Grade</th>
      </tr>
    </thead>
    <tbody>
      ${statsRows}
    </tbody>
  </table>

  <div class="footer">
    <p>Confidential &bull; Academic Records</p>
    <button class="download-btn no-print" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <script>
    // Auto-focus print dialog if opened from file
    window.onload = () => {
      if (window.opener) setTimeout(() => window.print(), 300);
    };
  </script>
</body>
</html>`;

    // 3. Create downloadable file
    const blob = new Blob([printableHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const filename = `Student_Report_${new Date().toISOString().split("T")[0]}.html`;

    // 4. Trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Optional: open in new tab for immediate preview
    // window.open(url, "_blank");
  });
}
