let draggedTask = null;
let selectedPriority = "Low";

document.addEventListener("DOMContentLoaded", loadTasks);

/* SEARCH */
function searchTasks(query) {
  query = query.toLowerCase();
  document.querySelectorAll(".task").forEach(task => {
    const text = task.querySelector(".task-text").textContent.toLowerCase();
    task.style.display = text.includes(query) ? "flex" : "none";
  });
}

/* INLINE INPUT */
function showInput(status) {
  document.getElementById(`input-${status}`).style.display = "block";
}

function hideInput(status) {
  document.getElementById(`input-${status}`).style.display = "none";
  selectedPriority = "Low";
}

/* PRIORITY */
function setPriority(btn) {
  const parent = btn.parentElement;
  parent.querySelectorAll("button").forEach(b => b.className = "");
  btn.classList.add("active", btn.dataset.priority.toLowerCase());
  selectedPriority = btn.dataset.priority;
}

/* ADD TASK */
function addTaskInline(status) {
  const box = document.getElementById(`input-${status}`);
  const input = box.querySelector("input");
  if (!input.value.trim()) return;

  const task = createTask(input.value, selectedPriority);
  document.getElementById(status).appendChild(task);

  input.value = "";
  hideInput(status);
  saveTasks();
}

/* CREATE TASK */
function createTask(text, priority) {
  const task = document.createElement("div");
  task.className = "task";
  task.draggable = true;

  task.innerHTML = `
    <div class="task-content">
      <span class="task-text">${text}</span>
      <span class="badge ${priority.toLowerCase()}">${priority}</span>
    </div>
    <button class="delete-btn">✕</button>
  `;

  task.addEventListener("dragstart", () => draggedTask = task);
  task.addEventListener("dragend", () => saveTasks());

  task.querySelector(".delete-btn").onclick = () => {
    task.remove();
    saveTasks();
  };

  task.querySelector(".task-text").ondblclick = () => {
    const updated = prompt("Edit task", text);
    if (updated) {
      task.querySelector(".task-text").textContent = updated;
      saveTasks();
    }
  };

  return task;
}

/* DRAG & DROP */
document.querySelectorAll(".task-list").forEach(list => {
  list.addEventListener("dragover", e => e.preventDefault());

  list.addEventListener("drop", () => {
    if (draggedTask) {
      list.appendChild(draggedTask);

      // 🎉 CONFETTI if moved to DONE
      if (list.id === "done") {
        launchConfetti();
      }

      saveTasks();
    }
  });
});

/* STORAGE */
function saveTasks() {
  const data = {};
  document.querySelectorAll(".task-list").forEach(list => {
    data[list.id] = [];
    list.querySelectorAll(".task").forEach(task => {
      data[list.id].push({
        text: task.querySelector(".task-text").textContent,
        priority: task.querySelector(".badge").textContent
      });
    });
  });
  localStorage.setItem("kanbanUI", JSON.stringify(data));
}

function loadTasks() {
  const data = JSON.parse(localStorage.getItem("kanbanUI"));
  if (!data) return;
  Object.keys(data).forEach(id => {
    data[id].forEach(t =>
      document.getElementById(id).appendChild(createTask(t.text, t.priority))
    );
  });
}

function launchConfetti() {
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#a5b4fc", "#fbcfe8", "#bbf7d0", "#fde68a"]
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "kanbanTheme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const theme = localStorage.getItem("kanbanTheme");
  if (theme === "dark") document.body.classList.add("dark");
});