(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------
     Header state + scroll progress
     ------------------------------------------------------------------ */
  const header = document.querySelector("[data-header]");
  const progressBar = document.querySelector("[data-scroll-progress]");
  let scrollQueued = false;

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 24);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
    scrollQueued = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        scrollQueued = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  onScroll();

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-menu]");

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;

    if (!open && mobileMenu.contains(document.activeElement)) {
      menuToggle.focus();
    }

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    if (open) {
      mobileMenu.removeAttribute("inert");
    } else {
      mobileMenu.setAttribute("inert", "");
    }
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });

    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const onDesktop = (event) => {
      if (event.matches) setMenu(false);
    };
    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", onDesktop);
    } else {
      desktopQuery.addListener(onDesktop);
    }
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------ */
  const revealElements = Array.from(document.querySelectorAll(".reveal"));

  if (!reduceMotion.matches && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    revealElements.forEach((element, index) => {
      element.style.setProperty("--delay", `${(index % 4) * 55}ms`);
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     Active navigation link
     ------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* ------------------------------------------------------------------
     Copy email
     ------------------------------------------------------------------ */
  const copyButton = document.querySelector("[data-copy-email]");
  const copyLabel = document.querySelector("[data-copy-label]");
  const copyStatus = document.querySelector("[data-copy-status]");
  let copyTimer = 0;

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const email = copyButton.dataset.email || "waleed.myc@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        if (copyLabel) copyLabel.textContent = "Copied";
        if (copyStatus) copyStatus.textContent = "Email address copied to clipboard.";
        copyButton.classList.add("is-copied");
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(() => {
          if (copyLabel) copyLabel.textContent = "Copy email";
          copyButton.classList.remove("is-copied");
        }, 1800);
      } catch (error) {
        if (copyStatus) copyStatus.textContent = "Copy failed. Opening your email app instead.";
        window.location.href = `mailto:${email}`;
      }
    });
  }

  /* ------------------------------------------------------------------
     Pointer tilt / spatial parallax
     ------------------------------------------------------------------ */
  const tiltTargets = Array.from(document.querySelectorAll("[data-tilt]"));
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  if (tiltTargets.length && "PointerEvent" in window) {
    tiltTargets.forEach((target) => {
      let frame = 0;
      let bounds = null;
      let nextX = 0;
      let nextY = 0;
      const max = target.classList.contains("core-card") ? 7 : 2.4;

      const apply = () => {
        frame = 0;
        target.style.setProperty("--ry", `${(nextX * max).toFixed(2)}deg`);
        target.style.setProperty("--rx", `${(-nextY * max).toFixed(2)}deg`);
      };

      target.addEventListener("pointerenter", () => {
        if (!finePointer.matches || reduceMotion.matches) return;
        bounds = target.getBoundingClientRect();
        target.classList.add("is-tilting");
      });

      target.addEventListener("pointermove", (event) => {
        if (!finePointer.matches || reduceMotion.matches) return;
        if (!bounds) bounds = target.getBoundingClientRect();
        nextX = (event.clientX - bounds.left) / bounds.width - 0.5;
        nextY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (!frame) frame = requestAnimationFrame(apply);
      });

      const reset = () => {
        bounds = null;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        target.classList.remove("is-tilting");
        target.style.removeProperty("--rx");
        target.style.removeProperty("--ry");
      };

      target.addEventListener("pointerleave", reset);
      target.addEventListener("pointercancel", reset);
    });

    window.addEventListener(
      "resize",
      () => {
        tiltTargets.forEach((target) => {
          target.classList.remove("is-tilting");
          target.style.removeProperty("--rx");
          target.style.removeProperty("--ry");
        });
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------
     Cursor reticle
     ------------------------------------------------------------------ */
  const cursor = document.querySelector(".cursor");
  const cursorRing = document.querySelector("[data-cursor-ring]");
  const cursorDot = document.querySelector("[data-cursor-dot]");
  const cursorTargets = "a, button, [data-tilt], input, textarea, select, [role='button']";
  let cursorFrame = 0;
  let cursorActive = false;
  let cursorEnabled = false;
  let pointerX = 0;
  let pointerY = 0;
  let ringX = 0;
  let ringY = 0;
  let dotX = 0;
  let dotY = 0;

  const renderCursor = () => {
    cursorFrame = 0;
    ringX += (pointerX - ringX) * 0.18;
    ringY += (pointerY - ringY) * 0.18;
    dotX += (pointerX - dotX) * 0.6;
    dotY += (pointerY - dotY) * 0.6;
    cursorRing.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
    cursorDot.style.transform = `translate3d(${dotX.toFixed(1)}px, ${dotY.toFixed(1)}px, 0)`;

    if (Math.abs(pointerX - ringX) > 0.3 || Math.abs(pointerY - ringY) > 0.3) {
      cursorFrame = requestAnimationFrame(renderCursor);
    }
  };

  const setCursorEnabled = (enabled) => {
    cursorEnabled = enabled && Boolean(cursor && cursorRing && cursorDot);
    document.documentElement.classList.toggle("has-cursor", cursorEnabled);
    if (!cursorEnabled) return;
    if (cursorFrame) cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    cursorActive = false;
    if (cursor) cursor.classList.remove("is-active", "is-hover", "is-down");
    document.documentElement.classList.remove("cursor-live");
  };

  setCursorEnabled(finePointer.matches && !reduceMotion.matches);

  if (cursor && cursorRing && cursorDot && "PointerEvent" in window) {
    document.addEventListener(
      "pointermove",
      (event) => {
        if (!cursorEnabled) return;
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!cursorActive) {
          cursorActive = true;
          ringX = dotX = pointerX;
          ringY = dotY = pointerY;
          cursor.classList.add("is-active");
          document.documentElement.classList.add("cursor-live");
        }

        if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
      },
      { passive: true }
    );

    document.addEventListener("pointerover", (event) => {
      if (!cursorEnabled) return;
      const target = event.target instanceof Element ? event.target.closest(cursorTargets) : null;
      cursor.classList.toggle("is-hover", Boolean(target));
    });

    document.addEventListener("pointerdown", () => {
      if (cursorEnabled) cursor.classList.add("is-down");
    });

    document.addEventListener("pointerup", () => {
      cursor.classList.remove("is-down");
    });

    const hideCursor = (event) => {
      if (!cursorEnabled || (event instanceof PointerEvent && event.pointerType === "touch")) return;
      cursor.classList.remove("is-active", "is-hover", "is-down");
      cursorActive = false;
    };

    document.documentElement.addEventListener("pointerleave", hideCursor);
    window.addEventListener("blur", hideCursor);
  }

  /* ------------------------------------------------------------------
     Drag-to-rotate core cube
     ------------------------------------------------------------------ */
  const cubeCardEl = document.querySelector(".core-card");
  const cube = document.querySelector("[data-cube]");
  let resetCube = () => {};

  if (cubeCardEl && cube && "PointerEvent" in window) {
    const REST_X = -16;
    const REST_Y = -34;
    const TILT_LIMIT = 80;
    const DRAG_RATE = 0.55;
    const FRICTION = 0.93;

    let rotX = REST_X;
    let rotY = REST_Y;
    let velocityX = 0;
    let velocityY = 0;
    let dragFrame = 0;
    let dragging = false;
    let activePointer = null;
    let lastX = 0;
    let lastY = 0;
    let lastMoveTime = 0;

    const clamp = (value) => Math.max(-TILT_LIMIT, Math.min(TILT_LIMIT, value));
    const clampVelocity = (value) => Math.max(-30, Math.min(30, value));

    const paint = () => {
      cube.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
    };

    const glide = () => {
      dragFrame = 0;
      rotY += velocityX;
      rotX = clamp(rotX + velocityY);
      velocityX *= FRICTION;
      velocityY *= FRICTION;
      paint();

      if (Math.abs(velocityX) > 0.04 || Math.abs(velocityY) > 0.04) {
        dragFrame = requestAnimationFrame(glide);
      } else {
        velocityX = 0;
        velocityY = 0;
        if (!dragging) cubeCardEl.classList.remove("is-cube-live");
      }
    };

    cube.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragging = true;
      activePointer = event.pointerId;
      velocityX = 0;
      velocityY = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveTime = performance.now();
      if (dragFrame) cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      cube.setPointerCapture(event.pointerId);
      cubeCardEl.classList.add("is-cube-live", "is-dragging");
      event.preventDefault();
    });

    cube.addEventListener("pointermove", (event) => {
      if (!dragging || event.pointerId !== activePointer) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      lastMoveTime = performance.now();
      rotY += dx * DRAG_RATE;
      rotX = clamp(rotX + dy * DRAG_RATE);
      velocityX = clampVelocity(dx * DRAG_RATE);
      velocityY = clampVelocity(dy * DRAG_RATE);
      paint();
    });

    const endDrag = (event) => {
      if (!dragging || event.pointerId !== activePointer) return;
      dragging = false;
      activePointer = null;
      cubeCardEl.classList.remove("is-dragging");
      if (reduceMotion.matches || performance.now() - lastMoveTime > 120) {
        if (reduceMotion.matches) cubeCardEl.classList.remove("is-cube-live");
        return;
      }
      if (!dragFrame) dragFrame = requestAnimationFrame(glide);
    };

    cube.addEventListener("pointerup", endDrag);
    cube.addEventListener("pointercancel", endDrag);

    const engageCube = () => cubeCardEl.classList.add("is-cube-live");
    const disengageCube = () => {
      if (!dragging) cubeCardEl.classList.remove("is-cube-live");
    };

    cubeCardEl.addEventListener("pointerenter", engageCube);
    cubeCardEl.addEventListener("pointerleave", disengageCube);
    window.addEventListener("blur", disengageCube);

    resetCube = () => {
      if (dragFrame) cancelAnimationFrame(dragFrame);
      dragFrame = 0;
      dragging = false;
      activePointer = null;
      velocityX = 0;
      velocityY = 0;
      rotX = REST_X;
      rotY = REST_Y;
      cube.style.removeProperty("transform");
      cubeCardEl.classList.remove("is-cube-live", "is-dragging");
    };
  }

  /* ------------------------------------------------------------------
     Motion preference changes
     ------------------------------------------------------------------ */
  const syncCursor = () => setCursorEnabled(finePointer.matches && !reduceMotion.matches);

  const onMotionChange = () => {
    syncCursor();
    resetCube();
    if (!reduceMotion.matches) return;
    tiltTargets.forEach((target) => {
      target.classList.remove("is-tilting");
      target.style.removeProperty("--rx");
      target.style.removeProperty("--ry");
    });
  };

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", onMotionChange);
  } else {
    reduceMotion.addListener(onMotionChange);
  }

  if (typeof finePointer.addEventListener === "function") {
    finePointer.addEventListener("change", syncCursor);
  } else if (typeof finePointer.addListener === "function") {
    finePointer.addListener(syncCursor);
  }
})();
