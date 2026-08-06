// App State
let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || [
  { id: '1', text: 'Review Data Structures notes', status: 'todo' },
  { id: '2', text: 'Build HTML5 Kanban board', status: 'in-progress' },
  { id: '3', text: 'Set up GitHub Repo', status: 'completed' }
];

// DOM Elements
const taskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const taskLists = document.querySelectorAll('.task-list');

// Save State to LocalStorage
function saveTasks() {
  localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
  updateTaskCounts();
}

// Update Header Badges
function updateTaskCounts() {
  ['todo', 'in-progress', 'completed'].forEach(status => {
    const countEl = document.getElementById(`count-${status}`);
    if (countEl) {
      countEl.textContent = tasks.filter(t => t.status === status).length;
    }
  });
}

// Create Card Element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.setAttribute('draggable', 'true');
  card.dataset.id = task.id;

  card.innerHTML = `
    <span class="task-text">${escapeHTML(task.text)}</span>
    <div class="task-actions">
      <button class="action-btn edit" title="Edit Task">✏️</button>
      <button class="action-btn delete" title="Delete Task">🗑️</button>
    </div>
  `;

  // Drag Events on Card
  card.addEventListener('dragstart', (e) => {
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', task.id);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  // Action Events (Edit / Delete)
  const editBtn = card.querySelector('.edit');
  const deleteBtn = card.querySelector('.delete');

  editBtn.addEventListener('click', () => editTask(task.id, card));
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  return card;
}

// Render All Cards
function renderBoard() {
  taskLists.forEach(list => list.innerHTML = '');

  tasks.forEach(task => {
    const listEl = document.getElementById(task.status);
    if (listEl) {
      listEl.appendChild(createTaskCard(task));
    }
  });

  updateTaskCounts();
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    status: 'todo'
  };

  tasks.push(newTask);
  saveTasks();
  renderBoard();
  taskInput.value = '';
});

// Edit Task
function editTask(id, cardEl) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const textSpan = cardEl.querySelector('.task-text');
  const newText = prompt('Edit your task:', task.text);

  if (newText !== null && newText.trim() !== '') {
    task.text = newText.trim();
    saveTasks();
    textSpan.textContent = task.text;
  }
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderBoard();
}

// Setup Drag & Drop Zone Listeners
taskLists.forEach(list => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necessary to allow dropping
    list.classList.add('drag-over');
  });

  list.addEventListener('dragleave', () => {
    list.classList.remove('drag-over');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    list.classList.remove('drag-over');

    const taskId = e.dataTransfer.getData('text/plain');
    const targetStatus = list.id;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      task.status = targetStatus;
      saveTasks();
      renderBoard();
    }
  });
});

// Helper to sanitize inputs
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Run
renderBoard();
