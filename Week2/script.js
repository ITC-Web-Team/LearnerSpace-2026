/**
 * Task Management System
 * Architecture: ES6 Class-based state management, LocalStorage persistence,
 * strict DOM rendering separation.
 */

class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('ms_tasks')) || [];
    this.currentFilter = 'all';
    this.editStateId = null;

    // DOM Elements
    this.form = document.getElementById('taskForm');
    this.input = document.getElementById('taskInput');
    this.category = document.getElementById('taskCategory');
    this.dueDate = document.getElementById('taskDueDate');
    this.taskList = document.getElementById('taskList');
    this.filterContainer = document.getElementById('filterContainer');
    this.metrics = document.getElementById('taskMetrics');
    this.submitBtn = document.getElementById('submitBtn');

    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.filterContainer.addEventListener('click', (e) => this.handleFilterClick(e));
    this.taskList.addEventListener('click', (e) => this.handleTaskAction(e));
    this.render();
  }

  // --- Core CRUD Logic ---

  handleFormSubmit(e) {
    e.preventDefault();
    
    const text = this.input.value.trim();
    const category = this.category.value;
    const date = this.dueDate.value;

    // 1. Validation: Prevent empty submissions
    if (!text) {
      this.showNotification('Task description cannot be empty.', 'error');
      this.input.focus();
      return;
    }

    if (this.editStateId) {
      this.updateTask(this.editStateId, text, category, date);
    } else {
      this.createTask(text, category, date);
    }
  }

  createTask(text, category, dueDate) {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      category,
      dueDate: dueDate || 'No date',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    this.saveData();
    this.resetForm();
    this.showNotification('Task successfully added.', 'success');
    this.render();
  }

  updateTask(id, text, category, dueDate) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex > -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], text, category, dueDate };
      this.saveData();
      this.resetForm();
      this.showNotification('Task updated.', 'success');
      this.render();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveData();
    this.showNotification('Task removed from workspace.', 'success');
    this.render();
  }

  toggleStatus(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'pending' ? 'completed' : 'pending';
      this.saveData();
      this.render();
    }
  }

  prepareEdit(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      this.input.value = task.text;
      this.category.value = task.category;
      this.dueDate.value = task.dueDate === 'No date' ? '' : task.dueDate;
      
      this.editStateId = id;
      this.submitBtn.textContent = 'Update task';
      this.input.focus();
    }
  }

  // --- UI & Rendering Logic ---

  handleTaskAction(e) {
    const target = e.target;
    if (!target.matches('.ghost-link')) return;

    const action = target.dataset.action;
    const id = target.closest('.task-item').dataset.id;

    if (action === 'delete') this.deleteTask(id);
    if (action === 'toggle') this.toggleStatus(id);
    if (action === 'edit') this.prepareEdit(id);
  }

  handleFilterClick(e) {
    if (e.target.tagName !== 'BUTTON') return;
    
    // Update active filter styling
    document.querySelectorAll('#filterContainer .ghost-link').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');

    this.currentFilter = e.target.dataset.filter;
    this.render();
  }

  render() {
    // Filter array
    let filteredTasks = this.tasks;
    if (this.currentFilter === 'pending') {
      filteredTasks = this.tasks.filter(t => t.status === 'pending');
    } else if (this.currentFilter === 'completed') {
      filteredTasks = this.tasks.filter(t => t.status === 'completed');
    }

    // Update Metrics
    this.metrics.textContent = `${filteredTasks.length} ${this.currentFilter !== 'all' ? this.currentFilter : 'total'} task(s)`;

    // Render HTML
    this.taskList.innerHTML = filteredTasks.map(task => `
      <div class="card-surface task-item ${task.status === 'completed' ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-content">
          <span class="task-text">${this.escapeHTML(task.text)}</span>
          <div class="task-meta">
            <span class="tag">${task.category}</span>
            <span>Due: ${task.dueDate}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="ghost-link" data-action="toggle">${task.status === 'pending' ? 'Complete' : 'Reopen'}</button>
          <button class="ghost-link" data-action="edit">Edit</button>
          <button class="ghost-link" data-action="delete" style="color: var(--color-deep-charcoal)">Delete</button>
        </div>
      </div>
    `).join('');
  }

  // --- Utilities ---

  resetForm() {
    this.form.reset();
    this.editStateId = null;
    this.submitBtn.textContent = 'Add task';
  }

  saveData() {
    localStorage.setItem('ms_tasks', JSON.stringify(this.tasks));
  }

  showNotification(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);

    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300); // Wait for transition
    }, 3500);
  }

  escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[tag])
    );
  }
}

// Boot up the application
document.addEventListener('DOMContentLoaded', () => {
  new TaskManager();
});