import { getTasks, addTask } from "./data.js";

const showTaskFormBtn = document.getElementById("showTaskFormBtn");
const taskFormContainer = document.getElementById("taskFormContainer");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const estPomodorosInput = document.getElementById("estPomodorosInput");
const taskList = document.getElementById("taskList");

export const renderTasks = () => {
  taskList.innerHTML = "";
  const tasks = getTasks();

  tasks.forEach((task) => {
    const liElement = document.createElement("li");
    liElement.textContent = `${task.name} (Est: ${task.est} | Act: ${task.act})`;
    taskList.appendChild(liElement);
  });
};

// Hide/Show Forms

export const initFormListeners = () => {
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

  saveTaskBtn.addEventListener("click", () => {
    const taskName = taskNameInput.value.trim();
    const estPomodoros = Number.parseInt(estPomodorosInput.value);

    if (taskName === "") {
      alert("Please enter a task name!");
      return;
    }

    addTask(taskName, estPomodoros);
    renderTasks();

    taskFormContainer.style.display = "none";
    showTaskFormBtn.style.display = "block";
    taskNameInput.value = "";
    estPomodorosInput.value = "1";
  });
};
