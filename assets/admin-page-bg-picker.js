(function () {
  "use strict";

  var KEY = "htr-portal-page-bg";
  var DEFAULT = "#F3F4F6";
  var PRESETS = [
    { color: "#E5E7EB", labelRu: "Серо-голубой", labelEn: "Cool gray" },
    { color: "#E8E0D4", labelRu: "Тёплый песок", labelEn: "Warm sand" },
    { color: "#DCE5DC", labelRu: "Шалфей", labelEn: "Sage" },
    { color: "#D8E4EF", labelRu: "Мягкий синий", labelEn: "Soft blue" },
    { color: "#E4DEED", labelRu: "Лаванда", labelEn: "Lavender" },
    { color: "#EDE6D6", labelRu: "Кремовый", labelEn: "Cream" },
    { color: "#CBD5E1", labelRu: "Сланец", labelEn: "Slate" },
    { color: "#F3F4F6", labelRu: "Стандарт", labelEn: "Default" },
  ];

  function isValidHex(v) {
    return /^#[0-9a-fA-F]{6}$/.test(v);
  }

  function getLang() {
    try {
      var ls = localStorage.getItem("htr-admin-lang");
      if (ls === "ru" || ls === "en") return ls;
    } catch (e) {}
    return document.documentElement.lang && document.documentElement.lang.startsWith("ru") ? "ru" : "en";
  }

  function getColor() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored && isValidHex(stored)) return stored;
    } catch (e) {}
    return DEFAULT;
  }

  function setColor(color) {
    try {
      localStorage.setItem(KEY, color);
    } catch (e) {}
    applyColor(color);
    window.dispatchEvent(new Event("htr-portal-page-bg-changed"));
  }

  function applyColor(color) {
    document.documentElement.style.setProperty("--htr-page-bg", color);
    document.querySelectorAll(".min-h-screen").forEach(function (el) {
      el.style.background = color;
    });
    document.querySelectorAll("[style*='paddingBottom']").forEach(function (el) {
      if (el.className && String(el.className).indexOf("md:w-") !== -1) {
        el.style.background = color;
      }
    });
  }

  var paletteSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>';

  function buildPicker(currentColor) {
    var ru = getLang() === "ru";
    var root = document.createElement("div");
    root.setAttribute("data-htr-bg-picker", "1");
    root.className = "relative shrink-0";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "flex items-center justify-center gap-1 min-h-[36px] min-w-[36px] px-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition";
    btn.title = ru ? "Цвет фона страницы" : "Page background color";
    btn.setAttribute("aria-label", btn.title);

    var swatch = document.createElement("span");
    swatch.className = "w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0";
    swatch.style.background = currentColor;
    btn.innerHTML = paletteSvg;
    btn.appendChild(swatch);

    var panel = document.createElement("div");
    panel.className =
      "absolute right-0 top-full mt-1 z-50 w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg p-3";
    panel.style.display = "none";
    panel.setAttribute("role", "dialog");

    var title = document.createElement("p");
    title.className = "text-[11px] font-semibold text-stone-500 mb-2";
    title.textContent = ru ? "Фон страницы (для глаз)" : "Page background (easy on eyes)";
    panel.appendChild(title);

    var grid = document.createElement("div");
    grid.className = "grid grid-cols-4 gap-2";
    PRESETS.forEach(function (preset) {
      var pbtn = document.createElement("button");
      pbtn.type = "button";
      pbtn.className =
        "h-9 w-full rounded-lg border-2 transition border-stone-200 hover:border-stone-300";
      pbtn.style.background = preset.color;
      pbtn.title = ru ? preset.labelRu : preset.labelEn;
      if (preset.color.toLowerCase() === currentColor.toLowerCase()) {
        pbtn.className += " border-blue-600 ring-2 ring-blue-100";
      }
      pbtn.addEventListener("click", function () {
        setColor(preset.color);
        swatch.style.background = preset.color;
        panel.style.display = "none";
      });
      grid.appendChild(pbtn);
    });
    panel.appendChild(grid);

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });

    document.addEventListener("mousedown", function (e) {
      if (!root.contains(e.target)) panel.style.display = "none";
    });

    root.appendChild(btn);
    root.appendChild(panel);
    return root;
  }

  function findLangButton(container) {
    return Array.prototype.slice.call(container.querySelectorAll("button")).find(function (b) {
      return /RU/.test(b.textContent || "") && /EN/.test(b.textContent || "");
    });
  }

  function injectPickers() {
    var color = getColor();
    var mobileBar = document.querySelector("header .flex.items-center.gap-1.flex-none");
    if (mobileBar && !mobileBar.querySelector("[data-htr-bg-picker]")) {
      var langBtn = findLangButton(mobileBar);
      var picker = buildPicker(color);
      if (langBtn) mobileBar.insertBefore(picker, langBtn);
      else mobileBar.appendChild(picker);
    }

    var desktopBar = document.querySelector("header .hidden.md\\:grid .flex.justify-end.items-center.gap-2");
    if (desktopBar && !desktopBar.querySelector("[data-htr-bg-picker]")) {
      var langBtn2 = findLangButton(desktopBar);
      var picker2 = buildPicker(color);
      if (langBtn2) desktopBar.insertBefore(picker2, langBtn2);
      else desktopBar.appendChild(picker2);
    }
  }

  applyColor(getColor());

  var observer = new MutationObserver(function () {
    applyColor(getColor());
    injectPickers();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectPickers);
  } else {
    injectPickers();
  }

  window.addEventListener("htr-portal-page-bg-changed", function () {
    applyColor(getColor());
  });
  window.addEventListener("storage", function (e) {
    if (e.key === KEY) applyColor(getColor());
  });
})();
