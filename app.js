// app.js — 機票一鍵搜尋啟動台 核心邏輯
// 流程：讀表單 → 轉換代碼/日期 → 各平台組網址 → 渲染連結網格

// ─────────────────────────────────────────────
// 日期格式工具（輸入皆為 "YYYY-MM-DD" 字串）
// ─────────────────────────────────────────────
function fmtYYYYMMDD(d) { return d; }                 // Trip.com / Google
function fmtYYMMDD(d) { return d.replace(/-/g, "").slice(2); } // Skyscanner 260810
function fmtMMDDYYYY(d) {                              // Expedia 08/10/2026
  const [y, m, dd] = d.split("-");
  return `${m}/${dd}/${y}`;
}
function cabinSky(c) {
  // Skyscanner cabinclass: economy / premiumeconomy / business / first
  return c;
}
function cabinTrip(c) {
  // Trip.com class: y(經濟) s(豪經) c(商務) f(頭等)
  return { economy: "y", premiumeconomy: "s", business: "c", first: "f" }[c] || "y";
}

// ─────────────────────────────────────────────
// 平台網址產生器
// 每段 leg = { from: IATA, to: IATA, date: "YYYY-MM-DD" }
// mode = "oneway" | "round" | "multi"
// ─────────────────────────────────────────────
function buildLinks(legs, mode, adults, children, cabin) {
  const links = [];
  const a = Math.max(1, adults | 0);
  const first = legs[0];
  const last = legs[legs.length - 1];

  // 1) Skyscanner（Tier A：單程/來回可帶入；多點退首頁）
  {
    const f = first.from.toLowerCase();
    const t = first.to.toLowerCase();
    let url, tier;
    if (mode === "oneway") {
      url = `https://www.skyscanner.com.tw/transport/flights/${f}/${t}/${fmtYYMMDD(first.date)}/?adultsv2=${a}&cabinclass=${cabinSky(cabin)}`;
      tier = "full";
    } else if (mode === "round") {
      url = `https://www.skyscanner.com.tw/transport/flights/${f}/${t}/${fmtYYMMDD(first.date)}/${fmtYYMMDD(legs[1].date)}/?adultsv2=${a}&cabinclass=${cabinSky(cabin)}`;
      tier = "full";
    } else {
      url = `https://www.skyscanner.com.tw/transport/flights-multi-city/`;
      tier = "home";
    }
    links.push({ name: "Skyscanner", url, tier, alert: true });
  }

  // 2) Trip.com 攜程台灣（Tier A：單程/來回可帶入；多點退首頁）
  {
    const f = first.from.toLowerCase();
    const t = first.to.toLowerCase();
    const cls = cabinTrip(cabin);
    let url, tier;
    if (mode === "oneway") {
      url = `https://tw.trip.com/flights/showfarefirst?dcity=${f}&acity=${t}&ddate=${first.date}&triptype=ow&class=${cls}&quantity=${a}&locale=zh-TW&curr=TWD`;
      tier = "full";
    } else if (mode === "round") {
      url = `https://tw.trip.com/flights/showfarefirst?dcity=${f}&acity=${t}&ddate=${first.date}&rdate=${legs[1].date}&triptype=rt&class=${cls}&quantity=${a}&locale=zh-TW&curr=TWD`;
      tier = "full";
    } else {
      url = `https://tw.trip.com/flights/`;
      tier = "home";
    }
    links.push({ name: "Trip.com（攜程）", url, tier });
  }

  // 3) Google Flights（Tier A-：用 q= 自然語言；多點退首頁）
  {
    let url, tier;
    if (mode === "oneway") {
      const q = `Flights from ${first.from} to ${first.to} on ${first.date}`;
      url = `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
      tier = "full";
    } else if (mode === "round") {
      const q = `Flights from ${first.from} to ${first.to} on ${first.date} returning ${legs[1].date}`;
      url = `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
      tier = "full";
    } else {
      url = `https://www.google.com/travel/flights`;
      tier = "home";
    }
    links.push({ name: "Google Flights", url, tier, alert: true });
  }

  // 4) Expedia 台灣（Tier B+：leg 參數，格式易改版）
  {
    let url, tier = "full";
    const leg = (g) => `from:${g.from},to:${g.to},departure:${fmtMMDDYYYY(g.date)}TANYT`;
    const pax = `adults:${a}` + (children > 0 ? `,children:${children}` : "");
    if (mode === "oneway") {
      url = `https://www.expedia.com.tw/Flights-Search?trip=oneway&leg1=${encodeURIComponent(leg(first))}&passengers=${encodeURIComponent(pax)}&mode=search`;
    } else if (mode === "round") {
      const back = { from: first.to, to: first.from, date: legs[1].date };
      url = `https://www.expedia.com.tw/Flights-Search?trip=roundtrip&leg1=${encodeURIComponent(leg(first))}&leg2=${encodeURIComponent(leg(back))}&passengers=${encodeURIComponent(pax)}&mode=search`;
    } else {
      let q = `trip=multi`;
      legs.forEach((g, i) => { q += `&leg${i + 1}=${encodeURIComponent(leg(g))}`; });
      q += `&passengers=${encodeURIComponent(pax)}&mode=search`;
      url = `https://www.expedia.com.tw/Flights-Search?${q}`;
    }
    links.push({ name: "Expedia", url, tier });
  }

  // 5) 可樂旅遊（Tier B：開機票首頁，需手動再輸入）
  links.push({ name: "可樂旅遊", url: "https://flight.colatour.com.tw/", tier: "home" });

  // 6) 雄獅旅遊（Tier B：開機票首頁，需手動再輸入）
  links.push({ name: "雄獅旅遊", url: "https://www.liontravel.com/category/zh-tw/flight", tier: "home" });

  return links;
}

