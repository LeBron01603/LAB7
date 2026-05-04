// modules/ui.js
// Construye el árbol de habilidades en el sidebar
// y el contenido del tema a la derecha.

import { courseData } from './storage.js';

// ─────────────────────────
//  SKILL TREE (sidebar)
// ─────────────────────────
export function buildSkillTree(container, onSelect) {
  container.innerHTML = '';

  // Título del curso
  const courseTitle = document.getElementById('course-title-display');
  if (courseTitle) courseTitle.textContent = courseData.title;

  courseData.phases.forEach(phase => {
    // Crear <phase-section>
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

  // Event delegation — skill-select bubbles up
  container.addEventListener('skill-select', e => {
    const { topicId } = e.detail;

    // Deselect all
    container.querySelectorAll('skill-node').forEach(n => n.removeAttribute('selected'));
    // Select clicked
    const clicked = container.querySelector(`skill-node[topic-id="${topicId}"]`);
    if (clicked) clicked.setAttribute('selected', '');

    // Find topic data
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
//  TOPIC VIEW (main area)
// ─────────────────────────
export function renderTopic(topic) {
  const welcome = document.getElementById('welcome-screen');
  const view    = document.getElementById('topic-view');

  welcome.classList.add('hidden');
  view.classList.remove('hidden');
  view.innerHTML = '';

  // ── Header ──
  const header = el('div', 'topic-header');
  const badge  = el('div', 'topic-badge');
  badge.textContent = 'TEMA';
  const meta = el('div', 'topic-meta');
  meta.innerHTML = `<h2>${topic.emoji} ${topic.title}</h2><p>${topic.description}</p>`;
  header.append(badge, meta);
  view.appendChild(header);

  // ── Main video ──
  const mvBlock = el('div', 'main-video-block');
  const mvLabel = el('div', 'section-label');
  mvLabel.textContent = '▶ VIDEO COMPLETO';
  const embed = buildVideoEmbed(topic.mainVideo.youtubeId, 0);
  const mvMeta = el('p', '');
  mvMeta.style.cssText = 'color:#9090b0;font-size:13px;margin-top:8px;';
  mvMeta.innerHTML = `<strong style="color:#f0f0f8">${topic.mainVideo.title}</strong> &nbsp;·&nbsp; ${topic.mainVideo.duration}`;
  mvBlock.append(mvLabel, embed, mvMeta);
  view.appendChild(mvBlock);

  // ── Highlights del video principal ──
  if (topic.highlights?.length) {
    const hlSection = el('div', 'highlights-section');
    const hlLabel   = el('div', 'section-label');
    hlLabel.textContent = '⚡ HIGHLIGHTS';
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
        scrollToEmbed(embed, sec);
      });
      hlGrid.appendChild(card);
    });

    hlSection.append(hlLabel, hlGrid);
    view.appendChild(hlSection);
  }

  // ── Capítulos (si los tiene) ──
  if (topic.chapters?.length) {
    const chSection = el('div', 'chapters-section');
    const chLabel   = el('div', 'section-label');
    chLabel.textContent = '📚 CAPÍTULOS';
    const chList = el('div', 'chapter-list');

    topic.chapters.forEach((ch, idx) => {
      const card = buildChapterCard(ch, idx + 1);
      chList.appendChild(card);
    });

    chSection.append(chLabel, chList);
    view.appendChild(chSection);
  }
}

// ─────────────────────────
//  HELPERS
// ─────────────────────────
function el(tag, className) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  return e;
}

function buildVideoEmbed(youtubeId, startAt = 0) {
  const wrapper = el('div', 'video-embed');
  const src = `https://www.youtube.com/embed/${youtubeId}?start=${startAt}&rel=0&modestbranding=1`;
  wrapper.innerHTML = `<iframe src="${src}" allowfullscreen loading="lazy"></iframe>`;
  return wrapper;
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
  const embed = buildVideoEmbed(ch.youtubeId, ch.startAt);
  videoSection.appendChild(embed);

  // Mini highlights del capítulo
  if (ch.highlights?.length) {
    const mhContainer = el('div', 'chapter-highlights');
    ch.highlights.forEach(h => {
      const mh = el('span', 'mini-highlight');
      mh.innerHTML = `<span class="mh-time">${h.time}</span>${h.label}`;
      mh.addEventListener('click', e => {
        e.stopPropagation();
        const sec = timeToSeconds(h.time);
        // Rebuild iframe with correct start
        const newEmbed = buildVideoEmbed(ch.youtubeId, sec);
        embed.replaceWith(newEmbed);
      });
      mhContainer.appendChild(mh);
    });
    videoSection.appendChild(mhContainer);
  }

  // Toggle expand
  header.addEventListener('click', () => {
    const isOpen = card.classList.contains('expanded');
    // Close all others
    document.querySelectorAll('.chapter-card.expanded').forEach(c => c.classList.remove('expanded'));
    if (!isOpen) card.classList.add('expanded');
  });

  card.append(header, videoSection);
  return card;
}

function timeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function scrollToEmbed(embedEl, startAt) {
  // Reload iframe with new startAt
  const iframe = embedEl.querySelector('iframe');
  if (!iframe) return;
  const current = iframe.src.replace(/start=\d+/, `start=${startAt}`);
  iframe.src = current;
  embedEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}