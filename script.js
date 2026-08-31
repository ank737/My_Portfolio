/* =========================================================
   Ankush — Portfolio Script (vanilla JS)
   ========================================================= */

(function () {
    "use strict";

    /* ---------- Theme toggle (persisted) ---------- */
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");
    const STORAGE_KEY = "ankush-portfolio-theme";

    function applyTheme(theme) {
        if (theme === "light") {
            root.setAttribute("data-theme", "light");
        } else {
            root.setAttribute("data-theme", "dark");
        }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        applyTheme(saved);
    } else {
        const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        applyTheme(prefersLight ? "light" : "dark");
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
            localStorage.setItem(STORAGE_KEY, next);
        });
    }

    /* ---------- Mobile nav ---------- */
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const isOpen = navLinks.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });
        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    /* ---------- Navbar scroll state ---------- */
    const navbar = document.getElementById("navbar");
    function onScroll() {
        if (!navbar) return;
        if (window.scrollY > 8) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- Scroll reveal ---------- */
    const revealItems = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry, i) {
                    if (entry.isIntersecting) {
                        const delay = Math.min(i * 80, 240);
                        entry.target.style.transitionDelay = delay + "ms";
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealItems.forEach(function (el) { observer.observe(el); });
    } else {
        revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---------- Footer year ---------- */
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ---------- Certificate lightbox modal ---------- */
    const certModal = document.getElementById("certModal");
    const certModalImage = document.getElementById("certModalImage");
    const certModalTitle = document.getElementById("certModalTitle");
    const certCards = document.querySelectorAll(".cert-card[data-cert-src]");
    let lastFocused = null;

    function openCertModal(src, title, alt) {
        if (!certModal || !certModalImage) return;
        lastFocused = document.activeElement;
        certModalImage.src = src;
        certModalImage.alt = alt || title || "Certificate";
        if (certModalTitle) certModalTitle.textContent = title || "";
        certModal.hidden = false;
        // force reflow so transition runs
        void certModal.offsetWidth;
        certModal.classList.add("is-open");
        document.body.classList.add("cert-modal-open");
        const closeBtn = certModal.querySelector(".cert-modal-close");
        if (closeBtn) closeBtn.focus();
    }

    function closeCertModal() {
        if (!certModal || certModal.hidden) return;
        certModal.classList.remove("is-open");
        document.body.classList.remove("cert-modal-open");
        const onEnd = function () {
            certModal.hidden = true;
            if (certModalImage) certModalImage.src = "";
            certModal.removeEventListener("transitionend", onEnd);
            if (lastFocused && typeof lastFocused.focus === "function") {
                lastFocused.focus();
            }
        };
        certModal.addEventListener("transitionend", onEnd);
    }

    certCards.forEach(function (card) {
        card.addEventListener("click", function () {
            const src = card.getAttribute("data-cert-src");
            const title = card.getAttribute("data-cert-title") || "";
            const thumb = card.querySelector(".cert-thumb img");
            const alt = thumb ? thumb.getAttribute("alt") : title;
            // Prefer the rendered thumbnail src (handles onerror fallback) when present
            const finalSrc = (thumb && thumb.currentSrc) ? thumb.currentSrc : src;
            openCertModal(finalSrc, title, alt);
        });
    });

    if (certModal) {
        certModal.querySelectorAll("[data-cert-close]").forEach(function (el) {
            el.addEventListener("click", closeCertModal);
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && certModal && !certModal.hidden) {
            closeCertModal();
        }
    });

    /* ---------- Contact form (client-side only) ---------- */
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    if (form && status) {
        form.addEventListener("submit", function (e) {
            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const message = form.message.value.trim();

            if (!name || !email || !message) {
                status.style.color = "crimson";
                status.textContent = "Please fill in all fields.";
                return;
            }
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk) {
                status.style.color = "crimson";
                status.textContent = "Please enter a valid email address.";
                return;
            }

            status.style.color = "";
            status.textContent = "Thanks, " + name + "! Your message is noted — I'll get back to you soon.";
        });
    }
})();