// ─────────────────────────────────────────────
// 表單讀取與驗證
// ─────────────────────────────────────────────
function getMode() {
  return document.querySelector('input[name="tripMode"]:checked').value;
}

function collectLegs(mode) {
  if (mode === "multi") {
    const segEls = document.querySelectorAll("#segments .segment");
    const legs = [];
    for (const el of segEls) {
      const from = toIata(el.querySelector(".seg-from").value);
      const to = toIata(el.querySelector(".seg-to").value);
      const date = el.querySelector(".seg-date").value;
      if (!from || !to || !date) return { error: "多點進出：每個航段都要填出發地、目的地、日期。" };
      legs.push({ from, to, date });
    }
    if (legs.length < 2) return { error: "多點進出至少需要 2 個航段。" };
    return { legs };
  }

  const from = toIata(document.getElementById("from").value);
  const to = toIata(document.getElementById("to").value);
  const date = document.getElementById("departDate").value;
  if (!from) return { error: "找不到出發地，請輸入城市名或機場代碼（如 TPE）。" };
  if (!to) return { error: "找不到目的地，請輸入城市名或機場代碼（如 NRT）。" };
  if (!date) return { error: "請選擇出發日期。" };

  if (mode === "round") {
    const rdate = document.getElementById("returnDate").value;
    if (!rdate) return { error: "來回行程請選擇回程日期。" };
    if (rdate < date) return { error: "回程日期不能早於出發日期。" };
    return { legs: [{ from, to, date }, { from: to, to: from, date: rdate }] };
  }
  return { legs: [{ from, to, date }] };
}

// ─────────────────────────────────────────────
// 渲染結果
// ─────────────────────────────────────────────
function tagHtml(tier) {
  return tier === "full"
    ? '<span class="tag full">已帶入條件</span>'
    : '<span class="tag home">開首頁·需手動輸入</span>';
}

let lastLinks = [];

