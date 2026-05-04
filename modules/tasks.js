// modules/tasks.js
// Web Components: <skill-node> y <phase-section>

// ─────────────────────────────────────────
//  SKILL-NODE  — cubo/cuadradito clickeable
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
      this.dispatchEvent(new CustomEvent('skill-select', {
        bubbles: true,
        composed: true,
        detail: { topicId: this.getAttribute('topic-id') },
      }));
    });
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const label    = this.getAttribute('label') || '?';
    const emoji    = this.getAttribute('emoji') || '';
    const state    = this.getAttribute('state') || 'locked';   // locked | available | completed
    const selected = this.hasAttribute('selected');

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }

        .node {
          position: relative;
          width: 72px;
          height: 72px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: transform .15s cubic-bezier(.4,0,.2,1),
                      box-shadow .15s cubic-bezier(.4,0,.2,1);
          background: var(--node-bg, #16161f);
          border: 1.5px solid var(--node-border, #2a2a3a);
          gap: 3px;
        }

        /* State: completed */
        :host([state="completed"]) .node {
          --node-bg: #131320;
          --node-border: #6366f1;
          background: linear-gradient(135deg, #12122a 0%, #1a1a30 100%);
          border-color: #6366f1;
        }

        /* State: available */
        :host([state="available"]) .node {
          --node-bg: #16161f;
          --node-border: #3a3a55;
          background: linear-gradient(135deg, #15151e 0%, #1c1c28 100%);
        }

        /* State: locked */
        :host([state="locked"]) .node {
          opacity: .35;
          filter: grayscale(.6);
          cursor: not-allowed;
        }

        /* Selected */
        :host([selected]) .node {
          border-color: #ff1a6b !important;
          background: linear-gradient(135deg, #1f1020 0%, #22102a 100%) !important;
          box-shadow: 0 0 0 2px #ff1a6b44, 0 0 16px #ff1a6b55, inset 0 1px 0 #ff1a6b22 !important;
          transform: scale(1.07);
        }

        :host([state="completed"]) .node:hover:not([selected]),
        :host([state="available"]) .node:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 4px 16px rgba(99,102,241,.3);
          border-color: #6366f1;
        }

        .node-emoji {
          font-size: 22px;
          line-height: 1;
        }

        .node-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: #9090b0;
          text-align: center;
          max-width: 64px;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        :host([state="completed"]) .node-label {
          color: #a0a0d0;
        }

        :host([selected]) .node-label {
          color: #ff1a6b !important;
        }

        /* Completed checkmark badge */
        .badge {
          display: none;
          position: absolute;
          top: -5px;
          right: -5px;
          width: 14px;
          height: 14px;
          background: #6366f1;
          border: 1.5px solid #0a0a0f;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          color: #fff;
          font-weight: 900;
        }

        :host([state="completed"]) .badge {
          display: flex;
        }

        :host([selected]) .badge {
          background: #ff1a6b;
        }

        /* Connector dot (bottom center) — decorative */
        .dot {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3a3a55;
        }

        :host([state="completed"]) .dot { background: #6366f1; }
        :host([selected]) .dot { background: #ff1a6b; }
      </style>

      <div class="node" title="${label}">
        <span class="badge">✓</span>
        <span class="node-emoji">${emoji}</span>
        <span class="node-label">${label}</span>
        <span class="dot"></span>
      </div>
    `;
  }
}

// ─────────────────────────────────────────────────────
//  PHASE-SECTION  — agrupa un conjunto de skill-nodes
// ─────────────────────────────────────────────────────
class PhaseSection extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'emoji'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const label = this.getAttribute('label') || 'FASE';
    const emoji = this.getAttribute('emoji') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; margin-bottom: 20px; }

        .phase-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          padding-left: 2px;
        }

        .phase-emoji { font-size: 13px; }

        .phase-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          color: #55556a;
          text-transform: uppercase;
          flex: 1;
        }

        .phase-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, #2a2a3a 0%, transparent 100%);
        }

        .nodes-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding: 2px;
        }

        ::slotted(skill-node) {
          /* slot content styling via host */
        }
      </style>

      <div class="phase-header">
        <span class="phase-emoji">${emoji}</span>
        <span class="phase-label">${label}</span>
        <span class="phase-line"></span>
      </div>

      <div class="nodes-grid">
        <slot></slot>
      </div>
    `;
  }
}

// Register
customElements.define('skill-node', SkillNode);
customElements.define('phase-section', PhaseSection);