// Smart Task Manager with localStorage support
// Stores tasks as objects that include id/priority/dueDate/createdAt, with
// a simple migration step for older saved data.

// Get handles to DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const dueDateInput = document.getElementById('dueDateInput');
const prioritySelect = document.getElementById('prioritySelect');
const suggestBtn = document.getElementById('suggestBtn');
const taskList = document.getElementById('taskList');
const filterButtons = document.querySelectorAll('.filter-btn');

// Key name for localStorage
const STORAGE_KEY = 'smart-task-manager-tasks';

// In-memory array for tasks; new format:
// { id, text, completed, priority, dueDate, createdAt }
let tasks = [];

// Current active filter for the task list.
// Possible values: "all", "today", "completed", "pending", "high"
let currentFilter = 'all';

// Save all tasks to localStorage in JSON format
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Migration helper: bring old tasks (without id) up to the new shape.
// - Adds: id, priority ("medium"), dueDate (null), createdAt (timestamp)
// - Keeps existing tasks that already have an id unchanged
function migrateTasksIfNeeded(rawTasks) {
  let migrated = false;

  const normalized = (rawTasks || []).map(function(task) {
    // If it already has an id, treat it as migrated and leave as is
    if (task && task.id) {
      return task;
    }

    // Otherwise, treat as old data and add the new fields
    migrated = true;
    return {
      id: Date.now().toString() + '-' + Math.random().toString(16).slice(2),
      text: task && task.text ? task.text : '',
      completed: task && typeof task.completed === 'boolean' ? task.completed : false,
      priority: 'medium',
      dueDate: null,
      createdAt: new Date().toISOString(),
    };
  });

  return { normalized, migrated };
}

// Load tasks from localStorage (if any), migrate old ones, and save if changed
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    tasks = [];
    renderTasks();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    const { normalized, migrated } = migrateTasksIfNeeded(Array.isArray(parsed) ? parsed : []);
    tasks = normalized;

    // If we migrated, write back the upgraded data for future loads
    if (migrated) {
      saveTasks();
    }
  } catch (e) {
    // If parsing fails, start fresh (keeps the app from breaking for beginners)
    tasks = [];
  }

  renderTasks();
}

// Build a <li> for a specific task and add event listeners
function createTaskElement(task, index) {
  const li = document.createElement('li');
  const span = document.createElement('span');

  // If a task is overdue (dueDate is before today) and not completed,
  // add a small visual highlight.
  // Note: dueDate comes from <input type="date"> in "YYYY-MM-DD" format,
  // so string comparison works for ordering.
  if (task.dueDate && !task.completed) {
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    if (task.dueDate < today) {
      li.classList.add('overdue');
    }
  }

  // Task text
  const textEl = document.createElement('span');
  textEl.textContent = task.text;
  textEl.className = 'task-text';

  // Optional: show priority in a subtle way (defaults to "medium" if missing)
  const priority = task.priority ? task.priority : 'medium';
  const priorityEl = document.createElement('span');
  priorityEl.className = 'task-priority task-priority--' + priority;
  priorityEl.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
  textEl.appendChild(priorityEl);

  // Optional: show due date in a subtle way (only if it exists)
  if (task.dueDate) {
    const dueEl = document.createElement('span');
    dueEl.className = 'task-due-date';
    dueEl.textContent = '(due ' + task.dueDate + ')';
    textEl.appendChild(dueEl);
  }

  span.appendChild(textEl);

  // Style completed tasks
  if (task.completed) {
    li.classList.add('completed');
  }

  // Toggle completed status on text click
  span.addEventListener('click', function() {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
  });

  // Button to delete this task
  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';

  // Remove task from array on delete button click
  delBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent toggling task
    tasks.splice(index, 1); // Remove this task
    saveTasks();
    renderTasks();
  });

  li.appendChild(span);
  li.appendChild(delBtn);
  return li;
}

// Helper to check if a task should be shown for the current filter
function matchesCurrentFilter(task) {
  if (currentFilter === 'all') {
    return true;
  }

  if (currentFilter === 'completed') {
    return task.completed;
  }

  if (currentFilter === 'pending') {
    return !task.completed;
  }

  if (currentFilter === 'high') {
    return task.priority === 'high';
  }

  if (currentFilter === 'today') {
    if (!task.dueDate) return false;
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    return task.dueDate === today;
  }

  // Fallback: show task if we don't recognize the filter
  return true;
}

