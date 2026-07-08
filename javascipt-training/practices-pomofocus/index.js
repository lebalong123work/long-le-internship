const showTaskFormBtn = document.getElementById("showTaskFormBtn");
const taskFormContainer = document.getElementById("taskFormContainer");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const estPomodorosInput = document.getElementById("estPomodorosInput");
const taskList = document.getElementById("taskList");

let tasks = [];

// Hide/Show Forms
taskFormContainer.style.display = "none";

showTaskFormBtn.addEventListener("click", () => {
  showTaskFormBtn.style.display = "none";
  taskFormContainer.style.display = "block";
});

cancelTaskBtn.addEventListener("click", () => {
  taskFormContainer.style.display = "none";
  showTaskFormBtn.style.display = "block";

  taskNameInput.value = "";
  estPomodorosInput.value = "1";
});

//  Update UI

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const liElement = document.createElement("li");

    liElement.textContent = `${task.name} (Est: ${task.est} | Act: ${task.act})`;

    taskList.appendChild(liElement);
  });
}

// Save New Task
saveTaskBtn.addEventListener("click", () => {
  const taskName = taskNameInput.value.trim();
  const estPomodoros = parseInt(estPomodorosInput.value);

  if (taskName === "") {
    alert("Please enter a task name!");
    return;
  }

  const newId = crypto.randomUUID(); // Random ID

  const newTask = {
    id: newId,
    name: taskName,
    est: estPomodoros,
    act: 0,
    isDone: false,
  };

  tasks.push(newTask);

  renderTasks();

  console.log("Current Tasks List:", tasks); // Check

  taskFormContainer.style.display = "none";
  showTaskFormBtn.style.display = "block";

  taskNameInput.value = "";
  estPomodorosInput.value = "1";
});
