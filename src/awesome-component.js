class AwesomeComponent extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    this.innerHTML = `
      <div class="awesome-banner">
        <p>
          <i class="fas fa-rocket"></i>
          Welcome to Notes App!
        </p>
      </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .awesome-banner {
        background: linear-gradient(90deg, #5B23FF, #008BFF);
        color: white;
        padding: 10px 0;
        text-align: center;
        font-weight: 600;
        box-shadow: 0 2px 10px rgba(91, 35, 255, 0.2);
        animation: slideDown 0.5s ease-out;
      }
      
      .awesome-banner p {
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 0.95rem;
      }
      
      .awesome-banner i {
        color: #E4FF30;
        animation: pulse 2s infinite;
      }
      
      @keyframes slideDown {
        from {
          transform: translateY(-100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    
    this.appendChild(style);
  }
}

customElements.define('awesome-component', AwesomeComponent);

export {};