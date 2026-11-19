const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwgWICxiLUN9EFVz8zlWqk9LDQpf3lNlGtyJspBUC1eB8ZDHQ5kvLohjjonomP8wG_4Pg/exec";

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initPricingToggle();
  initPlanPreselection();
  initFaqAccordion();
  initScrollReveal();
  initContactForm();
});

/* 1. Responsive Mobile Navigation */
function initMobileMenu() {
  const toggleBtn = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  toggleBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close mobile menu when a link is clicked
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* 2. Interactive Monthly / Annual Pricing Toggle */
function initPricingToggle() {
  const toggle = document.getElementById("billingToggle");
  const amounts = document.querySelectorAll(".price-amount");
  const monthlyLabel = document.getElementById("monthlyLabel");
  const annualLabel = document.getElementById("annualLabel");

  toggle.addEventListener("change", () => {
    const isAnnual = toggle.checked;

    monthlyLabel.classList.toggle("active-label", !isAnnual);
    annualLabel.classList.toggle("active-label", isAnnual);

    amounts.forEach((el) => {
      const targetPrice = isAnnual ? el.dataset.annual : el.dataset.monthly;
      el.textContent = targetPrice;
    });
  });
}

/* 3. Auto-select Plan in Contact Form when clicking Pricing CTAs */
function initPlanPreselection() {
  const planSelect = document.getElementById("planSelect");
  const buttons = document.querySelectorAll(".select-plan-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedPlan = btn.dataset.plan;
      if (selectedPlan) {
        planSelect.value = selectedPlan;
      }
    });
  });
}

/* 4. Accessible FAQ Accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  items.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    btn.addEventListener("click", () => {
      const isCurrentlyOpen = item.classList.contains("active");

      // Close all other open items
      items.forEach((other) => {
        other.classList.remove("active");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        other.querySelector(".faq-answer").style.maxHeight = null;
      });

      if (!isCurrentlyOpen) {
        item.classList.add("active");
        btn.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}

/* 5. Scroll Reveal Animation via IntersectionObserver */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* 6. Contact Form Submission to Google Apps Script (code.gs) */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = submitBtn.querySelector(".btn-text");
  const spinner = submitBtn.querySelector(".spinner");
  const statusEl = document.getElementById("formStatus");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const plan = document.getElementById("planSelect").value;
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !email.includes("@")) {
      statusEl.textContent = "Please enter a valid name and work email.";
      statusEl.classList.add("error");
      return;
    }

    // UI Loading State
    submitBtn.disabled = true;
    btnText.textContent = "Sending...";
    spinner.hidden = false;

    const payload = { name, email, plan, message };

    try {
      // Fallback simulation if user hasn't added their GAS URL yet
      if (GAS_WEB_APP_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL") {
        await new Promise((resolve) => setTimeout(resolve, 900));
        statusEl.textContent = "Demo mode: Form validated! Add your code.gs Web App URL to save to Google Sheets.";
        statusEl.classList.add("success");
        form.reset();
        return;
      }

      // Send as text/plain so the browser skips the CORS preflight OPTIONS check (which GAS doesn't handle)
      const response = await fetch(GAS_WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === "success") {
        statusEl.textContent = result.message;
        statusEl.classList.add("success");
        form.reset();
      } else {
        throw new Error(result.message || "Submission failed.");
      }
    } catch (error) {
      statusEl.textContent = "Something went wrong. Please try again later.";
      statusEl.classList.add("error");
      console.error("Form submission error:", error);
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = "Request Access";
      spinner.hidden = true;
    }
  });
}