function renderResults(links, legs, mode) {
  const grid = document.getElementById("linksGrid");
  const alertsGrid = document.getElementById("alertsGrid");
  grid.innerHTML = "";
  alertsGrid.innerHTML = "";
  lastLinks = links;

  links.forEach((l) => {
    const a = document.createElement("a");
    a.className = "plat-link";
    a.href = l.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML = `<span class="name">${l.name}</span>${tagHtml(l.tier)}`;
    grid.appendChild(a);

    if (l.alert) {
      const b = document.createElement("a");
      b.className = "plat-link";
      b.href = l.url;
      b.target = "_blank";
      b.rel = "noopener";
      b.innerHTML = `<span class="name">在 ${l.name} 設定提醒</span><span class="tag full">支援降價追蹤</span>`;
      alertsGrid.appendChild(b);
    }
  });

  const routeText = legs.map((g) => `${g.from}→${g.to}`).join("， ");
  const modeText = { oneway: "單程", round: "來回", multi: "多點進出" }[mode];
  document.getElementById("resultsSummary").textContent =
    `${modeText}：${routeText}　共 ${links.length} 個平台。點任一卡片在新分頁開啟。`;

  document.getElementById("results").hidden = false;
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────
// 多點航段 UI
// ─────────────────────────────────────────────
function segmentTemplate(idx) {
  const wrap = document.createElement("div");
  wrap.className = "segment";
  wrap.innerHTML = `
    <div class="seg-title">航段 ${idx + 1}</div>
    ${idx >= 2 ? '<button type="button" class="remove-seg">移除</button>' : ""}
    <div class="row">
      <div class="field">
        <label>出發地</label>
        <input type="text" class="seg-from" placeholder="台北 / TPE" />
        <div class="suggest"></div>
      </div>
      <div class="field">
        <label>目的地</label>
        <input type="text" class="seg-to" placeholder="東京 / NRT" />
        <div class="suggest"></div>
      </div>
      <div class="field">
        <label>日期</label>
        <input type="date" class="seg-date" />
      </div>
    </div>`;
  return wrap;
}

function refreshSegmentTitles() {
  document.querySelectorAll("#segments .segment").forEach((el, i) => {
    el.querySelector(".seg-title").textContent = `航段 ${i + 1}`;
  });
}

function addSegment() {
  const container = document.getElementById("segments");
  const seg = segmentTemplate(container.children.length);
  container.appendChild(seg);
  attachAutocomplete(seg.querySelector(".seg-from"), seg.querySelectorAll(".suggest")[0]);
  attachAutocomplete(seg.querySelector(".seg-to"), seg.querySelectorAll(".suggest")[1]);
  const rm = seg.querySelector(".remove-seg");
  if (rm) rm.addEventListener("click", () => { seg.remove(); refreshSegmentTitles(); });
}

// ─────────────────────────────────────────────
// Autocomplete
// ─────────────────────────────────────────────
function attachAutocomplete(input, box) {
  input.addEventListener("input", () => {
    const items = searchAirports(input.value);
    if (!items.length) { box.classList.remove("show"); box.innerHTML = ""; return; }
    box.innerHTML = items.map((a) =>
      `<div class="item" data-code="${a.iata}">
        <span><span class="code">${a.iata}</span> ${a.city}</span>
        <span class="meta">${a.cityEn}</span>
      </div>`).join("");
    box.classList.add("show");
    box.querySelectorAll(".item").forEach((it) => {
      it.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = `${it.dataset.code}`;
        box.classList.remove("show");
      });
    });
  });
  input.addEventListener("blur", () => setTimeout(() => box.classList.remove("show"), 150));
}

// ─────────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 行程模式切換
  document.querySelectorAll('input[name="tripMode"]').forEach((r) => {
    r.addEventListener("change", () => {
      document.querySelectorAll(".trip-modes .mode").forEach((m) => m.classList.remove("active"));
      r.closest(".mode").classList.add("active");
      const mode = getMode();
      document.getElementById("returnField").hidden = mode !== "round";
      document.getElementById("simpleFields").hidden = mode === "multi";
      document.getElementById("multiFields").hidden = mode !== "multi";
      if (mode === "multi" && document.getElementById("segments").children.length === 0) {
        addSegment(); addSegment();
      }
    });
  });

  // 對調出發/目的地
  document.getElementById("swapBtn").addEventListener("click", () => {
    const f = document.getElementById("from");
    const t = document.getElementById("to");
    [f.value, t.value] = [t.value, f.value];
  });

  // 新增航段
  document.getElementById("addSegBtn").addEventListener("click", () => {
    if (document.getElementById("segments").children.length >= 6) return;
    addSegment();
  });

  // autocomplete for simple fields
  attachAutocomplete(document.getElementById("from"), document.getElementById("suggest-from"));
  attachAutocomplete(document.getElementById("to"), document.getElementById("suggest-to"));

  // 送出
  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("errorMsg");
    err.hidden = true;
    const mode = getMode();
    const { legs, error } = collectLegs(mode);
    if (error) { err.textContent = error; err.hidden = false; return; }
    const adults = parseInt(document.getElementById("adults").value, 10) || 1;
    const children = parseInt(document.getElementById("children").value, 10) || 0;
    const cabin = document.getElementById("cabin").value;
    const links = buildLinks(legs, mode, adults, children, cabin);
    renderResults(links, legs, mode);
  });

  // 全部開啟（可能被彈窗封鎖）
  document.getElementById("openAllBtn").addEventListener("click", () => {
    if (!lastLinks.length) return;
    lastLinks.forEach((l) => window.open(l.url, "_blank", "noopener"));
  });
});
