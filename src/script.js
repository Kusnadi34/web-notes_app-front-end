import './awesome-component.js';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './note-item.js';
import './custom-header.js';
import '../common.css';
import '../main.css';

const API_BASE_URL = 'https://notes-api.dicoding.dev/v2';

class NotesApp {
  constructor() {
    this.notes = [];
    this.filteredNotes = [];
    this.isSortedAscending = true;
    this.currentYear = new Date().getFullYear();
    this.editingNoteId = null;
    this.isLoading = false;
    
    this.initializeElements();
    this.setupEventListeners();
    this.updateFooterYear();
    document.addEventListener('note-archive', (e) => this.handleArchive(e.detail));
    this.loadNotes().finally(() => {
      this.hideLoading();
    });
  }
  
  
  initializeElements() {
    this.addNoteForm = document.getElementById('addNoteForm');
    this.noteTitleInput = document.getElementById('noteTitle');
    this.noteContentInput = document.getElementById('noteContent');
    this.clearFormBtn = document.getElementById('clearForm');
    
    this.searchInput = document.getElementById('searchInput');
    this.clearSearchBtn = document.getElementById('clearSearch');
    this.notesCountElement = document.getElementById('notesCount');
    
    this.notesContainer = document.getElementById('notesContainer');
    this.emptyState = document.getElementById('emptyState');
    
    this.sortNotesBtn = document.getElementById('sortNotes');
    this.deleteAllNotesBtn = document.getElementById('deleteAllNotes');
    this.addFirstNoteBtn = document.getElementById('addFirstNote');
    
    this.totalNotesCountElement = document.getElementById('totalNotesCount');
    this.totalCharactersElement = document.getElementById('totalCharacters');
  }
  
