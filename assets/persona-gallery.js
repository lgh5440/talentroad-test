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

  function galleryMarkup() {
    return `<section id="persona-gallery" class="persona-gallery" aria-labelledby="persona-gallery-heading" hidden>
      <h3 id="persona-gallery-heading">성경 인물 카드 56장</h3>
      <p>검사 결과에 연결된 인물 그림과 함께 살펴볼 직업이에요. 직업 이름을 누르면 소명지도 상세로 이동해요.</p>
      <p><a href="${allJobsHref}" target="_blank" rel="noopener">소명지도 직업 모두 보기</a></p>
      <div class="persona-gallery-grid">${entries.map(persona => `<article class="persona-gallery-card" data-persona-key="${escapeHtml(persona.key)}">
        <img src="${escapeHtml(persona.image)}" alt="${escapeHtml(persona.person)} 카드 그림" loading="lazy" width="160" height="214">
        <div><div class="persona-gallery-title"><span>${escapeHtml(persona.person)}</span><span class="persona-gallery-code">${escapeHtml(persona.code)}</span></div>
        <p>${escapeHtml(persona.short || persona.feature || "")}</p><p>${escapeHtml(persona.gifts.join(" · "))}</p></div>
        <div class="persona-gallery-jobs">${jobsMarkup(persona)}</div>
      </article>`).join("")}</div>
    </section>`;
  }

  function ensureGallery() {
    const result = document.getElementById("screen-result");
    if (result && !document.getElementById("persona-gallery")) result.insertAdjacentHTML("beforeend", galleryMarkup());
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

  const originalRenderResult = window.renderResult;
  if (typeof originalRenderResult === "function") {
    window.renderResult = function (...args) {
      const result = originalRenderResult.apply(this, args);
      updateResultCard();
      return result;
    };
  }
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open-persona-gallery]");
    if (!button) return;
    ensureGallery();
    const gallery = document.getElementById("persona-gallery");
    if (!gallery) return;
    const open = gallery.hidden;
    gallery.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.textContent = open ? "인물 카드 56장 접기" : "인물 카드 56장 모두 보기";
    if (open) gallery.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
