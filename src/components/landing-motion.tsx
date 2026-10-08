"use client";

import { useEffect } from "react";

type Box = { element: HTMLElement; top: number; height: number; last?: string };
type MotionItem = Box & { section: string; index: number; last: string };
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };

// Layout coordinates stay independent of the transforms we write while scrolling.
function layoutTop(element: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

export function LandingMotion() {
  useEffect(() => {
    const main = document.querySelector<HTMLElement>("main[data-landing-motion]");
    if (!main) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 650px)");
    const sectionElements = [...main.querySelectorAll<HTMLElement>("[data-motion-section]")];
    const bridgeElements = [...main.querySelectorAll<HTMLElement>("[data-motion-bridge]")];
    let sections: Box[] = [];
    let bridges: Box[] = [];
    let items: MotionItem[] = [];
    let viewport = window.innerHeight;
    let maxScroll = 0;
    let frame = 0;
    let dirty = true;

    function measure() {
      viewport = window.innerHeight;
      maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport);
      sections = sectionElements.map(element => ({ element, top: layoutTop(element), height: element.offsetHeight }));
      bridges = bridgeElements.map(element => ({ element, top: layoutTop(element), height: element.offsetHeight }));
      items = sections.flatMap(({ element }) => {
        const candidates = [...element.querySelectorAll<HTMLElement>("[data-reveal], [data-scroll-card], [data-scroll-scene], .faq-list details, .footer-top, .footer-bottom")]
          .filter(item => !item.classList.contains("faq-list"));
        return candidates.map((item, index) => {
          item.setAttribute("data-motion-item", "");
          return { element: item, top: layoutTop(item), height: item.offsetHeight, section: element.dataset.motionSection ?? "", index, last: "" };
        });
      });
      dirty = false;
    }

    function draw() {
      frame = 0;
      if (dirty) measure(); // Read layout only after resize, image load, or content changes.
      main!.dataset.scrollMotion = preference.matches ? "reduced" : "ready";
      if (preference.matches) return;
      const y = window.scrollY;
      const distance = mobile.matches ? 0.55 : 1;
      for (const box of sections) {
        const { element, top, height } = box;
        const arrival = ease((y + viewport - top) / (viewport * 0.58));
        const departure = ease((y - (top + height - viewport * 0.66)) / (viewport * 0.66));
        const next = `${arrival.toFixed(4)},${departure.toFixed(4)}`;
        if (next === box.last) continue;
        box.last = next;
        element.style.setProperty("--arrival", arrival.toFixed(4));
        element.style.setProperty("--departure", departure.toFixed(4));
      }
      for (const box of bridges) {
        const { element, top, height } = box;
        const end = Math.min(top + height * 0.4 - viewport * 0.2, maxScroll);
        // The footer cannot travel to the viewport top. Use the reachable range.
        const start = Math.min(top - viewport * 0.92, end - 1);
        const progress = ease((y - start) / (end - start));
        if (progress.toFixed(4) === box.last) continue;
        box.last = progress.toFixed(4);
        element.style.setProperty("--bridge", progress.toFixed(4));
        element.style.setProperty("--bridge-rest", (1 - progress).toFixed(4));
      }
      for (const item of items) {
        const { element, top, height, section, index } = item;
        const stagger = section === "preguntas" ? (index % 5) * viewport * 0.018 : 0;
        const end = Math.min(top - viewport * 0.57 + stagger, maxScroll);
        const start = Math.min(top - viewport * 0.98 + stagger, end - 1);
        const enter = section === "inicio" ? 1 : ease((y - start) / (end - start));
        const leave = ease((y - top) / Math.max(80, Math.min(height, viewport * 0.65)));
        const pending = 1 - enter;
        let x = 0, shiftY = 18 * pending - 12 * leave, scale = 1, z = 0;
        const photo = element.classList.contains("hero-image") || element.classList.contains("about-photo");
        switch (section) {
          case "inicio":
            x = photo ? 68 * leave : -16 * leave;
            shiftY = photo ? -42 * leave : -20 * leave;
            scale = photo ? 1 - 0.045 * leave : 1;
            break;
          case "servicios":
            if (element.classList.contains("service-card")) {
              const direction = index % 2 ? 1 : -1;
              x = direction * (34 * pending + 62 * leave);
              shiftY = 8 * pending;
            }
            break;
          case "repuestos":
            scale = 1 - 0.075 * pending - 0.025 * leave;
            z = mobile.matches ? 0 : -42 * pending - 20 * leave;
            shiftY = 26 * pending - 16 * leave;
            break;
          case "taller":
            x = photo ? -12 * pending : 24 * pending - 14 * leave;
            shiftY = photo ? 10 * pending - 18 * leave : 0;
            scale = photo ? 1 + 0.035 * pending - 0.02 * leave : 1;
            break;
          case "preguntas":
            x = 20 * pending;
            shiftY = 10 * pending - 8 * leave;
            break;
          case "contacto":
            x = (element.classList.contains("form-panel") ? 1 : -1) * 32 * pending;
            shiftY = 12 * pending - 12 * leave;
            break;
          case "experiencias":
            shiftY = 22 * pending - 12 * leave;
            break;
        }
        const opacity = 1 - (photo ? 0.4 : 0.36) * pending - 0.26 * leave;
        const inset = photo && section === "taller" && !mobile.matches ? 44 * pending : 0;
        const value = [x * distance, shiftY * distance, scale, z, opacity, inset].map(v => v.toFixed(4));
        const next = value.join(",");
        if (next === item.last) continue;
        item.last = next;
        ["--motion-x", "--motion-y", "--motion-scale", "--motion-z", "--motion-opacity", "--photo-inset"].forEach((name, i) => element.style.setProperty(name, value[i]));
      }
    }

    function schedule() { if (!frame) frame = window.requestAnimationFrame(draw); }
    function invalidate() { dirty = true; schedule(); }
    const resizeObserver = new ResizeObserver(invalidate);
    sectionElements.forEach(element => resizeObserver.observe(element));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", invalidate, { passive: true });
    window.addEventListener("pageshow", invalidate);
    main.addEventListener("load", invalidate, true);
    preference.addEventListener("change", invalidate);
    mobile.addEventListener("change", invalidate);
    let disposed = false;
    document.fonts.ready.then(() => { if (!disposed) invalidate(); });
    schedule();
    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("pageshow", invalidate);
      main.removeEventListener("load", invalidate, true);
      preference.removeEventListener("change", invalidate);
      mobile.removeEventListener("change", invalidate);
      delete main.dataset.scrollMotion;
    };
  }, []);

  return null;
}