// Render all tasks into the list on the page
function renderTasks() {
  taskList.innerHTML = ''; // Clear old tasks

  // Start from an array of indexes so we can sort and filter
  let indexes = tasks.map(function(_, idx) {
    return idx;
  });

  // 1) Filter indexes based on the current filter
  indexes = indexes.filter(function(i) {
    return matchesCurrentFilter(tasks[i]);
  });

  // 2) Sort the filtered indexes so:
  // - High priority comes first
  // - Then medium, then low
  // - Completed tasks are always at the bottom
  indexes.sort(function(a, b) {
    const taskA = tasks[a];
    const taskB = tasks[b];

    // Completed tasks go after not-completed tasks
    if (!taskA.completed && taskB.completed) return -1;
    if (taskA.completed && !taskB.completed) return 1;

    // Inside the same "completed" group, sort by priority
    const order = { high: 0, medium: 1, low: 2 };
    const prioA = order[taskA.priority] !== undefined ? order[taskA.priority] : 1; // default medium
    const prioB = order[taskB.priority] !== undefined ? order[taskB.priority] : 1;

    if (prioA < prioB) return -1;
    if (prioA > prioB) return 1;

    // If both are the same, keep original order
    return 0;
  });

  // 3) Render tasks in the filtered + sorted order
  indexes.forEach(function(idx) {
    const li = createTaskElement(tasks[idx], idx);
    taskList.appendChild(li);
  });
}

// Helper to create a fully-shaped task object
function createTaskObject(text, dueDate, priority) {
  return {
    id: Date.now().toString() + '-' + Math.random().toString(16).slice(2),
    text: text,
    completed: false,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  };
}

// Add a task by text (reused by manual add + suggested tasks)
// dueDate should be either a date string like "2026-01-20" or null
// priority should be: "high" | "medium" | "low"
function addTaskByText(text, dueDate, priority) {
  const cleaned = String(text || '').trim();
  if (!cleaned) return;

  // Avoid duplicates (same exact text)
  const exists = tasks.some(function(t) {
    return t.text === cleaned;
  });
  if (exists) return;

  // Store dueDate as null if nothing was selected
  const due = dueDate ? dueDate : null;
  tasks.push(createTaskObject(cleaned, due, priority));
  saveTasks();
  renderTasks();
}

// Add a new task when user submits input
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return; // Ignore blank input
  const dueDate = dueDateInput.value ? dueDateInput.value : null;
  const priority = prioritySelect && prioritySelect.value ? prioritySelect.value : 'medium';

  // Reuse shared add logic (handles duplicates + save + render)
  addTaskByText(text, dueDate, priority);

  // Clear input and focus for fast entry
  taskInput.value = '';
  dueDateInput.value = '';
  if (prioritySelect) prioritySelect.value = 'medium';
  taskInput.focus();
}

// Add some suggested tasks if not already in the list
function addSuggestedTasks() {
  const suggested = [
    'Morning exercise',
    'Study for 1 hour',
    'Drink enough water',
  ];

  // Reuse shared add logic for each suggestion
  suggested.forEach(function(s) {
    addTaskByText(s, null, 'medium');
  });
}

// Function to suggest tasks
function suggestTasks() {
    const tasks = [
        'Complete project documentation',
        'Fix bugs in the login module',
        'Refactor the task manager code',
        'Plan the next sprint',
        'Review pull requests',
    ];

    const suggestedTasksDiv = document.getElementById('suggestedTasks');
    suggestedTasksDiv.innerHTML = ''; // Clear previous suggestions

    tasks.forEach(task => {
        const taskItem = document.createElement('div');
        taskItem.textContent = task;
        suggestedTasksDiv.appendChild(taskItem);
    });
}

// --- Attach event handlers ---

// Filter buttons: update currentFilter and re-render
filterButtons.forEach(function(btn) {
  btn.addEventListener('click', function() {
    const selected = btn.getAttribute('data-filter');
    currentFilter = selected || 'all';

    // Update active button styling
    filterButtons.forEach(function(b) {
      b.classList.remove('filter-btn--active');
    });
    btn.classList.add('filter-btn--active');

    // Re-render with the new filter
    renderTasks();
  });
});

// Button to add task
addTaskBtn.addEventListener('click', addTask);

// Button to add suggested tasks
suggestBtn.addEventListener('click', addSuggestedTasks);
document.getElementById('suggestTasksButton').addEventListener('click', suggestTasks);

// Allow pressing Enter in text input to add task
taskInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    addTask();
  }
});

// Load tasks from localStorage & render at startup
loadTasks();
