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

/* =====================================================================
   PARTNERSHIPS PAGE JAVASCRIPT
   Two independent features:
   1. Scroll-reveal animation for cards
   2. CTA form validation
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ===================================================================
     1. SCROLL REVEAL ANIMATION
     We use an IntersectionObserver: the browser tells us when an
     element enters the visible part of the screen, and we add the
     "reveal--active" class (defined in the CSS) to fade + slide it in.
     =================================================================== */

  // Grab every card on the page that should animate in
  const revealElements = document.querySelectorAll(".reveal");

  // Give each card a slightly longer delay than the one before it,
  // so they appear in a nice staggered wave instead of all at once.
  // We reset the counter every time a new "group" of cards (like a
  // grid section) starts, so cards far down the page don't end up
  // with a huge delay.
  let lastParent = null;
  let staggerIndex = 0;

  revealElements.forEach(function (el) {
    // If this card's parent container is different from the last
    // card's parent, we're in a new group -- restart the stagger count.
    if (el.parentElement !== lastParent) {
      staggerIndex = 0;
      lastParent = el.parentElement;
    }

    // Set the CSS transition-delay directly on the element.
    // Each card in the same group waits 100ms longer than the last.
    el.style.transitionDelay = staggerIndex * 100 + "ms";
    staggerIndex++;
  });

  // This function runs every time an observed element's visibility changes
  function handleReveal(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal--active");
        // Once it's revealed, stop watching it -- we don't need
        // to check it again, which keeps things efficient.
        observer.unobserve(entry.target);
      }
    });
  }

  // Create the observer.
  // rootMargin "-80px" means the card triggers slightly before it
  // fully reaches the bottom of the screen, which feels more natural.
  const revealObserver = new IntersectionObserver(handleReveal, {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px",
  });

  // Tell the observer to start watching every card
  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ===================================================================
     2. CTA FORM VALIDATION
     We validate on submit, and also re-validate a field the moment
     the user leaves it (on "blur"), so they get feedback early
     instead of only after clicking submit.
     =================================================================== */

  const form = document.getElementById("partnerForm");
  const thankYouMessage = document.getElementById("thankYouMessage");
  const thankYouName = document.getElementById("thankYouName");

  // Grab the four fields we need to validate
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const orgTypeSelect = document.getElementById("orgType");
  const interestSelect = document.getElementById("interest");

  // A simple, readable email pattern -- good enough for front-end
  // checking. It just needs to look like "something@something.something"
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // This object defines HOW to validate each field, and WHAT error
  // message to show if it fails. Keeping it in one place like this
  // makes it easy to add or change rules later.
  const fieldRules = {
    fullName: {
      input: fullNameInput,
      errorEl: document.getElementById("fullNameError"),
      validate: function (value) {
        if (value.trim() === "") {
          return "Please enter your full name.";
        }
        if (value.trim().length < 2) {
          return "Name must be at least 2 characters.";
        }
        // Only letters, spaces, hyphens and apostrophes allowed
        if (!/^[A-Za-z\s'-]+$/.test(value.trim())) {
          return "Name can only contain letters.";
        }
        return ""; // empty string means "no error"
      },
    },
    email: {
      input: emailInput,
      errorEl: document.getElementById("emailError"),
      validate: function (value) {
        if (value.trim() === "") {
          return "Please enter your email address.";
        }
        if (!emailPattern.test(value.trim())) {
          return "Please enter a valid email address.";
        }
        return "";
      },
    },
    orgType: {
      input: orgTypeSelect,
      errorEl: document.getElementById("orgTypeError"),
      validate: function (value) {
        if (value === "") {
          return "Please select an organisation type.";
        }
        return "";
      },
    },
    interest: {
      input: interestSelect,
      errorEl: document.getElementById("interestError"),
      validate: function (value) {
        if (value === "") {
          return "Please select a partnership interest.";
        }
        return "";
      },
    },
  };

  // Runs one field's validate() function and updates its styling
  // and error message on screen. Returns true if the field is valid.
  function validateField(rule) {
    const errorMessage = rule.validate(rule.input.value);
    const isValid = errorMessage === "";

    if (isValid) {
      // Field is good: remove error styling, show a green border
      rule.input.classList.remove("cta__input--invalid");
      rule.input.classList.add("cta__input--valid");
      rule.errorEl.textContent = "";
      rule.errorEl.classList.remove("cta__error--visible");
    } else {
      // Field has a problem: show red border + the error message
      rule.input.classList.remove("cta__input--valid");
      rule.input.classList.add("cta__input--invalid");
      rule.errorEl.textContent = errorMessage;
      rule.errorEl.classList.add("cta__error--visible");
    }

    return isValid;
  }

  // Validate a field as soon as the user clicks/tabs away from it
  Object.keys(fieldRules).forEach(function (key) {
    const rule = fieldRules[key];
    rule.input.addEventListener("blur", function () {
      validateField(rule);
    });
  });

  // Handle the actual form submit
  form.addEventListener("submit", function (event) {
    // Stop the browser from doing its default full-page submit/reload
    event.preventDefault();

    // Run every field's validation and track whether ALL of them passed
    let formIsValid = true;
    Object.keys(fieldRules).forEach(function (key) {
      const rule = fieldRules[key];
      const passed = validateField(rule);
      if (!passed) {
        formIsValid = false;
      }
    });

    // If anything failed, stop here -- the red borders and error
    // messages are already showing the user what to fix.
    if (!formIsValid) {
      return;
    }

    // Everything passed! Show the thank-you message with their name.
    thankYouName.textContent = fullNameInput.value.trim().split(" ")[0];
    form.style.display = "none";
    thankYouMessage.style.display = "block";
  });
});
