import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskDone,
  deleteAllTasks,
  getAggregationData,
} from "./taskLogic.js";

let editingTaskId = null;

const showTaskFormBtn = document.getElementById("showTaskFormBtn");
const taskFormContainer = document.getElementById("taskFormContainer");
const formTitle = document.getElementById("formTitle");
const taskNameInput = document.getElementById("taskNameInput");
const estPomodorosInput = document.getElementById("estPomodorosInput");
const actPomodorosContainer = document.getElementById("actPomodorosContainer");
const actPomodorosInput = document.getElementById("actPomodorosInput");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskListUI = document.getElementById("taskList");
const deleteAllBtn = document.getElementById("deleteAllBtn");

// Elements cho Aggregation
const actCountUI = document.getElementById("actCount");
const estCountUI = document.getElementById("estCount");
const finishTimeUI = document.getElementById("finishTime");

// UI list
function renderTasks() {
  taskListUI.innerHTML = "";
  const currentTasks = getTasks();

  currentTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    if (task.isDone) li.classList.add("task-done");

    // Checkbox Done
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.isDone;
    checkbox.addEventListener("change", () => {
      toggleTaskDone(task.id);
      renderTasks();
    });

    // Task Name
    const nameSpan = document.createElement("span");
    nameSpan.className = "task-name";
    nameSpan.textContent = task.name;
    nameSpan.style.flex = "1";

    //Act / Est Count
    const countSpan = document.createElement("span");
    countSpan.textContent = `${task.act} / ${task.est}`;
    countSpan.style.fontWeight = "bold";

    // Edit Button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      editingTaskId = task.id;
      formTitle.textContent = "Edit Task";
      taskNameInput.value = task.name;
      estPomodorosInput.value = task.est;
      actPomodorosInput.value = task.act;
      actPomodorosContainer.classList.remove("hidden");
      taskFormContainer.classList.remove("hidden");
    });

    //Delete Button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(nameSpan);
    li.appendChild(countSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    taskListUI.appendChild(li);
  });

  updateAggregationUI();
}

function updateAggregationUI() {
  const data = getAggregationData();
  actCountUI.textContent = data.totalAct;
  estCountUI.textContent = data.totalEst;
  finishTimeUI.textContent = data.finishAt || "--:--";
}

export function initUI() {
  showTaskFormBtn.addEventListener("click", () => {
    editingTaskId = null;
    formTitle.textContent = "Add Task";
    taskNameInput.value = "";
    estPomodorosInput.value = 1;
    actPomodorosContainer.classList.add("hidden");
    taskFormContainer.classList.remove("hidden");
  });

  cancelTaskBtn.addEventListener("click", () => {
    taskFormContainer.classList.add("hidden");
  });

  saveTaskBtn.addEventListener("click", () => {
    const nameVal = taskNameInput.value;
    const estVal = estPomodorosInput.value;
    const actVal = actPomodorosInput.value;

    if (editingTaskId) {
      const success = editTask(editingTaskId, nameVal, actVal, estVal);
      if (success) taskFormContainer.classList.add("hidden");
    } else {
      const newTask = addTask(nameVal, estVal);
      if (newTask) taskFormContainer.classList.add("hidden");
    }
    renderTasks();
  });

  deleteAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
      deleteAllTasks();
      renderTasks();
    }
  });

  renderTasks();
}
