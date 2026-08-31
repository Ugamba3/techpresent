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

/* ========================================
   MOBILE MENU
   ======================================== */
function toggleMobileMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobileOverlay");
  if (!sidebar || !overlay) return;
  const isOpen = sidebar.classList.contains("active");

  if (isOpen) {
    closeMobileMenu();
  } else {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeMobileMenu() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobileOverlay");
  if (!sidebar || !overlay) return;
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

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
      closeMobileMenu();
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
   //GALLERY//
const students = [
  {
    img: "media/images/Group-photo-techstars.png",
    name: "Group Photo",
    info:"-"
  },
  {
    img: "media/images/Group-with-lappy.png",
    name: "Group Photo",
    info: "-"
  },
  {
    img: "media/images/duo-img.png",
    name: "Group Photo",
    info: "-"
  }
];

const studentsSection = document.querySelector("#page-students #students");

if (studentsSection) {

  studentsSection.insertAdjacentHTML("beforeend", `
    <div class="students-gallery">
      <div class="students-gallery-track"></div>

      <button class="students-gallery-arrow students-gallery-prev" type="button">
        &lsaquo;
      </button>

      <button class="students-gallery-arrow students-gallery-next" type="button">
        &rsaquo;
      </button>
    </div>
  `);

  const track = studentsSection.querySelector(".students-gallery-track");

  students.forEach(student => {
    track.insertAdjacentHTML("beforeend", `
      <div class="students-gallery-slide">
        <img 
          src="${student.img}" 
          alt="${student.name}"
        >

        <div class="students-gallery-text">
          <h2>${student.name}</h2>
          <p>${student.info}</p>
        </div>
      </div>
    `);
  });

  let currentSlide = 0;

  function showStudentSlide() {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  studentsSection
    .querySelector(".students-gallery-next")
    .addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % students.length;
      showStudentSlide();
    });

  studentsSection
    .querySelector(".students-gallery-prev")
    .addEventListener("click", () => {
      currentSlide =
        (currentSlide - 1 + students.length) % students.length;

      showStudentSlide();
    });

  setInterval(() => {
    currentSlide = (currentSlide + 1) % students.length;
    showStudentSlide();
  }, 5000);
}



