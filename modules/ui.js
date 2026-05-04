// modules/ui.js
// Construye el árbol de habilidades y renderiza el contenido del tema.

import { courseData } from './storage.js';

// ─────────────────────────
//  SKILL TREE (sidebar)
// ─────────────────────────
export function buildSkillTree(container, onSelect) {
  container.innerHTML = '';

  const courseTitle = document.getElementById('course-title-display');
  if (courseTitle) courseTitle.textContent = courseData.title;

  courseData.phases.forEach(phase => {
    const section = document.createElement('phase-section');
    section.setAttribute('label', phase.title);
    section.setAttribute('emoji', phase.emoji);

    phase.topics.forEach(topic => {
      const node = document.createElement('skill-node');
      node.setAttribute('topic-id', topic.id);
      node.setAttribute('label', topic.title);
      node.setAttribute('emoji', topic.emoji);
      node.setAttribute('state', topic.completed ? 'completed' : 'available');
      section.appendChild(node);
    });

    container.appendChild(section);
  });

  container.addEventListener('skill-select', e => {
    const { topicId } = e.detail;
    container.querySelectorAll('skill-node').forEach(n => n.removeAttribute('selected'));
    const clicked = container.querySelector(`skill-node[topic-id="${topicId}"]`);
    if (clicked) clicked.setAttribute('selected', '');
    const topic = findTopic(topicId);
    if (topic) onSelect(topic);
  });
}

function findTopic(id) {
  for (const phase of courseData.phases) {
    const found = phase.topics.find(t => t.id === id);
    if (found) return found;
  }
  return null;
}

// ─────────────────────────
//  TOPIC VIEW (main)
// ─────────────────────────
export function renderTopic(topic) {
  const welcome = document.getElementById('welcome-screen');
  const view    = document.getElementById('topic-view');

  welcome.classList.add('hidden');
  view.classList.remove('hidden');
  view.innerHTML = '';

  // ── Header ──
  const header = el('div', 'topic-header');
  const eyebrow = el('div', 'topic-eyebrow');
  eyebrow.textContent = 'TEMA DEL CURSO';
  const meta = el('div', 'topic-meta');
  meta.innerHTML = `<h2>${topic.emoji} ${topic.title}</h2><p>${topic.description}</p>`;
  header.append(eyebrow, meta);
  view.appendChild(header);

  // ── Main video ──
  const mvBlock = el('div', 'main-video-block');
  const mvLabel = sectionLabel('▶', 'VIDEO COMPLETO');
  const wrap = el('div', 'video-wrap');
  const embed = buildVideoEmbed(topic.mainVideo.youtubeId, 0);
  const vmeta = el('div', 'video-meta');
  vmeta.innerHTML = `
    <span class="video-meta-title">${topic.mainVideo.title}</span>
    <span class="video-duration">⏱ ${topic.mainVideo.duration}</span>
  `;
  wrap.appendChild(embed);
  wrap.appendChild(vmeta);
  mvBlock.append(mvLabel, wrap);
  view.appendChild(mvBlock);

  // ── Highlights ──
  if (topic.highlights?.length) {
    const hlSection = el('div', 'highlights-section');
    const hlLabel = sectionLabel('⚡', 'HIGHLIGHTS');
    const hlGrid = el('div', 'highlights-grid');

    topic.highlights.forEach(h => {
      const card = el('div', 'highlight-card');
      card.innerHTML = `
        <div class="highlight-time">${h.time}</div>
        <div class="highlight-title">${h.label}</div>
      `;
      card.title = `Ir a ${h.time}`;
      card.addEventListener('click', () => {
        const sec = timeToSeconds(h.time);
        reloadEmbed(embed, topic.mainVideo.youtubeId, sec);
        wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      hlGrid.appendChild(card);
    });

    hlSection.append(hlLabel, hlGrid);
    view.appendChild(hlSection);
  }

  // ── Chapters ──
  if (topic.chapters?.length) {
    const chSection = el('div', 'chapters-section');
    const chLabel = sectionLabel('📚', 'CAPÍTULOS');
    const chList = el('div', 'chapter-list');

    topic.chapters.forEach((ch, idx) => {
      chList.appendChild(buildChapterCard(ch, idx + 1));
    });

    chSection.append(chLabel, chList);
    view.appendChild(chSection);
  }
}

// ─────────────────────────
//  HELPERS
// ─────────────────────────
function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function sectionLabel(icon, text) {
  const div = el('div', 'section-label');
  div.innerHTML = `<span class="sl-icon">${icon}</span>${text}`;
  return div;
}

function buildVideoEmbed(youtubeId, startAt = 0) {
  const wrapper = el('div', 'video-embed');
  wrapper.dataset.ytId = youtubeId;
  const src = `https://www.youtube.com/embed/${youtubeId}?start=${startAt}&rel=0&modestbranding=1`;
  wrapper.innerHTML = `<iframe src="${src}" allowfullscreen loading="lazy"></iframe>`;
  return wrapper;
}

function reloadEmbed(embedEl, youtubeId, startAt) {
  const src = `https://www.youtube.com/embed/${youtubeId}?start=${startAt}&rel=0&modestbranding=1&autoplay=1`;
  embedEl.innerHTML = `<iframe src="${src}" allowfullscreen></iframe>`;
}

function buildChapterCard(ch, num) {
  const card = el('div', 'chapter-card');

  const header = el('div', 'chapter-header');
  header.innerHTML = `
    <span class="chapter-num">${String(num).padStart(2, '0')}</span>
    <div class="chapter-info">
      <div class="chapter-title">${ch.title}</div>
      <div class="chapter-sub">${ch.description}</div>
    </div>
    <span class="chapter-arrow">▶</span>
  `;

  const videoSection = el('div', 'chapter-video');
  const wrap = el('div', 'video-wrap');
  const embed = buildVideoEmbed(ch.youtubeId, ch.startAt);
  wrap.appendChild(embed);
  videoSection.appendChild(wrap);

  if (ch.highlights?.length) {
    const mhContainer = el('div', 'chapter-highlights');
    ch.highlights.forEach(h => {
      const mh = el('span', 'mini-highlight');
      mh.innerHTML = `<span class="mh-time">${h.time}</span>${h.label}`;
      mh.addEventListener('click', e => {
        e.stopPropagation();
        reloadEmbed(embed, ch.youtubeId, timeToSeconds(h.time));
      });
      mhContainer.appendChild(mh);
    });
    videoSection.appendChild(mhContainer);
  }

  header.addEventListener('click', () => {
    const isOpen = card.classList.contains('expanded');
    document.querySelectorAll('.chapter-card.expanded').forEach(c => c.classList.remove('expanded'));
    if (!isOpen) card.classList.add('expanded');
  });

  card.append(header, videoSection);
  return card;
}

function timeToSeconds(t) {
  const p = t.split(':').map(Number);
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return p[0];
}