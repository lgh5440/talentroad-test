(() => {
  "use strict";
  const data = window.PERSONA_CARD_DATA;
  if (!data || !data.byKey) return;

  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
  const jobHref = id => `https://lgh5440.github.io/calling-map/#/job/${encodeURIComponent(id)}`;
  const allJobsHref = "https://lgh5440.github.io/calling-map/#/jobs";
  const entries = Object.values(data.byKey).sort((a, b) => a.code.localeCompare(b.code, "en"));

  function jobsMarkup(persona) {
    return (persona.jobs || []).map(job => {
      if (!/^job-[a-f0-9]+$/.test(job.id || "")) return "";
      return `<a href="${jobHref(job.id)}" target="_blank" rel="noopener">${escapeHtml(job.name)}</a>`;
    }).join("");
  }

  function verseMarkup(persona) {
    const refs = [...new Set((persona.sources || []).map(source => source.ref).filter(Boolean))];
    return refs.map(ref => `<li>${escapeHtml(ref)}</li>`).join("");
  }

  function galleryMarkup() {
    return `<section id="persona-gallery" class="persona-gallery" aria-labelledby="persona-gallery-heading" hidden>
      <h3 id="persona-gallery-heading">성경 인물 카드 56장</h3>
      <p>카드를 눌러 승인된 인물 이야기와 관련 구절을 읽고, 연결된 직업을 살펴보세요.</p>
      <p><a href="${allJobsHref}" target="_blank" rel="noopener">소명지도 직업 모두 보기</a></p>
      <div class="persona-gallery-grid">${entries.map(persona => `<article class="persona-gallery-card" data-persona-key="${escapeHtml(persona.key)}">
        <button class="persona-gallery-card-open" type="button" data-open-persona-detail data-persona-key="${escapeHtml(persona.key)}" aria-label="${escapeHtml(persona.person)} 상세 보기">
          <img src="${escapeHtml(persona.image)}" alt="${escapeHtml(persona.person)} 카드 그림" loading="lazy" width="160" height="214">
          <span><span class="persona-gallery-title"><span>${escapeHtml(persona.person)}</span><span class="persona-gallery-code">${escapeHtml(persona.code)}</span></span>
          <span class="persona-gallery-summary">${escapeHtml(persona.short || persona.feature || "")}</span>
          <span class="persona-gallery-gifts">${escapeHtml(persona.gifts.join(" · "))}</span></span>
        </button>
        <div class="persona-gallery-jobs" aria-label="연결 직업">${jobsMarkup(persona)}</div>
      </article>`).join("")}</div>
    </section>
    <dialog id="persona-detail-dialog" class="persona-detail-dialog" aria-labelledby="persona-detail-heading">
      <button class="persona-detail-close" type="button" data-close-persona-detail>닫기</button>
      <div id="persona-detail-content"></div>
    </dialog>`;
  }

  function ensureGallery() {
    const main = document.querySelector("main");
    if (main && !document.getElementById("persona-gallery")) main.insertAdjacentHTML("beforeend", galleryMarkup());
  }

  function ensureHomeEntry() {
    const intro = document.querySelector("#screen-start h2");
    if (!intro || document.querySelector("[data-open-persona-gallery]")) return;
    intro.insertAdjacentHTML("afterend", `<button class="persona-gallery-home-entry" type="button" data-open-persona-gallery aria-expanded="false" aria-controls="persona-gallery">성경 인물 카드 56장 보기</button>`);
  }

  function openPersonaDetail(key) {
    const persona = data.byKey[key];
    const dialog = document.getElementById("persona-detail-dialog");
    const content = document.getElementById("persona-detail-content");
    if (!persona || !dialog || !content) return;
    const story = persona.story || persona.feature || persona.short || "";
    const verses = verseMarkup(persona);
    content.innerHTML = `<h2 id="persona-detail-heading"><span>${escapeHtml(persona.person)}</span><span class="persona-detail-code">${escapeHtml(persona.code)}</span></h2>
      <img class="persona-detail-image" src="${escapeHtml(persona.image)}" alt="${escapeHtml(persona.person)} 카드 그림" width="160" height="214">
      <section><h3>인물 이야기</h3><p>${escapeHtml(story)}</p></section>
      <section><h3>관련 구절</h3>${verses ? `<ul>${verses}</ul>` : "<p>등록된 구절 표기가 없습니다.</p>"}</section>
      <section><h3>연결 직업</h3><div class="persona-gallery-jobs">${jobsMarkup(persona)}</div></section>`;
    dialog.showModal();
  }

  function updateResultCard() {
    const card = document.querySelector("#top3 .persona-card");
    const top3 = calcScores().slice(0, 3);
    const comboKey = toComboKey(top3[0].key, top3[1].key, top3[2].key);
    const persona = data.byKey[comboKey];
    if (!card || !persona) return;
    card.dataset.personaKey = comboKey;
    card.innerHTML = `<div>
      <div class="persona-label">성경 인물 카드 · 검사 결과 연결</div>
      <div class="persona-title-code"><h5 class="persona-name">${escapeHtml(persona.person)}</h5><span class="persona-combo-code">${escapeHtml(persona.code)}</span></div>
      <div class="persona-verse">${escapeHtml(persona.gifts.join(" · "))}</div>
      <p class="persona-summary">${escapeHtml(persona.short || persona.feature || persona.story || "")}</p>
      <div class="persona-job-links" aria-label="함께 살펴볼 직업">${jobsMarkup(persona)}</div>
      <button class="persona-gallery-toggle" type="button" data-open-persona-gallery aria-expanded="false" aria-controls="persona-gallery">인물 카드 56장 모두 보기</button>
    </div><img class="persona-image" src="${escapeHtml(persona.image)}" alt="${escapeHtml(persona.person)} 카드 그림" loading="eager">`;
    ensureGallery();
  }

  ensureGallery();
  ensureHomeEntry();

  const originalRenderResult = window.renderResult;
  if (typeof originalRenderResult === "function") {
    window.renderResult = function (...args) {
      const result = originalRenderResult.apply(this, args);
      updateResultCard();
      return result;
    };
  }

  document.addEventListener("click", event => {
    const detailButton = event.target.closest("[data-open-persona-detail]");
    if (detailButton) {
      openPersonaDetail(detailButton.dataset.personaKey);
      return;
    }
    const closeButton = event.target.closest("[data-close-persona-detail]");
    if (closeButton) {
      document.getElementById("persona-detail-dialog")?.close();
      return;
    }
    const button = event.target.closest("[data-open-persona-gallery]");
    if (!button) return;
    ensureGallery();
    const gallery = document.getElementById("persona-gallery");
    if (!gallery) return;
    const open = gallery.hidden;
    gallery.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "인물 카드 56장 접기" : (button.classList.contains("persona-gallery-home-entry") ? "성경 인물 카드 56장 보기" : "인물 카드 56장 모두 보기");
    if (open) gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