const STUDENTS_DATA = [
  {
    name: "Ugwoha Derrick",
    id: "STU-20503",
    course: "Web Development",
    image: "media/images/student3.jpeg",
    desc: "Derrick combines statistical rigor with creative problem-solving. Her recent capstone project on predictive healthcare analytics won the faculty innovation award. She mentors first-year students in Python and data visualization techniques.",
  },
  {
    name: "Ogunbiyi Irawo Jezreel",
    id: "STU-20492",
    course: "Web Development",
    image: "media/images/student2.jpeg",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Ugwanyi Chidera Angel",
    id: "STU-20481",
    course: "Web Dev & Robotics",
    image: "media/images/Ugwanyi-Chidera.png",
    desc: "A dedicated full-stack developer in training with a passion for artificial intelligence and human-computer interaction. Amara leads the university coding club and has contributed to three open-source projects this semester.",
  },
  {
    name: "Davinia Okoebor Efua",
    id: "STU-20481",
    course: "Web Dev & MicroSoft",
    image: "media/images/Davinia-Profile.jpeg",
    desc: "A dedicated full-stack developer in training with a passion for artificial intelligence and human-computer interaction. Amara leads the university coding club and has contributed to three open-source projects this semester.",
  },
  {
    name: "Okengwu Ainsley",
    id: "STU-20492",
    course: "Graphic Design & Web Dev",
    image: "media/images/Okengwu-Ainsley.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
  {
    name: "Otitime David",
    id: "STU-20492",
    course: "Web Development",
    image: "media/images/David-OT.png",
    desc: "Specializing in wireless networks and signal processing. David has a keen interest in 5G infrastructure and IoT systems. He recently presented a paper on low-latency communication protocols at the regional engineering symposium.",
  },
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
    name: "Akporuru Confidence",
    role: "Senior Instructure",
    course: "Web Development",
    image: "media/images/webdev-instructor1.png",
    experience: "5 yrs",
    students: "100+",
    rating: "5.0",
    tags: ["React", "Node.js", "Cloud"],
  },
  {
    name: "Miss. Doberechi",
    role: "Instructor",
    course: "Data Analytics & Communication",
    image:
      "media/images/Eze-Duberechi.png",
    experience: "4 yrs",
    students: "50+",
    rating: "4.8",
    tags: ["5G", "Python", "ML"],
  },
  {
    name: "Gbenegbara Precious",
    role: "Lead Designer",
    course: "UI/UX Design",
    image:
      "media/images/Gbenegbara-Precious.png",
    experience: "5 yrs",
    students: "80+",
    rating: "4.9",
    tags: ["Figma", "Design Systems", "UX"],
  },
  {
    name: "Miss Daniella",
    role: "Research Fellow",
    course: "Robotics",
    image:
      "media/images/Daniella-Fischer.png",
    experience: "8 yrs",
    students: "70+",
    rating: "4.7",
    tags: ["ROS", "Arduino", "AI"],
  },
  {
    name: "Ugo Victor",
    role: "Assistant Professor",
    course: "Embedded AI",
    image:
      "media/images/Ugo Victor.png",
    experience: "7 yrs",
    students: "95+",
    rating: "4.8",
    tags: ["TinyML", "TensorFlow", "IoT"],
  },
  {
    name: "Boma-George Emmanuella",
    role: "Department Head",
    course: "Computer Networking",
    image:
      "media/images/Boma-George.png",
    experience: "6 yrs",
    students: "90+",
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

/* ========================================
   score table — Web Development Senior & Junior Class
   ======================================== */

const SENIOR_SCORES = [
  { name: 'Okengwu Ainsley', ca: '18', practical: '39', exam: '38' },
  { name: 'Fulalo Bariaem Bright', ca: '17', practical: '30', exam: '45' },
  { name: 'Otitieme David', ca: '19', practical: '29', exam: '42' },
  { name: 'Chimezie Miracle', ca: '19', practical: '29', exam: '39' },
  { name: 'Ugwuanyi Chidera', ca: '20', practical: '26', exam: '37' },
  { name: 'Emenike Daniel Manuchimzi', ca: '17', practical: '30', exam: '36' },
  { name: 'Henry Dominion Ehis', ca: '14', practical: '32', exam: '37' },
  { name: 'Omitola Boluwatife Precious', ca: '15', practical: '26', exam: '40' },
  { name: 'Ismaila Sumareh', ca: '15', practical: '26', exam: '40' },
  { name: 'Nwachukwu Success', ca: '14', practical: '24', exam: '42' },
  { name: 'Kiimyor Lah-Martins Nwiko', ca: '17', practical: '18', exam: '44' },
  { name: 'Stephen Musa Christabel', ca: 'Not Around', practical: '37', exam: '39' },
  { name: 'Nnurum Victory', ca: '15', practical: '20', exam: '38' },
  { name: 'Owhonda Manuchim Bestman', ca: '12', practical: '25', exam: '34' },
  { name: 'Barisitan Martins J. Nwiko', ca: '15', practical: '18', exam: '36' },
  { name: 'Sunday Emmanuel Obinna', ca: '17', practical: '10', exam: '42' },
  { name: 'Iyalla Ibiapu', ca: '15', practical: '25', exam: '29' },
  { name: 'Kaite Legend Eyovwerhuvwu', ca: '15', practical: '14', exam: '39' },
  { name: 'Aderonomu Emmanuel', ca: '12', practical: '25', exam: '31' },
  { name: 'Odoemelam Chinonso Favour', ca: '16', practical: '14', exam: '37' },
  { name: 'Onwuneme Chioma', ca: '20', practical: '15', exam: '32' },
  { name: 'Leela Treasure', ca: '19', practical: '16', exam: '32' },
  { name: 'Robinson Noble Monday', ca: '14', practical: '20', exam: '31' },
  { name: 'Millennial Oriagbo Francakeni', ca: '9', practical: '20', exam: '34' },
  { name: 'Okpara King Esemnuchi', ca: '12', practical: '24', exam: '24' },
  { name: 'Ezekwe Ugohukwu Praise', ca: '14', practical: '18', exam: '27' },
  { name: 'Nwachukwu Eucharia', ca: '16', practical: '16', exam: '27' },
  { name: 'Sophia Chiamaka Okeke', ca: '5', practical: '23', exam: '31' },
  { name: 'Princewill-Walt Chisom Destiny', ca: '13', practical: '24', exam: '21' },
  { name: 'Ogunbiyi Irawo', ca: '15', practical: '15', exam: '27' },
  { name: 'Simeon-Nenbee Ledidum', ca: '9', practical: '19', exam: '29' },
  { name: 'Nserka Zenith Barigbon', ca: '15', practical: '10', exam: '30' },
  { name: 'Oladipo John Iseoluwa', ca: '16', practical: '10', exam: '26' },
  { name: 'Obed Ojukwu Entaogel', ca: '17', practical: '10', exam: '24' },
  { name: 'Nwachukwu Amblessed', ca: '14', practical: '10', exam: '27' },
  { name: 'Apapa David Sukarierri B', ca: '10', practical: '16', exam: '24' },
  { name: 'Ogbonna Chibuike Emmanuel', ca: '10', practical: '16', exam: '20' },
  { name: 'Oliver Destiny', ca: 'Not Around', practical: '6', exam: '40' },
  { name: 'Okeke Chioma T.A', ca: 'Not Around', practical: '21', exam: '25' },
  { name: 'Nmecha Precious Sobulacho', ca: '9', practical: '12', exam: '24' },
  { name: 'Ire Gideon Chimnedum', ca: '9', practical: '6', exam: '29' },
  { name: 'Ire Daniel Chimdindu', ca: '12', practical: '10', exam: '21' },
  { name: 'Lawson Fortune Barahuma', ca: '9', practical: '12', exam: '22' },
  { name: 'Onoja Nelson Osonimi', ca: '10', practical: '7', exam: '25' },
  { name: 'Chukwuokeah God\'answer', ca: '5', practical: '10', exam: '26' },
  { name: 'Chukwuokeah God\'slight', ca: '11', practical: '10', exam: '20' },
  { name: 'Ibekwe Danie Chulawuebuka', ca: '9', practical: '11', exam: '20' },
  { name: 'Divine Prince', ca: '4', practical: '12', exam: '24' },
  { name: 'Marvis Daniel', ca: 'Not Around', practical: '19', exam: '21' },
  { name: 'Wizor Gabriel', ca: '12', practical: '13', exam: '10' },
  { name: 'Njoku Donald', ca: '11', practical: '13', exam: '10' },
  { name: 'Wizor Breakthrough', ca: 'Not Around', practical: '6', exam: '25' },
  { name: 'Divine Francis Umomia', ca: '11', practical: '10', exam: '10' },
  { name: 'Philip David Kumbut', ca: '7', practical: '12', exam: '10' },
  { name: 'Divine Sarima', ca: 'Not Around', practical: '10', exam: '13' },
  { name: 'King-James Sophia Zina', ca: 'Not Around', practical: '11', exam: '10' },
];
const JUNIOR_SCORES = [
  { name: 'Stephen-Musa Christabel', ca: '13', practical: '39', exam: '29' },
  { name: 'Ugwoha Derrick', ca: '19', practical: '17', exam: '41' },
  { name: 'Onitari Hephzibah', ca: '12', practical: '28', exam: '30' },
  { name: 'Poroma Barinuaka', ca: '15', practical: '23', exam: '32' },
  { name: 'Simeon-Nenbee Tombari', ca: '14', practical: '19', exam: '35' },
  { name: 'Dominion', ca: '11', practical: '33', exam: '21' },
  { name: 'Esiri Gerald Ohenebrume', ca: '12', practical: '25', exam: '25' },
  { name: 'Bryan Stephen Musa', ca: '9', practical: '25', exam: '28' },
  { name: 'Oyintan Hephzibah N.K', ca: '12', practical: '16', exam: '30' },
  { name: 'Chimezie Somtochukwu Dominion', ca: '7', practical: '26', exam: '24' },
  { name: 'Zina Sira-Martins Nwiko', ca: '17', practical: '16', exam: '20' },
  { name: 'Promise Maxwell Badubochi', ca: '11', practical: '10', exam: '30' },
  { name: 'Okoebor Davinia Efua', ca: '7', practical: '21', exam: '18' },
  { name: 'Linus Bright', ca: '8', practical: '20', exam: '17' },
  { name: 'Ire Chiemerie Joshua', ca: '7', practical: '19', exam: '18' },
  { name: 'Wokocha Joshua', ca: '10', practical: '10', exam: '15' },
  { name: 'Believe Baridoo', ca: '10', practical: '14', exam: '11' },
  { name: 'Bakidoo Believe Burabari', ca: '3', practical: '19', exam: '11' },
];

function renderScore() {
  // Helper to parse numerical scores safely ("-" or "Not Around" return 0)
  const parseScore = (val) => {
    if (val === "Not Around") return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  // Pick a badge color for the Total column based on overall performance
  const totalBadgeClass = (total) => {
    if (total >= 80) return "badge-success";
    if (total >= 50) return "badge-warning";
    return "badge-danger";
  };

  const renderInto = (containerId, data) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data
      .map((person, index) => {
        const caScore = parseScore(person.ca);
        const practicalScore = parseScore(person.practical);
        const examScore = parseScore(person.exam);
        const totalScore = caScore + practicalScore + examScore;
        const badgeClass = totalBadgeClass(totalScore);
        const caDisplay = person.ca === "Not Around" ? '<span class="muted">Not Around</span>' : person.ca;

        return `
      <tr data-index="${index}">
        <td class="student-no">${index + 1}</td>
        <td class="student-name">${person.name}</td>
        <td class="student-ca">${caDisplay}</td>
        <td class="student-practical">${practicalScore}</td>
        <td class="student-exam">${examScore}</td>
        <td><span class="badge student-grade ${badgeClass}">${totalScore}</span></td>
      </tr>
    `;
      })
      .join("");
  };

  renderInto("student_scores_senior", SENIOR_SCORES);
  renderInto("student_scores_junior", JUNIOR_SCORES);

  // Re-observe newly injected .fade-in elements
  document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
}

/* ========================================
   attendance table — Web Development Senior & Junior Class
   ======================================== */

const SENIOR_ATTENDANCE = [
  { name: 'Okengwu Ainsley', id: 'WD-SR-001', pct: 100, remark: 'Excellent attendance' },
  { name: 'Fulalo Bariaem Bright', id: 'WD-SR-002', pct: 99, remark: 'Consistently punctual' },
  { name: 'Otitieme David', id: 'WD-SR-003', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Chimezie Miracle', id: 'WD-SR-004', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Ugwuanyi Chidera', id: 'WD-SR-005', pct: 99, remark: 'Great classroom presence' },
  { name: 'Emenike Daniel Manuchimzi', id: 'WD-SR-006', pct: 99, remark: 'Very active participant' },
  { name: 'Henry Dominion Ehis', id: 'WD-SR-007', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Omitola Boluwatife Precious', id: 'WD-SR-008', pct: 99, remark: 'Always on time' },
  { name: 'Ismaila Sumareh', id: 'WD-SR-009', pct: 99, remark: 'Strong dedication shown' },
  { name: 'Nwachukwu Success', id: 'WD-SR-010', pct: 100, remark: 'Impressive consistency' },
  { name: 'Kiimyor Lah-Martins Nwiko', id: 'WD-SR-011', pct: 99, remark: 'Fully committed to the program' },
  { name: 'Stephen Musa Christabel', id: 'WD-SR-012', pct: 99, remark: 'Model attendance record' },
  { name: 'Nnurum Victory', id: 'WD-SR-013', pct: 100, remark: 'Excellent attendance' },
  { name: 'Owhonda Manuchim Bestman', id: 'WD-SR-014', pct: 99, remark: 'Consistently punctual' },
  { name: 'Barisitan Martins J. Nwiko', id: 'WD-SR-015', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Sunday Emmanuel Obinna', id: 'WD-SR-016', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Iyalla Ibiapu', id: 'WD-SR-017', pct: 99, remark: 'Great classroom presence' },
  { name: 'Kaite Legend Eyovwerhuvwu', id: 'WD-SR-018', pct: 99, remark: 'Very active participant' },
  { name: 'Aderonomu Emmanuel', id: 'WD-SR-019', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Odoemelam Chinonso Favour', id: 'WD-SR-020', pct: 99, remark: 'Always on time' },
  { name: 'Onwuneme Chioma', id: 'WD-SR-021', pct: 99, remark: 'Strong dedication shown' },
  { name: 'Leela Treasure', id: 'WD-SR-022', pct: 100, remark: 'Impressive consistency' },
  { name: 'Robinson Noble Monday', id: 'WD-SR-023', pct: 99, remark: 'Fully committed to the program' },
  { name: 'Millennial Oriagbo Francakeni', id: 'WD-SR-024', pct: 99, remark: 'Model attendance record' },
  { name: 'Okpara King Esemnuchi', id: 'WD-SR-025', pct: 100, remark: 'Excellent attendance' },
  { name: 'Ezekwe Ugohukwu Praise', id: 'WD-SR-026', pct: 99, remark: 'Consistently punctual' },
  { name: 'Nwachukwu Eucharia', id: 'WD-SR-027', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Sophia Chiamaka Okeke', id: 'WD-SR-028', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Princewill-Walt Chisom Destiny', id: 'WD-SR-029', pct: 99, remark: 'Great classroom presence' },
  { name: 'Ogunbiyi Irawo', id: 'WD-SR-030', pct: 99, remark: 'Very active participant' },
  { name: 'Simeon-Nenbee Ledidum', id: 'WD-SR-031', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Nserka Zenith Barigbon', id: 'WD-SR-032', pct: 99, remark: 'Always on time' },
  { name: 'Oladipo John Iseoluwa', id: 'WD-SR-033', pct: 99, remark: 'Strong dedication shown' },
  { name: 'Obed Ojukwu Entaogel', id: 'WD-SR-034', pct: 100, remark: 'Impressive consistency' },
  { name: 'Nwachukwu Amblessed', id: 'WD-SR-035', pct: 99, remark: 'Fully committed to the program' },
  { name: 'Apapa David Sukarierri B', id: 'WD-SR-036', pct: 99, remark: 'Model attendance record' },
  { name: 'Ogbonna Chibuike Emmanuel', id: 'WD-SR-037', pct: 100, remark: 'Excellent attendance' },
  { name: 'Oliver Destiny', id: 'WD-SR-038', pct: 99, remark: 'Consistently punctual' },
  { name: 'Okeke Chioma T.A', id: 'WD-SR-039', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Nmecha Precious Sobulacho', id: 'WD-SR-040', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Ire Gideon Chimnedum', id: 'WD-SR-041', pct: 99, remark: 'Great classroom presence' },
  { name: 'Ire Daniel Chimdindu', id: 'WD-SR-042', pct: 99, remark: 'Very active participant' },
  { name: 'Lawson Fortune Barahuma', id: 'WD-SR-043', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Onoja Nelson Osonimi', id: 'WD-SR-044', pct: 99, remark: 'Always on time' },
  { name: 'Chukwuokeah God\'answer', id: 'WD-SR-045', pct: 99, remark: 'Strong dedication shown' },
  { name: 'Chukwuokeah God\'slight', id: 'WD-SR-046', pct: 100, remark: 'Impressive consistency' },
  { name: 'Ibekwe Danie Chulawuebuka', id: 'WD-SR-047', pct: 99, remark: 'Fully committed to the program' },
  { name: 'Divine Prince', id: 'WD-SR-048', pct: 99, remark: 'Model attendance record' },
  { name: 'Marvis Daniel', id: 'WD-SR-049', pct: 100, remark: 'Excellent attendance' },
  { name: 'Wizor Gabriel', id: 'WD-SR-050', pct: 99, remark: 'Consistently punctual' },
  { name: 'Njoku Donald', id: 'WD-SR-051', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Wizor Breakthrough', id: 'WD-SR-052', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Divine Francis Umomia', id: 'WD-SR-053', pct: 99, remark: 'Great classroom presence' },
  { name: 'Philip David Kumbut', id: 'WD-SR-054', pct: 99, remark: 'Very active participant' },
  { name: 'Divine Sarima', id: 'WD-SR-055', pct: 100, remark: 'Outstanding commitment' },
  { name: 'King-James Sophia Zina', id: 'WD-SR-056', pct: 99, remark: 'Always on time' },
];
const JUNIOR_ATTENDANCE = [
  { name: 'Stephen-Musa Christabel', id: 'WD-JR-001', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Ugwoha Derrick', id: 'WD-JR-002', pct: 99, remark: 'Great classroom presence' },
  { name: 'Onitari Hephzibah', id: 'WD-JR-003', pct: 99, remark: 'Very active participant' },
  { name: 'Poroma Barinuaka', id: 'WD-JR-004', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Simeon-Nenbee Tombari', id: 'WD-JR-005', pct: 99, remark: 'Always on time' },
  { name: 'Dominion', id: 'WD-JR-006', pct: 99, remark: 'Strong dedication shown' },
  { name: 'Esiri Gerald Ohenebrume', id: 'WD-JR-007', pct: 100, remark: 'Impressive consistency' },
  { name: 'Bryan Stephen Musa', id: 'WD-JR-008', pct: 99, remark: 'Fully committed to the program' },
  { name: 'Oyintan Hephzibah N.K', id: 'WD-JR-009', pct: 99, remark: 'Model attendance record' },
  { name: 'Chimezie Somtochukwu Dominion', id: 'WD-JR-010', pct: 100, remark: 'Excellent attendance' },
  { name: 'Zina Sira-Martins Nwiko', id: 'WD-JR-011', pct: 99, remark: 'Consistently punctual' },
  { name: 'Promise Maxwell Badubochi', id: 'WD-JR-012', pct: 99, remark: 'Highly engaged in class' },
  { name: 'Okoebor Davinia Efua', id: 'WD-JR-013', pct: 100, remark: 'Reliable and dedicated' },
  { name: 'Linus Bright', id: 'WD-JR-014', pct: 99, remark: 'Great classroom presence' },
  { name: 'Ire Chiemerie Joshua', id: 'WD-JR-015', pct: 99, remark: 'Very active participant' },
  { name: 'Wokocha Joshua', id: 'WD-JR-016', pct: 100, remark: 'Outstanding commitment' },
  { name: 'Believe Baridoo', id: 'WD-JR-017', pct: 99, remark: 'Always on time' },
  { name: 'Bakidoo Believe Burabari', id: 'WD-JR-018', pct: 99, remark: 'Strong dedication shown' },
];
function renderAttendance() {
  const renderInto = (containerId, data) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data
      .map((person) => {
        const badgeClass = person.pct >= 100 ? "badge-success" : "badge-success";
        return `
      <tr>
        <td>${person.name}</td>
        <td>${person.id}</td>
        <td><span class="badge ${badgeClass}">${person.pct}%</span></td>
        <td>${person.remark}</td>
      </tr>
    `;
      })
      .join("");
  };

  renderInto("attendance_senior", SENIOR_ATTENDANCE);
  renderInto("attendance_junior", JUNIOR_ATTENDANCE);

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
  renderAttendance();
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
