const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const dueDateInput = document.getElementById('dueDateInput');
const prioritySelect = document.getElementById('prioritySelect');
const suggestBtn = document.getElementById('suggestBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

const STORAGE_KEY = 'smart-task-manager-tasks';
let tasks = [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    tasks = JSON.parse(saved);
  }
  renderTasks();
}

function createTaskElement(task) {
  const li = document.createElement('li');
  if (task.completed) li.classList.add('completed');

  li.innerHTML = `
    <div class="task-content">
      <span class="task-text">${task.text}</span>
      <div style="margin-top: 5px;">
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        ${task.dueDate ? `<span style="font-size: 12px; color: #666; margin-left: 8px;">📅 ${task.dueDate}</span>` : ''}
      </div>
    </div>
    <button class="delete-btn">✕</button>
  `;

  // Toggle Complete
  li.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  });

  // Delete Task
  li.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    tasks = tasks.filter(t => t.id !== task.id);
    saveTasks();
    renderTasks();
  });

  return li;
}

function renderTasks() {
  taskList.innerHTML = '';
  
  let filtered = tasks.filter(task => {
    if (currentFilter === 'completed') return task.completed;
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'high') return task.priority === 'high';
    if (currentFilter === 'today') {
      return task.dueDate === new Date().toISOString().slice(0, 10);
    }
    return true;
  });

  filtered.forEach(task => taskList.appendChild(createTaskElement(task)));
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now() + Math.random().toString(16),
    text: text,
    completed: false,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value || null
  });

  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

suggestBtn.addEventListener('click', () => {
  const suggestions = ['Morning exercise', 'Read 10 pages', 'Drink water'];
  suggestions.forEach(s => {
    if (!tasks.some(t => t.text === s)) {
      tasks.push({ id: Date.now() + Math.random(), text: s, completed: false, priority: 'medium', dueDate: null });
    }
  });
  saveTasks();
  renderTasks();
});

addTaskBtn.addEventListener('click', addTask);
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

loadTasks();