  async loadNotes() {
    try {
      this.showLoading();
      const [activeRes, archivedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/notes`),
        fetch(`${API_BASE_URL}/notes/archived`)
      ]);
      
      const activeData = await activeRes.json();
      const archivedData = await archivedRes.json();
      if (activeData.status === 'success' && archivedData.status === 'success') {
        this.notes = [...activeData.data, ...archivedData.data];
        this.filteredNotes = [...this.notes];
        this.renderNotes();
      } else {
        throw new Error('Gagal memuat catatan');
      }
    } catch (error) {
      this.showError('Gagal memuat catatan: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  async saveNoteToAPI(noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async updateNoteInAPI(noteId, noteData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteNoteFromAPI(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.status === 'success') {
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async archiveNoteInAPI(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/archive`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.status === 'success') {
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async unarchiveNoteInAPI(noteId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${noteId}/unarchive`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.status === 'success') {
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      throw error;
    }
  }

  async loadArchivedNotes() {
    try {
      this.showLoading();
      const response = await fetch(`${API_BASE_URL}/notes/archived`);
      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      this.showError('Failed to load archived notes: ' + error.message);
      return [];
    } finally {
      this.hideLoading();
    }
  }
  
  async handleArchive({ id, archived }) {
    try {
      this.showLoading();
      if (archived) {
        await this.unarchiveNoteInAPI(id);
      } else {
        await this.archiveNoteInAPI(id);
      }
      
      await this.loadNotes();
      this.showNotification(
        archived ? 'Note unarchived!' : 'Note archived!',
        'success'
      );
    } catch (error) {
      this.showError('Failed to archive/unarchive note: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }
  
  updateStats() {
    this.notesCountElement.textContent = this.filteredNotes.length.toString();
    
    this.totalNotesCountElement.textContent = this.notes.length.toString();
    
    const totalChars = this.notes.reduce((sum, note) => 
      sum + (note.title?.length || 0) + (note.body?.length || 0), 0);
    this.totalCharactersElement.textContent = totalChars.toLocaleString();
  }
  
  updateFooterYear() {
    document.getElementById('currentYear').textContent = this.currentYear.toString();
  }
  
  setupEventListeners() {
    this.addNoteForm.addEventListener('submit', (e) => this.handleAddNote(e));
    this.clearFormBtn.addEventListener('click', () => this.clearForm());
    this.searchInput.addEventListener('input', () => this.searchNotes());
    this.clearSearchBtn.addEventListener('click', () => this.clearSearch());
    this.sortNotesBtn.addEventListener('click', () => this.toggleSort());
    this.deleteAllNotesBtn.addEventListener('click', () => this.deleteAllNotes());
    this.addFirstNoteBtn.addEventListener('click', () => this.focusOnForm());
    this.noteTitleInput.addEventListener('blur', () => this.validateTitle());
    this.noteContentInput.addEventListener('blur', () => this.validateContent());
    
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }
  
  async handleAddNote(e) {
    e.preventDefault();
    if (!this.validateForm()) {
      return;
    }
    
    const title = this.noteTitleInput.value.trim();
    const body = this.noteContentInput.value.trim();
    
    try {
      this.showLoading();
      let savedNote;

      if (this.editingNoteId) {
        savedNote = await this.updateNoteInAPI(this.editingNoteId, { title, body });
        const index = this.notes.findIndex(note => note.id === this.editingNoteId);
        if (index !== -1) {
          this.notes[index] = savedNote;
          const filteredIndex = this.filteredNotes.findIndex(note => note.id === this.editingNoteId);
          if (filteredIndex !== -1) {
            this.filteredNotes[filteredIndex] = savedNote;
          }
        }
        this.showNotification('Note updated successfully!', 'success');
        this.editingNoteId = null;
      } else {
        savedNote = await this.saveNoteToAPI({ title, body });
        this.notes.unshift(savedNote);
        this.filteredNotes.unshift(savedNote);
        this.showNotification('Note added successfully!', 'success');
      }
      
      this.renderNotes();
      this.clearForm();
    } catch (error) {
      this.showError('Failed to save note: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }
  
  showLoading() {
    this.isLoading = true;
    let loader = document.getElementById('globalLoader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'globalLoader';
      loader.className = 'global-loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <div class="loader-text">Loading...</div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  }
  
  hideLoading() {
    this.isLoading = false;
    const loader = document.getElementById('globalLoader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
  
  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      confirmButtonColor: '#5B23FF',
    });
  }
  
  generateId() {
    return 'note-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  validateForm() {
    const isTitleValid = this.validateTitle();
    const isContentValid = this.validateContent();
    return isTitleValid && isContentValid;
  }
  
  validateTitle() {
    const title = this.noteTitleInput.value.trim();
    const validationElement = document.getElementById('titleValidation');
    if (!title) {
      this.showValidationError(validationElement, 'Title is required');
      return false;
    }
    
    if (title.length > 100) {
      this.showValidationError(validationElement, 'Title must be 100 characters or less');
      return false;
    }
    
    this.showValidationSuccess(validationElement, 'Title is valid');
    return true;
  }
  
  validateContent() {
    const content = this.noteContentInput.value.trim();
    const validationElement = document.getElementById('contentValidation');
    if (!content) {
      this.showValidationError(validationElement, 'Content is required');
      return false;
    }
    
    if (content.length > 1000) {
      this.showValidationError(validationElement, 'Content must be 1000 characters or less');
      return false;
    }
    
    this.showValidationSuccess(validationElement, 'Content is valid');
    return true;
  }
  
  showValidationError(element, message) {
    element.textContent = message;
    element.className = 'validation-message error';
  }
  
  showValidationSuccess(element, message) {
    element.textContent = message;
    element.className = 'validation-message success';
  }
  
  clearForm() {
    if (this.addNoteForm instanceof HTMLFormElement) {
      this.addNoteForm.reset();
    }
    document.getElementById('titleValidation').textContent = '';
    document.getElementById('contentValidation').textContent = '';
    this.editingNoteId = null;
    this.noteTitleInput.focus();
  }
  
  searchNotes() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredNotes = [...this.notes];
    } else {
      this.filteredNotes = this.notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm) ||
        note.body.toLowerCase().includes(searchTerm)
      );
    }
    
    this.renderNotes();
  }
  
  clearSearch() {
    this.searchInput.value = '';
    this.searchNotes();
    this.searchInput.focus();
  }
  
  toggleSort() {
    this.isSortedAscending = !this.isSortedAscending;
    
    this.filteredNotes.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      return this.isSortedAscending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    
    this.sortNotesBtn.innerHTML = this.isSortedAscending ?
      '<i class="fas fa-sort-amount-down"></i> Sort (Newest)' :
      '<i class="fas fa-sort-amount-up"></i> Sort (Oldest)';
    
    this.renderNotes();
  }
  
  async deleteAllNotes() {
    if (this.notes.length === 0) return;
      const result = await Swal.fire({
        title: 'Delete all notes?',
        text: 'This will delete ALL notes and cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete all!',
      });
    if (result.isConfirmed) {
      try {
        this.showLoading();
        const deletePromises = this.notes.map(note => this.deleteNoteFromAPI(note.id));
        await Promise.all(deletePromises);
        this.notes = [];
        this.filteredNotes = [];
        this.renderNotes();
        this.showNotification('All notes deleted successfully!', 'success');
      } catch (error) {
        this.showError('Failed to delete all notes: ' + error.message);
      } finally {
        this.hideLoading();
      }
    }
  }
  
  async deleteNote(noteId) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });
    
    if (result.isConfirmed) {
      try {
        this.showLoading();
        await this.deleteNoteFromAPI(noteId);
        this.notes = this.notes.filter(note => note.id !== noteId);
        this.filteredNotes = this.filteredNotes.filter(note => note.id !== noteId);
        this.renderNotes();
        this.showNotification('Note deleted successfully!', 'success');
      } catch (error) {
          this.showError('Failed to delete note: ' + error.message);
      } finally {
          this.hideLoading();
      }
    }
  }
  
  focusOnForm() {
    this.noteTitleInput.focus();
    window.scrollTo({
      top: document.querySelector('.add-note-section').offsetTop - 80,
      behavior: 'smooth'
    });
  }
  
  handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      this.searchInput.focus();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      this.focusOnForm();
    }
    
    if (e.key === 'Escape' && document.activeElement === this.searchInput) {
      this.clearSearch();
    }
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  renderNotes() {
    this.updateStats();
    
    if (this.filteredNotes.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.notesContainer.innerHTML = '';
      this.notesContainer.appendChild(this.emptyState);
      return;
    }
    
    this.emptyState.classList.add('hidden');
    this.notesContainer.innerHTML = '';
    
    this.filteredNotes.forEach(note => {
      const noteCard = this.createNoteCard(note);
      this.notesContainer.appendChild(noteCard);
    });
  }
  
  createNoteCard(note) {
    const noteItem = document.createElement('note-item');
    noteItem.setAttribute('data-id', note.id);
    noteItem.setAttribute('data-title', note.title);
    noteItem.setAttribute('data-body', note.body);
    noteItem.setAttribute('data-date', note.createdAt);
    noteItem.setAttribute('data-archived', note.archived);
    noteItem.addEventListener('note-edit', (e) => this.editNote(e.detail));
    noteItem.addEventListener('note-delete', (e) => this.deleteNote(e.detail));
  
    return noteItem;
  }
  
  editNote(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) return;
    
    this.noteTitleInput.value = note.title;
    this.noteContentInput.value = note.body;
    this.editingNoteId = noteId;
    
    this.focusOnForm();
    this.showNotification('Note loaded for editing. Make changes and save.', 'info');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});