// ------------------- Data Setup -------------------
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let selectedDate = new Date().toISOString().split('T')[0]; // default: today

const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const progressText = document.getElementById('progressText');
const selectedDateEl = document.getElementById('selectedDate');
const calendarEl = document.getElementById('calendar');

// Track current month/year for navigation
let currentYear = new Date(selectedDate).getFullYear();
let currentMonth = new Date(selectedDate).getMonth(); // 0 = Jan

// ------------------- Helper Functions -------------------
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksForDate(date) {
  return tasks.filter(task => task.completedDays?.includes(date) || task.addedDate === date);
}

function calculateProgress(date) {
  const dailyTasks = tasks.filter(task => task.addedDate === date);
  if (dailyTasks.length === 0) return 0;
  const completed = dailyTasks.filter(task => task.completedDays?.includes(date)).length;
  return Math.round((completed / dailyTasks.length) * 100);
}

function getShadeFromPercentage(percent) {
  // Lightness goes from 90% (low) to 50% (high)
  return `hsl(340, 70%, ${90 - (percent * 0.4)}%)`;
}

// ------------------- Task Functions -------------------
function addTask() {
  const name = taskInput.value.trim();
  if (!name) return;

  tasks.push({
    name,
    addedDate: selectedDate,
    completedDays: []
  });

  taskInput.value = '';
  saveTasks();
  renderTasks();
  renderCalendar();
}

function toggleComplete(index) {
  const task = getTasksForDate(selectedDate)[index];
  if (!task.completedDays) task.completedDays = [];

  if (task.completedDays.includes(selectedDate)) {
    task.completedDays = task.completedDays.filter(d => d !== selectedDate);
  } else {
    task.completedDays.push(selectedDate);
  }

  saveTasks();
  renderTasks();
  renderCalendar();
}

// ------------------- Calendar Render -------------------
function renderTasks() {
  const dailyTasks = getTasksForDate(selectedDate);
  taskList.innerHTML = '';
  dailyTasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.textContent = task.name;
    if (task.completedDays.includes(selectedDate)) li.classList.add('completed');

    const btn = document.createElement('button');
    btn.textContent = task.completedDays.includes(selectedDate) ? 'Undo' : 'Done';
    btn.classList.add('complete-btn');
    btn.onclick = () => toggleComplete(index);

    li.appendChild(btn);
    taskList.appendChild(li);
  });

  const total = dailyTasks.length;
  const completed = dailyTasks.filter(t => t.completedDays.includes(selectedDate)).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressText.textContent = `Tasks completed: ${completed} / ${total} (${percent}%)`;
  selectedDateEl.textContent = selectedDate;
}

function renderCalendar() {
  calendarEl.innerHTML = '';
  const monthYearEl = document.getElementById('monthYear');
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  monthYearEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Empty slots before first day
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    calendarEl.appendChild(empty);
  }

  // Days
  for (let d = 1; d <= totalDays; d++) {
    const dayDate = new Date(currentYear, currentMonth, d).toISOString().split('T')[0];
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    dayDiv.textContent = d;

    const percent = calculateProgress(dayDate);
    dayDiv.style.backgroundColor = getShadeFromPercentage(percent);

    if (dayDate === selectedDate) dayDiv.classList.add('selected');

    dayDiv.onclick = () => {
      selectedDate = dayDate;
      renderTasks();
      renderCalendar();
    };

    calendarEl.appendChild(dayDiv);
  }
}

// ------------------- Month Navigation -------------------
function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

// ------------------- Initial Render -------------------
renderCalendar();
renderTasks();
