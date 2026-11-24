/* Сайт натяжных потолков. Все данные берутся из config.js, здесь только логика.
   Блоки: утилиты → иконки → отрисовка секций → калькулятор → форма → прочее. */
(function () {
  "use strict";
  var C = window.SITE_CONFIG;
  var P = C.pricing;
  var NB = " ";

  /* ====================== Утилиты ====================== */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  // Типографика: неразрывные пробелы после коротких слов и между числом и единицей
  var SHORT = /(^|[\s(«„])(в|во|на|с|со|к|ко|о|об|и|а|но|по|до|за|у|из|от|не|ни|для|без|при|под|над|или|же|то|ее|её|мы|вы|он|их)\s+/gi;
  function typo(s) {
    s = String(s == null ? "" : s).replace(/—/g, "-");
    s = s.replace(SHORT, function (m, p, w) { return p + w + NB; });
    s = s.replace(SHORT, function (m, p, w) { return p + w + NB; });
    s = s.replace(/(\d)\s+(₽|м²|м\b|шт|мин|лет|года|год|дней|дня|день|часа|час|см|%)/g, "$1" + NB + "$2");
    s = s.replace(/(\d)\s(\d{3})(?!\d)/g, "$1" + NB + "$2");
    return s;
  }
  function t(s) { return esc(typo(s)); } // экранировать + типографика
  function num(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB); }
  function rub(n) { return num(n) + NB + "₽"; }
  function roundUp(n) { var r = P.roundTo || 100; return Math.ceil(n / r) * r; }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return list[0]; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function fmtNum(v) { return String(Math.round(v * 10) / 10).replace(".", ","); }
  function parseNum(v) { var n = parseFloat(String(v).replace(",", ".").replace(/[^\d.]/g, "")); return isFinite(n) ? n : 0; }
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function toast(msg) {
    var el = $("#toast"); el.textContent = msg; el.classList.add("is-on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { el.classList.remove("is-on"); }, 2600);
  }
  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key)); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return null; } }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(fallback);
    fallback(); return Promise.resolve();
    function fallback() {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }
  function goal(name) { if (C.metrikaId && window.ym) window.ym(C.metrikaId, "reachGoal", name); }
  function scrollToEl(el) { if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  var isDesktop = function () { return matchMedia("(min-width: 1024px)").matches; };

  /* ====================== Иконки ====================== */
  var ICON = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 12h12"/></svg>',
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>'
  };
  // Значки мессенджеров и соцсетей: круг фирменного цвета с белым символом
  var BRAND = {
    telegram: { color: "#2AABEE", name: "Telegram", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path fill="#fff" d="M5.4 11.6 17 7.1c.6-.2 1.1.1.9 1L16 17.1c-.1.7-.6.8-1.1.5l-3-2.2-1.5 1.4c-.2.2-.3.3-.6.3l.2-3.1 5.6-5.1c.2-.2 0-.3-.3-.1l-7 4.4-3-.9c-.6-.2-.6-.6.1-.9z"/></svg>' },
    whatsapp: { color: "#25D366", name: "WhatsApp", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#25D366"/><path fill="#fff" transform="translate(5.2 5.1) scale(.57)" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' },
    max: { color: "#3E55F8", name: "MAX", svg: function (id) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#14C3F9"/><stop offset=".45" stop-color="#3E55F8"/><stop offset="1" stop-color="#9612FA"/></linearGradient></defs><rect width="24" height="24" rx="6.5" fill="url(#' + id + ')"/><path fill="#fff" fill-rule="evenodd" transform="translate(4.3 4.3) scale(.155)" d="M50.76 0c27.53 0 49.12 22.34 49.12 49.89S77.61 99.23 51.02 99.23c-9.43 0-14.01-1.33-21.37-6.54-.5-.36-1.2-.26-1.63.19-5.66 6.04-20.17 10.28-20.83 2.03C7.19 80.53 0 71.18 0 49.61 0 21.3 23.22 0 50.76 0m.77 24.55c-13.07-.68-23.26 8.39-25.51 22.58-1.86 11.75 1.44 26.07 4.26 26.8 1.2.3 4.08-1.9 6.18-3.88.4-.37.99-.44 1.45-.15 3.27 2 6.97 3.5 11.05 3.71 13.42.7 25.3-9.8 26-23.21.71-13.42-10.01-25.14-23.43-25.85"/></svg>'; } },
    vk: { color: "#0077FF", name: "ВКонтакте", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#0077FF"/><path fill="#fff" d="M12.6 16.4c-4.3 0-6.8-3-6.9-7.9h2.2c.1 3.6 1.7 5.2 3 5.5V8.5h2v3.1c1.3-.1 2.6-1.6 3.1-3.1h2c-.3 1.9-1.7 3.4-2.7 4 1 .5 2.6 1.7 3.2 3.9h-2.2c-.5-1.5-1.6-2.6-3.4-2.8v2.8z"/></svg>' },
    instagram: { color: "#C13584", name: "Instagram", svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#C13584"/><rect x="6.5" y="6.5" width="11" height="11" rx="3.2" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="#fff" stroke-width="1.6"/><circle cx="15.3" cy="8.7" r=".8" fill="#fff"/></svg>' }
  };
  var biN = 0;
  function bi(id, cls) { var svg = BRAND[id].svg; if (typeof svg === "function") svg = svg("g" + id + (++biN)); return '<span class="mi ' + (cls || "") + '">' + svg + "</span>"; }

  var M = C.messengers;
  function msgLink(id, text) {
    var q = text ? encodeURIComponent(text) : "";
    if (id === "telegram") return "https://t.me/" + M.telegram.username + (q ? "?text=" + q : "");
    if (id === "whatsapp") return "https://wa.me/" + M.whatsapp.phone + (q ? "?text=" + q : "");
    if (id === "max") return M.max.url;
    return "tel:" + C.company.phoneRaw;
  }
  function enabledMessengers() { return ["telegram", "whatsapp", "max"].filter(function (k) { return M[k] && M[k].enabled; }); }

  /* ====================== Расчёт ====================== */
  function roomArea(r) { return r.sizeMode === "dims" ? r.len * r.wid : r.area; }
  function roomPerimeter(r) { return r.sizeMode === "dims" ? 2 * (r.len + r.wid) : 4 * Math.sqrt(r.area) * 1.05; }
  function defaultLines(a) { return Math.max(2, Math.round(Math.sqrt(a) * 1.5)); }
  function calcRoom(r) {
    var a = roomArea(r), per = roomPerimeter(r);
    var tx = byId(P.textures, r.texture), cn = byId(P.constructions, r.construction);
    var sum = a * tx.price;
    sum += (cn.perM2 || 0) * a + (cn.perMeter || 0) * per;
    if (cn.perLine) sum += cn.perLine * (r.lines || defaultLines(a));
    P.extras.forEach(function (e) { sum += (r.extras[e.id] || 0) * e.price; });
    if (r.demolition) sum += P.demolition.perM2 * a;
    P.clarify.forEach(function (q) {
      if (!r.clarify[q.id]) return;
      sum += q.type === "perMeter" ? q.price * per : q.type === "perM2" ? q.price * a : q.price;
    });
    return sum;
  }
  function totals() {
    var sum = 0; state.rooms.forEach(function (r) { sum += calcRoom(r); });
    var from = roundUp(Math.max(sum, P.minOrder));
    return { from: from, to: roundUp(from * P.rangeK), minApplied: sum < P.minOrder };
  }
  function roomName(r) { return byId(P.rooms, r.type).name; }
  function roomSummary(r) {
    var parts = [byId(P.textures, r.texture).name.toLowerCase(), byId(P.constructions, r.construction).name.toLowerCase()];
    P.extras.forEach(function (e) { var v = r.extras[e.id]; if (v) parts.push((e.short || e.name.toLowerCase()) + " " + v + NB + e.unit); });
    if (r.demolition) parts.push("демонтаж");
    return parts.join(" · ");
  }

  /* ====================== Состояние калькулятора ====================== */
  var STORE_KEY = "pp-calc-v1";
  function newRoom(over) {
    var d = P.defaultRoom;
    var r = { id: uid(), type: d.type, sizeMode: "area", area: d.area, len: d.len, wid: d.wid, texture: d.texture,
      construction: d.construction, lines: null, extras: {}, demolition: false, clarify: {} };
    P.extras.forEach(function (e) { r.extras[e.id] = (d.extras && d.extras[e.id]) || 0; });
    if (over) {
      for (var k in over) if (k !== "extras") r[k] = over[k];
      if (over.extras) P.extras.forEach(function (e) { r.extras[e.id] = over.extras[e.id] || 0; });
    }
    return r;
  }
  var state = store(STORE_KEY);
  if (!state || !state.rooms || !state.rooms.length) state = { rooms: [newRoom()], active: 0, touched: false, attach: true };
  state.active = clamp(state.active || 0, 0, state.rooms.length - 1);
  var compare = null; // { texture, construction } для сравнения активной комнаты
  function save() { store(STORE_KEY, state); }
  function active() { return state.rooms[state.active]; }

  /* ====================== Шапка ====================== */
  var NAV = [["#prices", "Цены"], ["#calc", "Калькулятор"], ["#works", "Работы"], ["#reviews", "Отзывы"], ["#faq", "Вопросы"], ["#booking", "Контакты"]];
  function logoHTML() {
    var co = C.company;
    var mark = co.logoImage ? '<img class="logo__img" src="' + esc(co.logoImage) + '" alt="">' : '<span class="logo__mark" aria-hidden="true">' + esc(co.logoText) + "</span>";
    return '<a class="logo" href="#top" aria-label="' + esc(co.name) + ', на главную">' + mark + "<span>" + esc(co.name).replace(" ", NB) + '<span class="logo__city">' + esc(co.city) + "</span></span></a>";
  }
  function renderHeader() {
    var co = C.company;
    var msgs = enabledMessengers().map(function (k) { return '<a href="' + esc(msgLink(k)) + '" target="_blank" rel="noopener" aria-label="Написать в ' + BRAND[k].name + '">' + bi(k) + "</a>"; }).join("");
    $("#header").innerHTML =
      '<div class="container header__row">' + logoHTML() +
      '<nav class="nav" aria-label="Разделы">' + NAV.map(function (n) { return '<a href="' + n[0] + '">' + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="header__contacts"><a class="header__phone" href="tel:' + esc(co.phoneRaw) + '">' + esc(co.phone).replace(/ /g, NB) + '</a><span class="header__hours">' + t(co.hoursText) + "</span></div>" +
      '<div class="header__msg">' + msgs + "</div>" +
      '<div class="header__actions">' +
      '<a class="icon-btn" href="tel:' + esc(co.phoneRaw) + '" aria-label="Позвонить">' + ICON.phone + "</a>" +
      '<button class="icon-btn" id="menu-btn" aria-expanded="false" aria-controls="mnav" aria-label="Открыть меню">' + ICON.menu + "</button>" +
      '<a class="btn btn--primary btn--sm header__cta" href="#booking">Вызвать замерщика</a></div></div>' +
      '<div class="mnav" id="mnav" hidden><nav aria-label="Меню">' + NAV.map(function (n) { return '<a class="mnav__link" href="' + n[0] + '">' + n[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="mnav__bottom"><a class="mnav__phone" href="tel:' + esc(co.phoneRaw) + '">' + esc(co.phone).replace(/ /g, NB) + '</a><div class="socials">' +
      enabledMessengers().map(function (k) { return '<a class="social" href="' + esc(msgLink(k)) + '" target="_blank" rel="noopener" aria-label="' + BRAND[k].name + '">' + bi(k) + "</a>"; }).join("") +
      '</div><a class="btn btn--primary btn--block" href="#booking">Вызвать замерщика</a></div></div>';
    var btn = $("#menu-btn"), panel = $("#mnav");
    btn.addEventListener("click", function () {
      var open = panel.hidden; panel.hidden = !open;
      btn.setAttribute("aria-expanded", String(open)); btn.innerHTML = open ? ICON.close : ICON.menu;
      btn.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });
    function closeMenu() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.innerHTML = ICON.menu; btn.setAttribute("aria-label", "Открыть меню"); }
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) closeMenu(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { closeMenu(); btn.focus(); } });
  }

  /* ====================== Первый экран ====================== */
  function measureHTML() {
    return '<div class="measure"><span class="measure__icon">' + ICON.ruler + '</span><span><span class="measure__title">' + t(C.measure.title) + '</span><span class="measure__text">' + t(C.measure.text) + "</span></span></div>";
  }
  function renderHero() {
    var h = C.hero;
    $("#top").innerHTML = '<div class="container hero__grid"><div>' +
      (h.eyebrow ? '<span class="hero__eyebrow">' + t(h.eyebrow) + "</span>" : "") +
      "<h1>" + t(h.title) + '</h1><p class="hero__lead">' + t(h.lead) + "</p>" +
      '<div class="hero__cta"><a class="btn btn--primary" href="#calc">Рассчитать стоимость</a><a class="btn btn--ghost" href="#booking">Вызвать замерщика</a></div>' +
      measureHTML() +
      '<ul class="facts">' + C.facts.map(function (f) { return '<li class="fact"><span class="fact__num">' + t(f.num) + '</span><span class="fact__txt">' + t(f.text) + "</span></li>"; }).join("") + "</ul></div>" +
      '<div class="hero__media"><picture><source media="(min-width: 1024px)" srcset="' + esc(h.photo) + '"><img src="' + esc(h.photoSmall || h.photo) + '" alt="' + esc(h.photoAlt) + '" width="800" height="720" fetchpriority="high"></picture>' +
      (h.photoCaption ? '<span class="photo-cap">' + t(h.photoCaption) + "</span>" : "") + "</div></div>";
  }

  /* ====================== Готовые наборы ====================== */
  var presetRoom = C.presets.rooms[0].id;
  function presetToRoom(set, pr) {
    return newRoom({ type: pr.type, sizeMode: "area", area: pr.area, len: pr.len, wid: pr.wid, texture: set.texture, construction: set.construction, extras: set.extras });
  }
  function renderPresets() {
    var pr = byId(C.presets.rooms, presetRoom);
    $("#prices").innerHTML = '<div class="container"><div class="section__head"><h2 id="prices-h">Сколько стоит потолок в типовой комнате</h2><p>' + t("Цены под ключ: полотно, профиль, монтаж и светильники. Выберите комнату или посчитайте точнее в калькуляторе ниже.") + "</p></div>" +
      '<div class="chips" role="group" aria-label="Комната">' + C.presets.rooms.map(function (r) {
        return '<button class="chip" data-preset-room="' + r.id + '" aria-pressed="' + (r.id === presetRoom) + '">' + esc(r.name) + " " + num(r.area) + NB + "м²</button>";
      }).join("") + "</div>" +
      '<div class="sets">' + C.presets.sets.map(function (s) {
        var price = roundUp(Math.max(calcRoom(presetToRoom(s, pr)), P.minOrder));
        return '<article class="panel set' + (s.popular ? " set--popular" : "") + '">' + (s.popular ? '<span class="set__badge">Чаще выбирают</span>' : "") +
          "<h3>" + t(s.name) + '</h3><div class="set__price">от ' + rub(price) + "<small>" + esc(pr.name.toLowerCase()) + " " + num(pr.area) + NB + "м² под ключ</small></div>" +
          "<ul>" + s.includes.map(function (i) { return "<li>" + t(i) + "</li>"; }).join("") + "</ul>" +
          '<button class="btn btn--light btn--block" data-preset-set="' + s.id + '">Посчитать под мои размеры</button></article>';
      }).join("") + "</div></div>";
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-preset-room]");
    if (b) { presetRoom = b.getAttribute("data-preset-room"); renderPresets(); var nb = $('[data-preset-room="' + presetRoom + '"]'); if (nb) nb.focus(); return; }
    b = e.target.closest("[data-preset-set]");
    if (b) {
      var set = byId(C.presets.sets, b.getAttribute("data-preset-set")), pr = byId(C.presets.rooms, presetRoom);
      var r = presetToRoom(set, pr); r.id = active().id;
      state.rooms[state.active] = r; state.touched = true; compare = null;
      save(); renderCalc(); scrollToEl($("#calc")); toast("Набор перенесён в калькулятор");
    }
  });

  /* ====================== Калькулятор ====================== */
  function optionHTML(o, kind, selected, price) {
    return '<button type="button" class="option" data-act="' + kind + '" data-val="' + o.id + '" aria-pressed="' + selected + '">' +
      '<img src="' + esc(o.img) + '" alt="" loading="lazy" width="320" height="200">' +
      '<span class="option__body"><span class="option__title">' + t(o.name) + '<span class="option__check" aria-hidden="true"></span></span>' +
      '<span class="option__desc">' + t(o.desc) + '</span><span class="option__price">' + price + "</span></span></button>";
  }
  function constrPrice(c) {
    if (c.perMeter) return "+" + rub(c.perMeter) + " за" + NB + "м по" + NB + "стенам";
    if (c.perLine) return "+" + rub(c.perLine) + " за" + NB + "м линии";
    if (c.perM2) return "+" + rub(c.perM2) + "/м²";
    return "без доплаты";
  }
  function stepperHTML(key, val, unit, label) {
    return '<span class="stepper" role="group" aria-label="' + esc(label) + '"><button type="button" data-act="dec" data-key="' + key + '" aria-label="Меньше"' + (val <= 0 ? " disabled" : "") + ">−</button>" +
      '<output data-out="' + key + '" aria-live="polite">' + num(val) + NB + unit + "</output>" +
      '<button type="button" data-act="inc" data-key="' + key + '" aria-label="Больше">+</button></span>';
  }
  function extrasSummary(r) {
    var p = [];
    P.extras.forEach(function (e) { if (r.extras[e.id]) p.push((e.short || e.name.toLowerCase()) + " " + r.extras[e.id] + NB + e.unit); });
    if (r.demolition) p.push("демонтаж");
    return p.length ? p.join(", ") : "ничего не выбрано";
  }
  function clarifySummary(r) {
    var n = P.clarify.filter(function (q) { return r.clarify[q.id]; }).length;
    return n ? "отмечено: " + n : "можно пропустить";
  }

  function renderCalc() {
    var r = active(), a = roomArea(r);
    var cn = byId(P.constructions, r.construction);
    var mainC = P.constructions.filter(function (c) { return c.main; });
    var moreC = P.constructions.filter(function (c) { return !c.main; });
    var showMore = !cn.main;
    var openGroups = isDesktop() ? " open" : "";

    var html = '<div class="container"><div class="section__head"><h2 id="calc-h">Сколько будет стоить ваш потолок</h2><p>' +
      t("Выберите комнату, размер и вид потолка. Можно посчитать сразу всю квартиру. Расчёт сохранится, даже если закроете страницу.") + "</p></div>" +
      '<div class="calc"><div class="panel">' +
      '<div class="rooms" role="tablist" aria-label="Помещения">' +
      state.rooms.map(function (x, i) {
        return '<button type="button" class="room-tab" role="tab" data-act="room" data-idx="' + i + '" aria-selected="' + (i === state.active) + '">' + esc(roomName(x)) + " · " + fmtNum(roomArea(x)) + NB + "м²</button>";
      }).join("") +
      '<button type="button" class="room-tab room-tab--add" data-act="add-room">+ Добавить комнату</button></div>' +

      '<div class="step"><h3 class="step__title"><span class="step__n">1</span>Помещение</h3><div class="chips" role="group" aria-label="Тип помещения">' +
      P.rooms.map(function (x) { return '<button type="button" class="chip" data-act="type" data-val="' + x.id + '" aria-pressed="' + (x.id === r.type) + '">' + esc(x.name) + "</button>"; }).join("") + "</div></div>" +

      '<div class="step"><h3 class="step__title"><span class="step__n">2</span>Размер</h3>' +
      '<div class="segmented" role="group" aria-label="Как указать размер"><button type="button" data-act="mode" data-val="area" aria-pressed="' + (r.sizeMode === "area") + '">Площадь</button><button type="button" data-act="mode" data-val="dims" aria-pressed="' + (r.sizeMode === "dims") + '">Длина × ширина</button></div>' +
      (r.sizeMode === "area"
        ? '<div class="size-area"><div class="field"><label for="f-area">Площадь</label><div class="input-unit"><input id="f-area" class="input input--num" inputmode="decimal" data-act="area" value="' + fmtNum(r.area) + '" autocomplete="off"><span>м²</span></div></div>' +
          '<input class="range" type="range" min="2" max="100" step="1" value="' + Math.round(r.area) + '" data-act="area-range" aria-label="Площадь, ползунок" style="margin-top:26px"></div>'
        : '<div class="size-row"><div class="field"><label for="f-len">Длина</label><div class="input-unit"><input id="f-len" class="input input--num" inputmode="decimal" data-act="len" value="' + fmtNum(r.len) + '" autocomplete="off"><span>м</span></div></div>' +
          '<span class="size-x" aria-hidden="true">×</span><div class="field"><label for="f-wid">Ширина</label><div class="input-unit"><input id="f-wid" class="input input--num" inputmode="decimal" data-act="wid" value="' + fmtNum(r.wid) + '" autocomplete="off"><span>м</span></div></div>' +
          '<span class="size-total">= <b data-out="area">' + fmtNum(a) + NB + "м²</b></span></div>") +
      "</div>" +

      '<div class="step"><h3 class="step__title"><span class="step__n">3</span>Полотно</h3><p class="step__hint">' + t("Как будет выглядеть поверхность потолка") + "</p>" +
      '<div class="options options--5" role="group" aria-label="Полотно">' + P.textures.map(function (x) { return optionHTML(x, "texture", x.id === r.texture, "от " + rub(x.price) + "/м²"); }).join("") + "</div>" +
      '<p class="scroll-hint">Листайте вбок, чтобы увидеть все варианты</p></div>' +

      '<div class="step"><h3 class="step__title"><span class="step__n">4</span>Вид потолка</h3><p class="step__hint">' + t("Как потолок примыкает к стенам и как устроен свет") + "</p>" +
      '<div class="options" role="group" aria-label="Вид потолка" id="constr-list">' +
      mainC.concat(showMore ? moreC : []).map(function (x) { return optionHTML(x, "construction", x.id === r.construction, constrPrice(x)); }).join("") + "</div>" +
      '<p class="scroll-hint">Листайте вбок, чтобы увидеть все варианты</p>' +
      (moreC.length && !showMore ? '<button type="button" class="link-btn" data-act="more-constr">Ещё ' + moreC.length + " вариантов: " + esc(moreC.slice(0, 3).map(function (c) { return c.name.toLowerCase(); }).join(", ")) + "…</button>" : "") +
      (cn.perLine ? '<div class="extra" style="margin-top:12px"><span class="extra__name">Длина световых линий<span class="extra__price">' + rub(cn.perLine) + " за" + NB + "м</span></span>" + stepperHTML("lines", r.lines || defaultLines(a), "м", "Длина световых линий") + "</div>" : "") +
      "</div>" +

      '<div class="step"><h3 class="step__title"><span class="step__n">5</span>Свет и дополнительно</h3>' +
      '<details class="group" id="g-extras"' + openGroups + '><summary><span><span class="group__title">Светильники, карниз, трубы</span><span class="group__sum" data-out="extras-sum">' + esc(extrasSummary(r)) + "</span></span></summary><div class=\"group__body\">" +
      P.extras.map(function (e) {
        return '<div class="extra"><span class="extra__name">' + t(e.name) + '<span class="extra__price">' + rub(e.price) + " " + t(e.note) + "</span></span>" + stepperHTML(e.id, r.extras[e.id] || 0, e.unit, e.name) + "</div>";
      }).join("") +
      '<div class="extra"><label class="extra__name" for="f-dem">' + t(P.demolition.name) + '<span class="extra__price">' + rub(P.demolition.perM2) + '/м²</span></label><span class="switch"><input id="f-dem" type="checkbox" data-act="demolition"' + (r.demolition ? " checked" : "") + "><span></span></span></div>" +
      "</div></details></div>" +

      '<div class="step"><h3 class="step__title"><span class="step__n">6</span>Уточнить цену</h3>' +
      '<details class="group" id="g-clarify"' + openGroups + '><summary><span><span class="group__title">' + t("Ответьте, и расчёт станет точнее") + '</span><span class="group__sum" data-out="clarify-sum">' + esc(clarifySummary(r)) + "</span></span></summary><div class=\"group__body\">" +
      P.clarify.map(function (q) {
        return '<div class="extra"><label class="extra__name" for="f-q-' + q.id + '">' + t(q.name) + '</label><span class="switch"><input id="f-q-' + q.id + '" type="checkbox" data-act="clarify" data-key="' + q.id + '"' + (r.clarify[q.id] ? " checked" : "") + "><span></span></span></div>";
      }).join("") + "</div></details></div>" +
      (state.rooms.length > 1 ? '<button type="button" class="link-btn room-remove" data-act="remove-room">Удалить «' + esc(roomName(r)) + '» из расчёта</button>' : "") +
      "</div>" +
      '<aside class="calc__result panel result" id="result" aria-live="polite"></aside></div></div>';

    $("#calc").innerHTML = html;
    renderResult();
  }

  function renderResult() {
    var T = totals(), r = active();
    var rooms = state.rooms.map(function (x, i) {
      return '<li><button type="button" class="result__room" data-act="room" data-idx="' + i + '"' + (i === state.active ? ' aria-current="true"' : "") + "><span>" + esc(roomName(x)) + ", " + fmtNum(roomArea(x)) + NB + "м²<small>" + esc(roomSummary(x)) + "</small></span><b>" + rub(roundUp(calcRoom(x))) + "</b></button></li>";
    }).join("");
    var cmp = "";
    if (compare) {
      var b = newRoom(r); b.texture = compare.texture; b.construction = compare.construction;
      if (byId(P.constructions, b.construction).perLine && !b.lines) b.lines = defaultLines(roomArea(b));
      var pa = roundUp(calcRoom(r)), pb = roundUp(calcRoom(b)), d = pb - pa;
      cmp = '<div class="compare"><b>' + t("Сравнение для «" + roomName(r) + "»") + '</b>' +
        '<div class="compare__cols"><div class="compare__col">Сейчас<br>' + esc(byId(P.textures, r.texture).name) + ", " + esc(byId(P.constructions, r.construction).name.toLowerCase()) + "<b>" + rub(pa) + "</b></div>" +
        '<div class="compare__col compare__col--b">Вариант Б<b>' + rub(pb) + "</b></div></div>" +
        '<label class="small">Полотно<select data-act="cmp-texture">' + P.textures.map(function (x) { return '<option value="' + x.id + '"' + (x.id === compare.texture ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("") + "</select></label>" +
        '<label class="small">Вид потолка<select data-act="cmp-constr">' + P.constructions.map(function (x) { return '<option value="' + x.id + '"' + (x.id === compare.construction ? " selected" : "") + ">" + esc(x.name) + "</option>"; }).join("") + "</select></label>" +
        '<p class="compare__diff">' + (d === 0 ? "Цена одинаковая" : (d > 0 ? "Дороже на " : "Дешевле на ") + rub(Math.abs(d))) + "</p>" +
        '<div class="compare__actions"><button type="button" class="btn btn--primary btn--sm" data-act="cmp-apply">Выбрать вариант Б</button><button type="button" class="btn btn--light btn--sm" data-act="cmp-close">Закрыть</button></div></div>';
    }
    $("#result").innerHTML =
      '<span class="result__title">Ваш расчёт</span><ul class="result__rooms">' + rooms + "</ul>" +
      '<div class="result__total"><span class="muted small">' + (state.rooms.length > 1 ? "Итого за" + NB + state.rooms.length + NB + plural(state.rooms.length, "комнату", "комнаты", "комнат") : "Примерная стоимость") + "</span>" +
      '<span class="result__from">от ' + rub(T.from) + "</span>" +
      (P.priceMode === "range" && !T.minApplied ? '<p class="result__range">' + t("Обычно похожие заказы выходят") + " <b class=\"nowrap\">в" + NB + num(T.from) + "‑" + rub(T.to) + "</b></p>" : "") +
      (T.minApplied ? '<p class="result__range">Минимальный заказ ' + rub(P.minOrder) + "</p>" : "") + "</div>" +
      '<details class="details"><summary>Что может сделать дороже</summary><ul>' + P.mayCostMore.map(function (m) { return "<li>" + t(m) + "</li>"; }).join("") + "</ul></details>" +
      '<p class="note">' + ICON.check + "<span>" + t("Точную цену назовёт замерщик. Она фиксируется в договоре и дальше не меняется.") + "</span></p>" + cmp +
      '<div class="result__actions"><button type="button" class="btn btn--primary btn--block" data-act="book">Записаться на замер с этим расчётом</button>' +
      (compare ? "" : '<button type="button" class="btn btn--light btn--block" data-act="compare">Сравнить с другим вариантом</button>') + "</div>";
    updateStickyBar();
    renderAttached();
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function changed(light) {
    state.touched = true; save();
    if (light) {
      // обновить подписи без полной перерисовки (чтобы не терять фокус в полях)
      var r = active();
      var tab = $('.room-tab[data-idx="' + state.active + '"]'); if (tab) tab.textContent = roomName(r) + " · " + fmtNum(roomArea(r)) + NB + "м²";
      var ao = $('[data-out="area"]'); if (ao) ao.textContent = fmtNum(roomArea(r)) + NB + "м²";
      var es = $('[data-out="extras-sum"]'); if (es) es.textContent = extrasSummary(r);
      var cs = $('[data-out="clarify-sum"]'); if (cs) cs.textContent = clarifySummary(r);
      renderResult();
    } else renderCalc();
  }

  // Клики внутри калькулятора
  document.addEventListener("click", function (e) {
    var el = e.target.closest("#calc [data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act"), r = active(), val = el.getAttribute("data-val");
    switch (act) {
      case "room": state.active = +el.getAttribute("data-idx"); compare = null; save(); renderCalc(); break;
      case "add-room":
        state.rooms.push(newRoom()); state.active = state.rooms.length - 1; compare = null; changed();
        var st = $(".step"); if (st) setTimeout(function () { $('.room-tab[aria-selected="true"]').scrollIntoView({ block: "nearest", inline: "nearest" }); }, 0);
        toast("Комната добавлена"); break;
      case "remove-room":
        state.rooms.splice(state.active, 1); state.active = Math.max(0, state.active - 1); compare = null; changed(); break;
      case "type": r.type = val; setPressed(el); changed(true); break;
      case "mode":
        if (val === r.sizeMode) break;
        if (val === "dims") { var s = Math.sqrt(r.area); r.len = Math.round(s * 1.2 * 10) / 10; r.wid = Math.round(r.area / r.len * 10) / 10; }
        else r.area = Math.round(r.len * r.wid * 10) / 10;
        r.sizeMode = val; changed(); break;
      case "texture": r.texture = val; setPressed(el); changed(true); break;
      case "construction":
        var wasLine = !!byId(P.constructions, r.construction).perLine;
        r.construction = val;
        if (!!byId(P.constructions, val).perLine !== wasLine) changed(); else { setPressed(el); changed(true); }
        break;
      case "more-constr":
        var list = $("#constr-list");
        list.insertAdjacentHTML("beforeend", P.constructions.filter(function (c) { return !c.main; }).map(function (x) { return optionHTML(x, "construction", x.id === r.construction, constrPrice(x)); }).join(""));
        el.remove(); break;
      case "inc": case "dec":
        var key = el.getAttribute("data-key"), d = act === "inc" ? 1 : -1;
        if (key === "lines") r.lines = clamp((r.lines || defaultLines(roomArea(r))) + d, 1, 200);
        else r.extras[key] = clamp((r.extras[key] || 0) + d, 0, 200);
        var v = key === "lines" ? r.lines : r.extras[key];
        var out = $('[data-out="' + key + '"]'); if (out) out.textContent = num(v) + NB + (key === "lines" ? "м" : byId(P.extras, key).unit);
        var dec = el.parentNode.querySelector('[data-act="dec"]'); if (dec) dec.disabled = v <= 0;
        changed(true); break;
      case "compare":
        compare = { texture: r.texture, construction: r.construction === "standard" ? "shadow" : "standard" }; renderResult(); break;
      case "cmp-apply":
        r.texture = compare.texture; r.construction = compare.construction; compare = null; changed(); toast("Вариант Б выбран"); break;
      case "cmp-close": compare = null; renderResult(); break;
      case "book": state.attach = true; state.touched = true; save(); renderAttached(); scrollToEl($("#booking")); break;
    }
  });
  function setPressed(el) {
    $$('[data-act="' + el.getAttribute("data-act") + '"]', el.closest("#calc")).forEach(function (b) { b.setAttribute("aria-pressed", String(b === el)); });
  }
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.closest || !el.closest("#calc")) return;
    var act = el.getAttribute("data-act"), r = active();
    if (act === "area") { var v = parseNum(el.value); if (v > 0) { r.area = clamp(v, 1, 500); var rg = $('[data-act="area-range"]'); if (rg) rg.value = Math.round(r.area); changed(true); } }
    else if (act === "area-range") { r.area = +el.value; var f = $("#f-area"); if (f) f.value = fmtNum(r.area); changed(true); }
    else if (act === "len" || act === "wid") { var n = parseNum(el.value); if (n > 0) { r[act] = clamp(n, 0.5, 50); changed(true); } }
  });
  document.addEventListener("change", function (e) {
    var el = e.target; if (!el.closest || !el.closest("#calc")) return;
    var act = el.getAttribute("data-act"), r = active();
    if (act === "demolition") { r.demolition = el.checked; changed(true); }
    else if (act === "clarify") { r.clarify[el.getAttribute("data-key")] = el.checked; changed(true); }
    else if (act === "cmp-texture") { compare.texture = el.value; renderResult(); $('[data-act="cmp-texture"]').focus(); }
    else if (act === "cmp-constr") { compare.construction = el.value; renderResult(); $('[data-act="cmp-constr"]').focus(); }
    else if (act === "area" || act === "len" || act === "wid") { el.value = fmtNum(act === "area" ? r.area : r[act]); }
  });

  /* ====================== Что входит ====================== */
  function renderIncluded() {
    var no = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>';
    $("#included").innerHTML = '<div class="container"><div class="section__head"><h2 id="included-h">Что входит в цену, а что оплачивается отдельно</h2><p>' + t("Чтобы на замере не было сюрпризов.") + "</p></div>" +
      '<div class="incl"><div class="panel incl__yes"><h3>Входит в цену за м²</h3><ul>' + C.included.map(function (i) { return "<li>" + ICON.check + "<span>" + t(i) + "</span></li>"; }).join("") + "</ul></div>" +
      '<div class="panel incl__no"><h3>Оплачивается отдельно</h3><ul>' + C.excluded.map(function (i) { return "<li>" + no + "<span>" + t(i) + "</span></li>"; }).join("") + "</ul></div></div>" +
      (C.cheapNote ? '<p class="cheap" style="margin-top:16px">' + t(C.cheapNote) + "</p>" : "") + "</div>";
  }

  /* ====================== Виды потолков ====================== */
  var typesAll = false;
  function renderTypes() {
    var list = typesAll ? P.constructions : P.constructions.filter(function (c) { return c.main; });
    var base = byId(P.textures, P.defaultRoom.texture).price;
    $("#types").innerHTML = '<div class="container"><div class="section__head"><h2 id="types-h">Какие бывают потолки</h2><p>' + t("Нажмите «Посчитать такой», и вид подставится в калькулятор.") + "</p></div>" +
      '<div class="types">' + list.map(function (c) {
        var demo = newRoom({ construction: c.id, extras: {} }); var per = Math.round(calcRoom(demo) / roomArea(demo) / 10) * 10;
        return '<article class="panel type"><img src="' + esc(c.img) + '" alt="' + esc(c.name) + ' натяжной потолок" loading="lazy" width="320" height="240"><div class="type__body"><h3 class="type__title">' + t(c.name) + '</h3><p class="type__desc">' + t(c.desc) + '</p><p class="type__price">от ' + rub(Math.max(per, base)) + "/м² под ключ</p></div>" +
          '<button type="button" class="btn btn--light btn--sm type__btn" data-type="' + c.id + '">Посчитать такой</button></article>';
      }).join("") + "</div>" +
      (typesAll ? "" : '<div class="more-row"><button type="button" class="btn btn--ghost" data-types-all>Показать все ' + P.constructions.length + " видов</button></div>") + "</div>";
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-types-all]")) { typesAll = true; renderTypes(); return; }
    var b = e.target.closest("[data-type]"); if (!b) return;
    active().construction = b.getAttribute("data-type"); compare = null; state.touched = true; save(); renderCalc(); scrollToEl($("#calc"));
    toast("«" + byId(P.constructions, active().construction).name + "» выбран в калькуляторе");
  });

  /* ====================== Галерея ====================== */
  var gFilter = { c: "all", r: "all" }, gAll = false, G_LIMIT = 6;
  function renderWorks() {
    var cs = [], rs = [];
    C.gallery.forEach(function (g) { if (cs.indexOf(g.construction) < 0) cs.push(g.construction); if (rs.indexOf(g.room) < 0) rs.push(g.room); });
    var items = C.gallery.filter(function (g) { return (gFilter.c === "all" || g.construction === gFilter.c) && (gFilter.r === "all" || g.room === gFilter.r); });
    var limitOn = matchMedia("(min-width: 768px)").matches && !gAll; var hiddenCount = !limitOn ? 0 : Math.max(0, items.length - G_LIMIT); if (limitOn) items = items.slice(0, G_LIMIT);
    function chip(kind, id, label) { return '<button type="button" class="chip" data-gf="' + kind + '" data-val="' + id + '" aria-pressed="' + (gFilter[kind] === id) + '">' + esc(label) + "</button>"; }
    $("#works").innerHTML = '<div class="container"><div class="section__head"><h2 id="works-h">Наши работы с ценами</h2><p>' + t("Реальная площадь и итоговая стоимость каждого объекта. Понравился вариант - нажмите «Хочу так же».") + "</p></div>" +
      '<div class="filters"><span class="field__label">Вид потолка</span><div class="chips chips--scroll" role="group" aria-label="Фильтр по виду">' + chip("c", "all", "Все") + cs.map(function (id) { return chip("c", id, byId(P.constructions, id).name); }).join("") + "</div>" +
      '<span class="field__label">Помещение</span><div class="chips chips--scroll" role="group" aria-label="Фильтр по помещению">' + chip("r", "all", "Все") + rs.map(function (id) { return chip("r", id, byId(P.rooms, id).name); }).join("") + "</div></div>" +
      '<div class="works">' + (items.length ? items.map(function (g) {
        var i = C.gallery.indexOf(g);
        var meta = byId(P.rooms, g.room).name + " · " + fmtNum(g.area) + NB + "м² · " + byId(P.textures, g.texture).name.toLowerCase() + ", " + byId(P.constructions, g.construction).name.toLowerCase();
        return '<article class="panel work"><button type="button" class="work__img" data-zoom="' + i + '" aria-label="Открыть фото: ' + esc(g.title) + '"><img src="' + esc(g.img) + '-600.webp" srcset="' + esc(g.img) + "-600.webp 600w, " + esc(g.img) + '-1200.webp 1200w" sizes="(min-width:1024px) 380px, (min-width:768px) 50vw, 100vw" alt="' + esc(g.title + ", " + meta) + '" loading="lazy" width="600" height="450"></button>' +
          '<div class="work__body"><h3 class="work__title">' + t(g.title) + '</h3><p class="work__meta">' + esc(meta) + '</p><div class="work__foot"><span class="work__price">' + rub(g.price) + '</span><button type="button" class="btn btn--light btn--sm" data-same="' + i + '">Хочу так же</button></div></div></article>';
      }).join("") : '<p class="empty">Таких работ пока нет в галерее. Сбросьте фильтр.</p>') + "</div>" +
      (hiddenCount ? '<div class="more-row"><button type="button" class="btn btn--ghost" data-g-all>Показать ещё ' + hiddenCount + " " + plural(hiddenCount, "работу", "работы", "работ") + "</button></div>" : "") + "</div>";
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-g-all]")) { gAll = true; renderWorks(); return; }
    var b = e.target.closest("[data-gf]");
    if (b) { gFilter[b.getAttribute("data-gf")] = b.getAttribute("data-val"); renderWorks(); var nb = $('[data-gf="' + b.getAttribute("data-gf") + '"][data-val="' + b.getAttribute("data-val") + '"]'); if (nb) nb.focus(); return; }
    b = e.target.closest("[data-zoom]");
    if (b) {
      var g = C.gallery[+b.getAttribute("data-zoom")], d = $("#lightbox");
      $("img", d).src = g.img + "-1200.webp"; $("img", d).alt = g.title;
      $(".lightbox__cap", d).textContent = g.title + " · " + fmtNum(g.area) + " м² · " + rub(g.price).replace(/ /g, " ");
      if (d.showModal) d.showModal(); else window.open(g.img + "-1200.webp");
      return;
    }
    b = e.target.closest("[data-same]");
    if (b) {
      var w = C.gallery[+b.getAttribute("data-same")];
      var r = newRoom({ type: w.room, sizeMode: "area", area: w.area, texture: w.texture, construction: w.construction, extras: w.extras || {} });
      if (!state.touched && state.rooms.length === 1) state.rooms[0] = r; else state.rooms.push(r);
      state.active = state.rooms.indexOf(r); state.touched = true; compare = null; save(); renderCalc(); scrollToEl($("#calc"));
      toast("Параметры перенесены в калькулятор");
    }
  });
  $("#lightbox").addEventListener("click", function (e) { if (e.target === this) this.close(); });

  /* ====================== Фото для расчёта ====================== */
  function renderPhotoCta() {
    var text = "Здравствуйте! Хочу узнать цену натяжного потолка. Отправляю фото комнаты. Размеры: ";
    $("#photo-calc").innerHTML = '<div class="container"><div class="photo-cta"><div><h2>' + t("Не хотите ждать замерщика?") + "</h2><p>" + t("Пришлите фото комнаты и примерные размеры. Ответим ценой в течение часа, без выезда.") + "</p></div>" +
      '<div class="photo-cta__btns">' + enabledMessengers().map(function (k) {
        return '<a class="btn" href="' + esc(msgLink(k, text)) + '" target="_blank" rel="noopener" data-copy="' + esc(k === "whatsapp" ? "" : text) + '">' + bi(k, "mi--lg") + "Отправить в " + BRAND[k].name + "</a>";
      }).join("") + "</div></div></div>";
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-copy]"); if (!a) return;
    var txt = a.getAttribute("data-copy"); if (txt) { copyText(txt); toast("Текст скопирован, вставьте его в чат"); }
  });

  /* ====================== Как работаем, отзывы, гарантия, FAQ ====================== */
  function renderSteps() {
    $("#steps").innerHTML = '<div class="container"><div class="section__head"><h2 id="steps-h">Как мы работаем</h2></div><ol class="steps">' +
      C.steps.map(function (s) { return "<li><h3>" + t(s.title) + '</h3><span class="steps__time">' + t(s.time) + "</span><p>" + t(s.text) + "</p></li>"; }).join("") + "</ol></div>";
  }
  var SITE_COLORS = { "2gis": "#1BA136", yandex: "#FC3F1D", avito: "#00AAFF" };
  var SITE_ABBR = { "2gis": "2ГИС", yandex: "Я", avito: "A" };
  function stars(n) { var s = ""; for (var i = 0; i < 5; i++) s += i < Math.round(n) ? ICON.star : ""; return s; }
  function renderReviews() {
    $("#reviews").innerHTML = '<div class="container"><div class="section__head"><h2 id="reviews-h">Отзывы, которые можно проверить</h2><p>' + t("Все отзывы ведут на оригинал в 2ГИС, Яндекс Картах и Авито.") + "</p></div>" +
      '<div class="rsites">' + C.reviewSites.map(function (s) {
        return '<a class="panel rsite" href="' + esc(s.url) + '" target="_blank" rel="noopener"><span class="rsite__logo" style="background:' + (SITE_COLORS[s.id] || "#555") + '">' + esc(SITE_ABBR[s.id] || s.name[0]) + '</span><span><span class="rsite__name">' + esc(s.name) + '</span><br><span class="rsite__meta">' + num(s.count) + " " + plural(s.count, "отзыв", "отзыва", "отзывов") + '</span></span><span class="rsite__rating">' + ICON.star + String(s.rating).replace(".", ",") + "</span></a>";
      }).join("") + "</div>" +
      '<div class="reviews">' + C.reviews.map(function (rv) {
        var site = byId(C.reviewSites, rv.source);
        return '<article class="panel review"><div class="review__head"><span><span class="review__name">' + esc(rv.name) + '</span><br><span class="review__date">' + esc(rv.date) + '</span></span><span class="review__stars" aria-label="Оценка 5 из 5">' + stars(5) + "</span></div><p>" + t(rv.text) + '</p><a href="' + esc(rv.url) + '" target="_blank" rel="noopener">Отзыв на ' + esc(site.name) + " →</a></article>";
      }).join("") + "</div></div>";
  }
  function renderGuarantee() {
    $("#guarantee").innerHTML = '<div class="container"><div class="section__head"><h2 id="guarantee-h">Гарантия и материалы</h2></div><div class="guar">' +
      C.guarantee.map(function (g) { return '<div class="panel guar__item"><h3>' + t(g.title) + "</h3><p>" + t(g.text) + "</p></div>"; }).join("") + "</div>" +
      '<h3 style="margin-top:28px">Работаем с полотнами и профилями</h3><div class="brands">' + C.brands.map(function (b) { return '<span class="brand">' + esc(b) + "</span>"; }).join("") + "</div>" +
      (C.contractUrl ? '<p style="margin-top:20px"><a class="btn btn--light" href="' + esc(C.contractUrl) + '" target="_blank" rel="noopener">Посмотреть образец договора</a></p>' : "") + "</div>";
  }
  function renderFaq() {
    $("#faq").innerHTML = '<div class="container"><div class="section__head"><h2 id="faq-h">Частые вопросы</h2></div><div class="faq">' +
      C.faq.map(function (f) { return "<details><summary>" + t(f.q) + "</summary><p>" + t(f.a) + "</p></details>"; }).join("") + "</div></div>";
  }

  /* ====================== Запись на замер ====================== */
  var FORM_KEY = "pp-form-v1";
  var form = store(FORM_KEY) || {};
  form.day = form.day || null; form.slot = form.slot || null;
  form.channel = form.channel || enabledMessengers()[0] || "call";
  var lastLink = "", lastText = "";

  function companyHour() {
    try { return +new Intl.DateTimeFormat("ru-RU", { hour: "numeric", hourCycle: "h23", timeZone: C.company.timezone }).format(new Date()); }
    catch (e) { return new Date().getHours(); }
  }
  // «Сегодня» считаем по часовому поясу компании, а не посетителя
  function companyToday() {
    try {
      var p = {}; new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: C.company.timezone }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      return new Date(+p.year, +p.month - 1, +p.day, 12);
    } catch (e) { var n = new Date(); n.setHours(12, 0, 0, 0); return n; }
  }
  function slotPast(s) { return form.day === "today" && s.startHour <= companyHour(); }
  function syncSlots() {
    $$("#booking [data-slot]").forEach(function (x) {
      var past = slotPast(byId(C.booking.slots, x.getAttribute("data-slot")));
      x.disabled = past; if (past && form.slot === x.getAttribute("data-slot")) { form.slot = null; x.setAttribute("aria-pressed", "false"); }
    });
  }
  function dayInfo(offset) {
    var d = companyToday(); d.setDate(d.getDate() + offset);
    return { date: d, label: d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) };
  }
  function todayAllowed() { return C.booking.allowToday && companyHour() < C.booking.todayUntilHour; }
  function dayLabel() {
    if (form.day === "today") return "сегодня, " + dayInfo(0).label;
    if (form.day === "tomorrow") return "завтра, " + dayInfo(1).label;
    if (form.day === "date" && form.date) return new Date(form.date + "T12:00").toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
    return "";
  }
  function channelName(id) { return id === "call" ? "позвонить" : BRAND[id].name; }

  function renderBooking() {
    var b = C.booking, co = C.company;
    if (form.day === "today" && !todayAllowed()) form.day = null;
    var ch = enabledMessengers().concat(M.call && M.call.enabled ? ["call"] : []);
    $("#booking").innerHTML = '<div class="container"><div class="section__head"><h2 id="booking-h">Запись на замер</h2><p>' + t("Замерщик приедет в удобное время, всё посчитает на месте и оставит договор с точной ценой. Решать сразу не нужно.") + "</p></div>" +
      '<div class="booking"><div id="form-wrap"><form class="panel form" id="lead-form" novalidate>' + measureHTML() +
      '<div id="attached"></div>' +
      '<div class="form__row"><div class="field"><label for="f-name">Как вас зовут</label><input id="f-name" name="name" class="input" autocomplete="given-name" value="' + esc(form.name || "") + '" aria-describedby="e-name"><span class="field__error" id="e-name" hidden></span></div>' +
      '<div class="field"><label for="f-tel">Телефон</label><input id="f-tel" name="tel" class="input" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 (900) 000-00-00" value="' + esc(form.tel || "") + '" aria-describedby="e-tel"><span class="field__error" id="e-tel" hidden></span></div></div>' +
      '<div class="field"><label for="f-addr">Адрес или район</label><input id="f-addr" name="addr" class="input" autocomplete="street-address" placeholder="Например, 202 мкр., д. 5" value="' + esc(form.addr || "") + '" aria-describedby="e-addr"><span class="field__error" id="e-addr" hidden></span></div>' +
      '<div class="field" role="group" aria-labelledby="l-day"><span class="field__label" id="l-day">Когда удобно</span><div class="chips" style="margin-top:2px">' +
      (todayAllowed() ? '<button type="button" class="chip" data-day="today" aria-pressed="' + (form.day === "today") + '">Сегодня</button>' : "") +
      '<button type="button" class="chip" data-day="tomorrow" aria-pressed="' + (form.day === "tomorrow") + '">Завтра, ' + dayInfo(1).label + "</button>" +
      '<button type="button" class="chip" data-day="date" aria-pressed="' + (form.day === "date") + '">Выбрать дату</button></div>' +
      '<div id="date-wrap"' + (form.day === "date" ? "" : " hidden") + ' style="margin-top:10px"><label class="visually-hidden" for="f-date">Дата замера</label><input id="f-date" class="input" type="date" style="max-width:240px" value="' + esc(form.date || "") + '" min="' + isoDate(dayInfo(0).date) + '"></div>' +
      '<div class="chips">' + b.slots.map(function (s) { return '<button type="button" class="chip" data-slot="' + s.id + '" aria-pressed="' + (form.slot === s.id && !slotPast(s)) + '"' + (slotPast(s) ? " disabled" : "") + ">" + esc(s.label) + ", " + esc(s.time) + "</button>"; }).join("") + "</div>" +
      '<span class="field__error" id="e-day" hidden></span></div>' +
      '<div class="field" role="group" aria-labelledby="l-ch"><span class="field__label" id="l-ch">Как с вами связаться</span><div class="channels">' +
      ch.map(function (k) { return '<button type="button" class="channel" data-ch="' + k + '" aria-pressed="' + (form.channel === k) + '">' + (k === "call" ? ICON.phone.replace("<svg", '<svg width="20" height="20"') + "Позвоните мне" : bi(k) + BRAND[k].name) + "</button>"; }).join("") + "</div></div>" +
      '<div class="field"><label for="f-comment">Комментарий <span class="field__opt">(необязательно)</span></label><textarea id="f-comment" class="input" rows="2" placeholder="Например, нужен потолок в двух комнатах, есть кухонный гарнитур до потолка">' + esc(form.comment || "") + "</textarea></div>" +
      '<label class="consent"><input type="checkbox" id="f-consent"' + (form.consent ? " checked" : "") + ' aria-describedby="e-consent"><span>' + t("Согласен на обработку персональных данных по") + ' <a href="' + esc(b.privacyUrl) + '">политике конфиденциальности</a></span></label><span class="field__error" id="e-consent" hidden style="margin-top:-12px"></span>' +
      '<button class="btn btn--primary btn--block" type="submit">Записаться на замер</button>' +
      '<p class="small muted" style="margin-top:-8px">' + t(replyText()) + "</p></form></div>" +
      '<div class="aside"><div class="panel"><h3>Что будет дальше</h3><ol class="next-steps">' +
      C.steps.slice(0).map(function (s) { return "<li><span><b>" + t(s.title) + "</b>" + t(s.time.charAt(0).toUpperCase() + s.time.slice(1)) + "</span></li>"; }).join("") + "</ol></div>" +
      '<div class="panel contact-card"><h3>Или свяжитесь сами</h3><a class="contact-card__phone" href="tel:' + esc(co.phoneRaw) + '">' + esc(co.phone).replace(/ /g, NB) + '</a><span class="muted small">' + t(co.hoursText) + '</span><div class="msg-btns">' +
      enabledMessengers().map(function (k) { return '<a class="btn btn--light msg-btn" href="' + esc(msgLink(k)) + '" target="_blank" rel="noopener">' + bi(k, "mi--lg") + "Написать в " + BRAND[k].name + "</a>"; }).join("") + "</div></div></div></div></div>";
    renderAttached();
  }
  function isoDate(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function replyText() {
    var h = companyHour(), w = C.company.workHours;
    return h >= w.from && h < w.to - 1 ? "Ответим в течение " + C.booking.replyMinutes + " минут" : "Сейчас мы не работаем, ответим утром после " + w.from + ":00";
  }
  function renderAttached() {
    var box = $("#attached"); if (!box) return;
    if (!state.touched || !state.attach) { box.innerHTML = ""; return; }
    var T = totals();
    box.innerHTML = '<div class="attached"><span><b>Расчёт прикреплён: от' + NB + rub(T.from) + "</b>" + esc(state.rooms.map(function (r) { return roomName(r) + " " + fmtNum(roomArea(r)) + NB + "м²"; }).join(", ")) + '</span><button type="button" class="link-btn" data-detach>Убрать</button></div>';
  }
  function saveForm() { store(FORM_KEY, { name: form.name, tel: form.tel, addr: form.addr, comment: form.comment, channel: form.channel, consent: form.consent }); }

  // Телефон: маска +7 (XXX) XXX-XX-XX
  function phoneDigits(v) {
    var d = String(v).replace(/\D/g, "");
    if (d.charAt(0) === "8") d = "7" + d.slice(1);
    else if (d.charAt(0) === "9" || d.charAt(0) === "3" || d.charAt(0) === "4") d = "7" + d;
    return d.slice(0, 11);
  }
  function phoneFormat(d) {
    if (!d) return "";
    var s = "+7"; var r = d.slice(1);
    if (r.length) s += " (" + r.slice(0, 3);
    if (r.length >= 3) s += ")";
    if (r.length > 3) s += " " + r.slice(3, 6);
    if (r.length > 6) s += "-" + r.slice(6, 8);
    if (r.length > 8) s += "-" + r.slice(8, 10);
    return s;
  }
  function phoneError(v) {
    var d = phoneDigits(v);
    if (!d) return "Укажите телефон, по нему подтвердим время замера";
    if (d.length < 11) { var n = 11 - d.length; return "Не хватает " + n + " " + plural(n, "цифры", "цифр", "цифр"); }
    if (!/^7[3489]/.test(d)) return "Проверьте номер: российский номер начинается с +7 9.., +7 3.., +7 4.. или +7 8..";
    return "";
  }
  function setError(id, msg) {
    var e = $("#e-" + id), input = $("#f-" + id);
    if (e) { e.textContent = msg; e.hidden = !msg; }
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  function validate() {
    var ok = true, first = null;
    function check(id, msg) { if (!setError(id, msg)) { ok = false; first = first || id; } }
    check("name", (form.name || "").trim().length < 2 ? "Напишите, как к вам обращаться" : "");
    check("tel", phoneError(form.tel || ""));
    check("addr", (form.addr || "").trim().length < 3 ? "Укажите адрес или хотя бы район" : "");
    var dayMsg = !form.day ? "Выберите день замера" : form.day === "date" && !form.date ? "Выберите дату в календаре" : !form.slot ? "Выберите удобное время" : "";
    check("day", dayMsg);
    check("consent", form.consent ? "" : "Нужно согласие, иначе мы не сможем принять заявку");
    if (first) { var el = first === "day" ? $("[data-day]") : $("#f-" + first); if (el) { el.focus(); el.scrollIntoView({ block: "center" }); } }
    return ok;
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("#booking [data-day]");
    if (b) {
      form.day = b.getAttribute("data-day"); $$("#booking [data-day]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $("#date-wrap").hidden = form.day !== "date"; if (form.day === "date") $("#f-date").focus(); syncSlots(); setError("day", ""); return;
    }
    b = e.target.closest("#booking [data-slot]");
    if (b) { form.slot = b.getAttribute("data-slot"); $$("#booking [data-slot]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); if (form.day) setError("day", ""); return; }
    b = e.target.closest("#booking [data-ch]");
    if (b) { form.channel = b.getAttribute("data-ch"); $$("#booking [data-ch]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); saveForm(); return; }
    if (e.target.closest("[data-detach]")) { state.attach = false; save(); renderAttached(); return; }
  });
  document.addEventListener("input", function (e) {
    var el = e.target; if (!el.closest || !el.closest("#lead-form")) return;
    if (el.id === "f-tel") {
      var d = phoneDigits(el.value), f = phoneFormat(d);
      // при стирании не мешаем удалять скобки и дефисы
      if (!(e.inputType && e.inputType.indexOf("delete") === 0)) el.value = f;
      form.tel = el.value;
      if ($("#e-tel").textContent && !phoneError(el.value)) setError("tel", "");
    }
    else if (el.id === "f-name") { form.name = el.value; if ($("#e-name").textContent) setError("name", ""); }
    else if (el.id === "f-addr") { form.addr = el.value; if ($("#e-addr").textContent) setError("addr", ""); }
    else if (el.id === "f-comment") form.comment = el.value;
    else if (el.id === "f-date") { form.date = el.value; setError("day", ""); }
    saveForm();
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "f-consent") { form.consent = e.target.checked; if (form.consent) setError("consent", ""); saveForm(); }
    if (e.target.id === "f-date") form.date = e.target.value;
  });
  document.addEventListener("focusout", function (e) {
    if (e.target.id === "f-tel" && e.target.value) setError("tel", phoneError(e.target.value));
  });

  function buildText() {
    var slot = byId(C.booking.slots, form.slot), T = totals();
    var lines = ["Заявка на замер с сайта", "", "Имя: " + form.name.trim(), "Телефон: " + phoneFormat(phoneDigits(form.tel)), "Адрес: " + form.addr.trim(),
      "Когда: " + dayLabel() + ", " + slot.label.toLowerCase() + " (" + slot.time + ")", "Связаться: " + channelName(form.channel)];
    if (state.touched && state.attach) {
      lines.push("", "Расчёт с сайта:");
      state.rooms.forEach(function (r, i) {
        lines.push((i + 1) + ") " + roomName(r) + ", " + fmtNum(roomArea(r)) + " м²" + (r.sizeMode === "dims" ? " (" + fmtNum(r.len) + " × " + fmtNum(r.wid) + " м)" : "") + ": " + roomSummary(r).replace(/ /g, " ") + " - от " + rub(roundUp(calcRoom(r))).replace(/ /g, " "));
        var cl = P.clarify.filter(function (q) { return r.clarify[q.id]; }).map(function (q) { return q.name.toLowerCase(); });
        if (cl.length) lines.push("   уточнения: " + cl.join(", "));
      });
      lines.push("Итого: от " + rub(T.from).replace(/ /g, " ") + (P.priceMode === "range" ? " (обычно до " + rub(T.to).replace(/ /g, " ") + ")" : ""));
    }
    if (form.comment && form.comment.trim()) lines.push("", "Комментарий: " + form.comment.trim());
    return lines.join("\n");
  }

  /* Отправка заявки.
     Сейчас: готовое сообщение в мессенджере (без сервера).
     Позже: укажите C.leads.endpoint - адрес серверной функции, которая принимает JSON
     { text, name, phone, address, day, slot, channel, rooms, total } и пересылает в Telegram-бота.
     Токен бота хранится только на сервере. */
  function sendViaEndpoint(payload) {
    return fetch(C.leads.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return true; });
  }

  document.addEventListener("submit", function (e) {
    if (e.target.id !== "lead-form") return;
    e.preventDefault();
    if (!validate()) return;
    var text = buildText(); lastText = text;
    var payload = { text: text, name: form.name.trim(), phone: phoneDigits(form.tel), address: form.addr.trim(), day: dayLabel(), slot: form.slot, channel: form.channel,
      rooms: state.touched && state.attach ? state.rooms : [], total: state.touched && state.attach ? totals() : null };
    goal("lead");
    if (C.leads.endpoint) {
      var btn = $('#lead-form [type="submit"]'); btn.disabled = true; btn.textContent = "Отправляем…";
      sendViaEndpoint(payload).then(function () { showDone("server"); }).catch(function () {
        btn.disabled = false; btn.textContent = "Записаться на замер";
        openMessenger(text, true); showDone("messenger");
      });
      return;
    }
    openMessenger(text); showDone("messenger");
  });
  function openMessenger(text, noRedirect) {
    var ch = form.channel === "call" ? C.leads.deliverTo : form.channel;
    if (!M[ch] || !M[ch].enabled) ch = enabledMessengers()[0];
    lastLink = msgLink(ch, text);
    if (ch !== "whatsapp") copyText(text);
    // без "noopener" в параметрах: с ним window.open всегда возвращает null
    var w = window.open(lastLink, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} }
    else if (ch === "whatsapp" && !noRedirect) location.href = lastLink;
    openMessenger.ch = ch;
  }
  function showDone(via) {
    var slot = byId(C.booking.slots, form.slot), ch = openMessenger.ch;
    var how = form.channel === "call" ? "Перезвоним" : "Напишем вам в " + BRAND[form.channel].name;
    var when = replyText().indexOf("утром") > -1 ? "утром" : "в течение " + C.booking.replyMinutes + " минут";
    $("#form-wrap").innerHTML = '<div class="panel done" tabindex="-1" id="done"><div class="done__icon">' + ICON.check + "</div>" +
      "<h3>" + t((via === "server" ? "Заявка принята, " : "Почти готово, ") + form.name.trim()) + "</h3>" +
      (via === "messenger" ? '<p class="done__lead">' + t("Мы открыли чат " + BRAND[ch].name + " с готовым сообщением. Нажмите «Отправить» в мессенджере, и заявка у нас.") + "</p>" +
        '<div class="done__hint">' + t(ch === "whatsapp" ? "Если чат не открылся, нажмите кнопку ниже." : "Текст заявки уже скопирован: если он не подставился в чат, просто вставьте его и отправьте.") + "</div>" : "") +
      '<p class="done__lead">' + t(how + " " + when + " и подтвердим замер: " + dayLabel() + ", " + slot.label.toLowerCase() + " (" + slot.time + ").") + "</p>" +
      '<p style="margin-top:18px;font-weight:600">Что подготовить к замеру</p><ul class="done__list">' + C.booking.prepare.map(function (p) { return "<li>" + t(p) + "</li>"; }).join("") + "</ul>" +
      '<div class="done__actions">' + (via === "messenger" ? '<a class="btn btn--primary" href="' + esc(lastLink) + '" target="_blank" rel="noopener">Открыть ' + BRAND[ch].name + " ещё раз</a>" : "") +
      '<button type="button" class="btn btn--light" data-ics>Добавить замер в календарь</button><button type="button" class="btn btn--light" data-copy-lead>Скопировать текст заявки</button></div></div>';
    var d = $("#done"); d.focus({ preventScroll: true }); scrollToEl($("#booking"));
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-copy-lead]")) { copyText(lastText); toast("Текст заявки скопирован"); }
    if (e.target.closest("[data-ics]")) downloadIcs();
  });
  function downloadIcs() {
    var slot = byId(C.booking.slots, form.slot);
    var d = form.day === "today" ? dayInfo(0).date : form.day === "tomorrow" ? dayInfo(1).date : new Date(form.date + "T12:00");
    var ymd = isoDate(d).replace(/-/g, ""), h = String(slot.startHour).padStart(2, "0"), h2 = String(slot.startHour + 1).padStart(2, "0");
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//potolki//RU", "BEGIN:VEVENT", "UID:" + uid() + "@potolki", "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + ymd + "T" + h + "0000", "DTEND:" + ymd + "T" + h2 + "0000",
      "SUMMARY:Замер натяжного потолка - " + C.company.name, "DESCRIPTION:Замерщик приедет в интервале " + slot.time + ". Телефон: " + C.company.phone,
      "LOCATION:" + (form.addr || "").replace(/([\\,;])/g, "\\$1"), "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Скоро замер", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "zamer.ics";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ====================== Подвал ====================== */
  function renderFooter() {
    var co = C.company, s = C.socials;
    var soc = enabledMessengers().map(function (k) { return '<a class="social" href="' + esc(msgLink(k)) + '" target="_blank" rel="noopener" aria-label="' + BRAND[k].name + '">' + bi(k) + "</a>"; });
    if (s.vk) soc.push('<a class="social" href="' + esc(s.vk) + '" target="_blank" rel="noopener" aria-label="ВКонтакте">' + bi("vk") + "</a>");
    if (s.telegramChannel) soc.push('<a class="social" href="' + esc(s.telegramChannel) + '" target="_blank" rel="noopener" aria-label="Telegram-канал">' + bi("telegram") + "</a>");
    if (s.instagram) soc.push('<a class="social" href="' + esc(s.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + bi("instagram") + "</a>");
    var mapQ = encodeURIComponent(co.address);
    $("#footer").innerHTML = '<div class="container"><div class="footer__grid"><div>' + logoHTML() + '<p style="margin-top:14px;max-width:30em">' + t("Натяжные потолки " + co.cityIn + " под ключ. Замер бесплатно, монтаж за 1 день, гарантия в договоре.") + "</p></div>" +
      '<div><h3>Контакты</h3><ul class="footer__list"><li><a class="footer__phone" href="tel:' + esc(co.phoneRaw) + '">' + esc(co.phone).replace(/ /g, NB) + "</a></li><li>" + t(co.hoursText) + "</li><li>" + t(co.address) + "</li>" +
      '<li><a href="https://2gis.ru/search/' + mapQ + '" target="_blank" rel="noopener">Открыть в 2ГИС</a> · <a href="https://yandex.ru/maps/?text=' + mapQ + '" target="_blank" rel="noopener">в Яндекс Картах</a></li></ul></div>' +
      '<div><h3>Мы на связи</h3><div class="socials">' + soc.join("") + "</div></div></div>" +
      '<div class="footer__bottom"><span>© ' + new Date().getFullYear() + " " + esc(co.name) + ". " + esc(co.legal) + '</span><span><a href="' + esc(C.booking.privacyUrl) + '">Политика обработки персональных данных</a></span>' +
      '<span>' + t("Цены на сайте носят информационный характер и не являются публичной офертой. Точная стоимость фиксируется в договоре после замера.") + "</span>" +
      (co.demoNotice ? "<span>" + t("Демо-сайт: цены, отзывы и контакты условные. Фото: Unsplash.") + "</span>" : "") + "</div></div>";
  }

  /* ====================== Плавающая панель (телефон) ====================== */
  var bar = $("#sticky-bar");
  var barState = { heroVisible: true, bookingVisible: false, typing: false };
  function updateStickyBar() {
    if (!bar) return;
    var T = totals();
    bar.innerHTML = state.touched
      ? '<span class="sticky-bar__price">Ваш расчёт<b>от ' + rub(T.from) + '</b></span><a class="btn btn--primary" href="#booking" data-act-bar="book">Записаться</a>'
      : '<a class="btn btn--light" href="#calc">Рассчитать</a><a class="btn btn--primary" href="#booking">Записаться на замер</a>';
    bar.classList.toggle("is-hidden", barState.heroVisible || barState.bookingVisible || barState.typing);
  }
  function initStickyBar() {
    bar.hidden = false; document.body.classList.add("has-bar");
    if (!("IntersectionObserver" in window)) { barState.heroVisible = false; updateStickyBar(); return; }
    new IntersectionObserver(function (en) { barState.heroVisible = en[0].isIntersecting; updateStickyBar(); }, { rootMargin: "-40% 0px 0px 0px" }).observe($(".hero__cta"));
    new IntersectionObserver(function (en) { barState.bookingVisible = en[0].isIntersecting; updateStickyBar(); }, { threshold: 0.05 }).observe($("#booking"));
    document.addEventListener("focusin", function (e) { if (e.target.matches("input:not([type=checkbox]):not([type=range]), textarea, select")) { barState.typing = true; updateStickyBar(); } });
    document.addEventListener("focusout", function () { barState.typing = false; setTimeout(updateStickyBar, 50); });
    bar.addEventListener("click", function (e) { if (e.target.closest("[data-act-bar]")) { state.attach = true; save(); renderAttached(); } });
  }

  /* ====================== SEO-микроразметка и Метрика ====================== */
  function injectSchema() {
    var co = C.company;
    var data = { "@context": "https://schema.org", "@type": "HomeAndConstructionBusiness", name: co.name, telephone: co.phoneRaw, url: co.siteUrl,
      image: co.siteUrl + "img/og.jpg", address: { "@type": "PostalAddress", addressLocality: co.city, streetAddress: co.address, addressCountry: "RU" },
      openingHours: "Mo-Su " + String(co.workHours.from).padStart(2, "0") + ":00-" + co.workHours.to + ":00", priceRange: "от " + byId(P.textures, "matte").price + " ₽/м²", areaServed: co.city,
      sameAs: C.reviewSites.map(function (s) { return s.url; }).concat([C.socials.vk].filter(Boolean)) };
    var best = C.reviewSites[0]; if (best) data.aggregateRating = { "@type": "AggregateRating", ratingValue: best.rating, reviewCount: best.count };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(data); document.head.appendChild(s);
    if (C.metrikaId) {
      (function (m, e, tg, r, i, k, a) { m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); }; m[i].l = 1 * new Date(); k = e.createElement(tg); a = e.getElementsByTagName(tg)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a); })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      window.ym(C.metrikaId, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    }
  }

  /* ====================== Запуск ====================== */
  renderHeader(); renderHero(); renderPresets(); renderCalc(); renderIncluded(); renderTypes(); renderWorks();
  renderPhotoCta(); renderSteps(); renderReviews(); renderGuarantee(); renderFaq(); renderBooking(); renderFooter();
  initStickyBar(); updateStickyBar(); injectSchema();
  // Перерисовать калькулятор при переходе через границу ПК/телефон (группы открыты на ПК)
  var wasDesktop = isDesktop();
  window.addEventListener("resize", function () { var d = isDesktop(); if (d !== wasDesktop) { wasDesktop = d; renderCalc(); } });
  if (location.hash) { var target = $(location.hash); if (target) { setTimeout(function () { target.scrollIntoView(); }, 50); window.addEventListener("load", function () { target.scrollIntoView(); }); } }
})();
