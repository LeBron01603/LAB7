// modules/tasks.js — Web Components
// <skill-node>  y  <phase-section>
// Tema deportivo light · naranja + azul pizarrón

// ─────────────────────────────────────────
//  SKILL-NODE
// ─────────────────────────────────────────
class SkillNode extends HTMLElement {
  static get observedAttributes() {
    return ['topic-id', 'label', 'emoji', 'state', 'selected'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('.node').addEventListener('click', () => {
      if (this.getAttribute('state') === 'locked') return;
      this.dispatchEvent(new CustomEvent('skill-select', {
        bubbles: true,
        composed: true,
        detail: { topicId: this.getAttribute('topic-id') },
      }));
    });
  }

  attributeChangedCallback() { this.render(); }

  render() {
    const label    = this.getAttribute('label') || '?';
    const emoji    = this.getAttribute('emoji') || '📘';
    const state    = this.getAttribute('state') || 'available';
    const selected = this.hasAttribute('selected');

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@700;900&display=swap');

        :host { display: block; }

        .node {
          position: relative;
          width: 88px;
          height: 88px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          gap: 5px;
          transition:
            transform .15s cubic-bezier(.4,0,.2,1),
            box-shadow .15s cubic-bezier(.4,0,.2,1),
            border-color .15s;

          /* Base: azul pizarrón claro */
          background: linear-gradient(160deg, #232d4a 0%, #1a2035 100%);
          border: 2px solid #2a3555;
          box-shadow: 0 2px 8px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.05);
        }

        /* ── States ── */

        /* completed: toque azul eléctrico */
        :host([state="completed"]) .node {
          background: linear-gradient(160deg, #1e3a8a 0%, #1a2d70 100%);
          border-color: #3b82f6;
          box-shadow: 0 2px 10px rgba(59,130,246,.3), inset 0 1px 0 rgba(255,255,255,.08);
        }

        /* available: base normal */
        :host([state="available"]) .node {
          background: linear-gradient(160deg, #232d4a 0%, #1a2035 100%);
          border-color: #2a3555;
        }

        /* locked: apagado */
        :host([state="locked"]) .node {
          opacity: .3;
          filter: grayscale(.7);
          cursor: not-allowed;
        }

        /* selected: naranja fuego */
        :host([selected]) .node {
          background: linear-gradient(160deg, #7a2800 0%, #ff5c00 100%) !important;
          border-color: #ff5c00 !important;
          box-shadow:
            0 0 0 3px rgba(255,92,0,.25),
            0 6px 20px rgba(255,92,0,.35),
            inset 0 1px 0 rgba(255,255,255,.15) !important;
          transform: scale(1.08) translateY(-2px) !important;
        }

        /* hover (no locked, no selected) */
        :host(:not([state="locked"]):not([selected])) .node:hover {
          transform: translateY(-3px) scale(1.05);
          border-color: #ff5c00;
          box-shadow: 0 6px 18px rgba(255,92,0,.28), inset 0 1px 0 rgba(255,255,255,.08);
        }

        /* ── Emoji ── */
        .node-emoji {
          font-size: 26px;
          line-height: 1;
          filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
        }

        :host([state="locked"]) .node-emoji { filter: grayscale(1); }

        /* ── Label ── */
        .node-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(240,244,255,.55);
          text-align: center;
          max-width: 76px;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :host([state="completed"]) .node-label { color: rgba(147,197,253,.75); }
        :host([selected]) .node-label { color: rgba(255,255,255,.9) !important; }

        /* ── Badge completado ── */
        .badge {
          display: none;
          position: absolute;
          top: -6px; right: -6px;
          width: 18px; height: 18px;
          background: #3b82f6;
          border: 2px solid #f0f2f5;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: #fff;
          font-weight: 900;
        }

        :host([state="completed"]) .badge { display: flex; }
        :host([selected]) .badge { background: #fff; color: #ff5c00; border-color: #ff5c00; }

        /* ── Stripe bottom — decorativa ── */
        .stripe {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: rgba(255,255,255,.06);
        }
        :host([state="completed"]) .stripe { background: #3b82f6; opacity: .6; }
        :host([selected]) .stripe { background: rgba(255,255,255,.3); }
      </style>

      <div class="node" title="${label}">
        <span class="badge">✓</span>
        <span class="node-emoji">${emoji}</span>
        <span class="node-label">${label}</span>
        <span class="stripe"></span>
      </div>
    `;
  }
}

// ─────────────────────────────────────────
//  PHASE-SECTION
// ─────────────────────────────────────────
class PhaseSection extends HTMLElement {
  static get observedAttributes() { return ['label', 'emoji']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  attributeChangedCallback() { this.render(); }

  render() {
    const label = this.getAttribute('label') || 'FASE';
    const emoji = this.getAttribute('emoji') || '';

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap');

        :host { display: block; margin-bottom: 24px; }

        .phase-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 0 2px;
        }

        .phase-pip {
          width: 4px;
          height: 16px;
          background: #ff5c00;
          flex-shrink: 0;
        }

        .phase-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .18em;
          color: rgba(136,152,187,.7);
          text-transform: uppercase;
        }

        .phase-line {
          flex: 1;
          height: 1px;
          background: rgba(42,53,85,.8);
        }

        .nodes-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 2px;
        }
      </style>

      <div class="phase-header">
        <span class="phase-pip"></span>
        <span class="phase-label">${emoji} ${label}</span>
        <span class="phase-line"></span>
      </div>
      <div class="nodes-grid">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('skill-node', SkillNode);
customElements.define('phase-section', PhaseSection);