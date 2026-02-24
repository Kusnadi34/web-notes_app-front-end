class CustomHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
  }
  
  updateStyle() {
    return `
      :host {
        display: block;
      }
      header {
        background: linear-gradient(135deg, #362F4F 0%, #2a2640 100%);
        color: white;
        box-shadow: 0 4px 20px rgba(54, 47, 79, 0.2);
        position: sticky;
        top: 0;
        z-index: 1000;
        border-bottom: 3px solid #5B23FF;
      }
      .app-bar {
        padding: 1.5rem 0;
      }
      .app-bar .container {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .brand-name {
        font-size: 1.8rem;
        font-weight: 700;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
      }
      .brand-name i {
        color: #E4FF30;
        font-size: 1.6rem;
      }
      @media (max-width: 768px) {
        .brand-name {
          font-size: 1.5rem;
        }
      }
      @media (max-width: 480px) {
        .app-bar .container {
          justify-content: center;
        }
        .brand-name {
          font-size: 1.3rem;
        }
      }
    `;
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.updateStyle()}</style>
      <header>
        <div class="app-bar">
          <div class="container">
            <h1 class="brand-name">
              <i class="fas fa-sticky-note"></i> Notes App
            </h1>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('custom-header', CustomHeader);

export{};