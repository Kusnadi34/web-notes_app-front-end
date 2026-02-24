class NoteItem extends HTMLElement {
  static get observedAttributes() {
    return ['data-title', 'data-body', 'data-date', 'data-id', 'data-archived'];
  }
  
  
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.render();
    this.setupEvents();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  getNoteData() {
    return {
      id: this.getAttribute('data-id'),
      title: this.getAttribute('data-title'),
      body: this.getAttribute('data-body'),
      date: this.getAttribute('data-date'),
      archived: this.getAttribute('data-archived') === 'true'
    };
  }
  
  render() {
    const { id, title, body, date, archived } = this.getNoteData();
    if (!id || !title) return;
    const isLong = body && body.length > 200;
    const displayBody = isLong ? body.substring(0, 200) + '...' : body;
    const formattedDate = date ? new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    
    
    this.innerHTML = `
      <div class="note-card ${archived ? 'archived' : ''}">
        <div class="note-header">
          <h3 class="note-title">${this.escapeHtml(title)} ${archived ? '<span class="archived-badge">Archived</span>' : ''}</h3>
          <div class="note-actions">
            <button class="note-action-btn archive" title="${archived ? 'Unarchive' : 'Archive'} note">
              <i class="fas fa-${archived ? 'inbox' : 'archive'}"></i>
            </button>
            <button class="note-action-btn edit" title="Edit note">
              <i class="fas fa-edit"></i>
            </button>
            <button class="note-action-btn delete" title="Delete note">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        
        <div class="note-content ${isLong ? 'expandable' : ''}">
          ${this.escapeHtml(displayBody).replace(/\n/g, '<br>')}
        </div>
        
        ${isLong ? '<button class="expand-btn">Show More</button>' : ''}
        
        <div class="note-footer">
          <div class="note-date">${formattedDate}</div>
          <div class="note-char-count">${body?.length || 0} chars</div>
        </div>
      </div>
    `;
  }
  
  setupEvents() {
    this.addEventListener('click', (e) => {
      const { id, archived } = this.getNoteData();
      
      if (e.target.closest('.archive')) {
        this.dispatchEvent(new CustomEvent('note-archive', {
          detail: { id, archived },
          bubbles: true
        }));
      }
      
      if (e.target.closest('.edit')) {
        this.dispatchEvent(new CustomEvent('note-edit', {
          detail: id,
          bubbles: true
        }));
      }
      
      if (e.target.closest('.delete')) {
        this.dispatchEvent(new CustomEvent('note-delete', {
          detail: id,
          bubbles: true
        }));
      }
      
      if (e.target.closest('.expand-btn')) {
        this.toggleExpand();
      }
    });
  }

  toggleExpand() {
    const content = this.querySelector('.note-content');
    const btn = this.querySelector('.expand-btn');
    const fullBody = this.getAttribute('data-body');
    
    if (content.classList.contains('expanded')) {
      content.innerHTML = this.escapeHtml(fullBody.substring(0, 200) + '...').replace(/\n/g, '<br>');
      content.classList.remove('expanded');
      content.classList.add('expandable');
      btn.textContent = 'Show More';
    } else {
      content.innerHTML = this.escapeHtml(fullBody).replace(/\n/g, '<br>');
      content.classList.remove('expandable');
      content.classList.add('expanded');
      btn.textContent = 'Show Less';
    }
  }
  
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('note-item', NoteItem);

export {};