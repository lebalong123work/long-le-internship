import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskDone,
  deleteAllTasks,
  getAggregationData,
} from "./taskLogic.js";

import {
  toggleTimer,
  setTimerCallback,
  setMode,
  setTimerCompleteCallback,
} from "./timerLogic.js";
let editingTaskId = null;

// Timer UI
const timeDisplay = document.getElementById("timeDisplay");
const startTimerBtn = document.getElementById("startTimerBtn");
const pomoBtn = document.getElementById("pomoBtn");
const shortBreakBtn = document.getElementById("shortBreakBtn");
const longBreakBtn = document.getElementById("longBreakBtn");

// Task UI
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

const actionGroup = document.querySelector(".action-group");

const deleteAllBtn = document.getElementById("deleteAllBtn");
const deleteTaskBtn = document.getElementById("deleteTaskBtn");
const taskDropdownBtn = document.getElementById("taskDropdownBtn");
const taskDropdownMenu = document.getElementById("taskDropdownMenu");

//Summary Board UI
const summaryBoard = document.getElementById("summaryBoard");
const actCountUI = document.getElementById("actCount");
const estCountUI = document.getElementById("estCount");
const finishTimeUI = document.getElementById("finishTime");

// UI list
function renderTasks() {
  if (taskListUI.contains(taskFormContainer)) {
    actionGroup.after(taskFormContainer);
    taskFormContainer.classList.add("hidden");
    actionGroup.classList.remove("hidden");
  }

  taskListUI.innerHTML = "";
  const currentTasks = getTasks();

  if (currentTasks.length === 0) {
    summaryBoard.classList.add("hidden");
  } else {
    summaryBoard.classList.remove("hidden");
  }

  const template = document.getElementById("taskTemplate");

  currentTasks.forEach((task) => {
    const clone = template.content.cloneNode(true);
    const li = clone.querySelector("li");

    if (task.isDone) li.classList.add("task-done");

    li.querySelector(".task-name").textContent = task.name;
    li.querySelector(".task-pomos").textContent = `${task.act} / ${task.est}`;

    const checkBtn = li.querySelector(".task-check-btn");
    checkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleTaskDone(task.id);
      renderTasks();
    });

    const editBtn = li.querySelector(".task-edit-btn");

    const openEditForm = (e) => {
      document.querySelectorAll(".task-item").forEach((item) => {
        item.classList.remove("hidden");
      });

      e.stopPropagation();
      editingTaskId = task.id;
      formTitle.textContent = "Edit Task";
      taskNameInput.value = task.name;
      estPomodorosInput.value = task.est;
      actPomodorosInput.value = task.act;

      actPomodorosContainer.classList.remove("hidden");
      if (deleteTaskBtn) deleteTaskBtn.classList.remove("hidden");

      li.after(taskFormContainer);

      li.classList.add("hidden");

      actionGroup.classList.remove("hidden");

      taskFormContainer.classList.remove("hidden");
      taskNameInput.focus();
    };

    editBtn.addEventListener("click", openEditForm);
    li.addEventListener("click", openEditForm);

    taskListUI.appendChild(clone);
  });

  updateAggregationUI();
}

function updateAggregationUI() {
  const data = getAggregationData();
  actCountUI.textContent = data.totalAct;
  estCountUI.textContent = data.totalEst;
  finishTimeUI.textContent = data.finishAt || "--:--";
}

function initTimerEvents() {
  setTimerCallback((timeString) => {
    timeDisplay.textContent = timeString;
  });

  setTimerCompleteCallback(() => {
    startTimerBtn.textContent = "START";
    alert("Time up, task completed");
  });

  startTimerBtn.addEventListener("click", () => {
    const isNowRunning = toggleTimer();
    if (isNowRunning) {
      startTimerBtn.textContent = "PAUSE";
    } else {
      startTimerBtn.textContent = "START";
    }
  });

  function updateActiveButton(clickedBtn) {
    pomoBtn.classList.remove("active");
    shortBreakBtn.classList.remove("active");
    longBreakBtn.classList.remove("active");
    clickedBtn.classList.add("active");
    startTimerBtn.textContent = "START";
  }

  pomoBtn.addEventListener("click", () => {
    updateActiveButton(pomoBtn);
    setMode(25);
  });
  shortBreakBtn.addEventListener("click", () => {
    updateActiveButton(shortBreakBtn);
    setMode(5);
  });
  longBreakBtn.addEventListener("click", () => {
    updateActiveButton(longBreakBtn);
    setMode(15);
  });
}

function initTaskEvents() {
  showTaskFormBtn.addEventListener("click", () => {
    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("hidden");
    });

    editingTaskId = null;
    formTitle.textContent = "Add Task";
    taskNameInput.value = "";
    estPomodorosInput.value = 1;

    actPomodorosContainer.classList.add("hidden");
    if (deleteTaskBtn) deleteTaskBtn.classList.add("hidden");

    actionGroup.after(taskFormContainer);

    actionGroup.classList.add("hidden");
    taskFormContainer.classList.remove("hidden");
    taskNameInput.focus();
  });

  cancelTaskBtn.addEventListener("click", () => {
    actionGroup.after(taskFormContainer);

    taskFormContainer.classList.add("hidden");
    actionGroup.classList.remove("hidden");

    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("hidden");
    });
  });

  taskFormContainer.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameVal = taskNameInput.value;
    const estVal = estPomodorosInput.value;
    const actVal = actPomodorosInput.value;

    if (editingTaskId) {
      const success = editTask(editingTaskId, nameVal, actVal, estVal);
      if (success) {
        editingTaskId = null;
      }
    } else {
      const newTask = addTask(nameVal, estVal);
      if (newTask) {
        taskNameInput.value = "";
        estPomodorosInput.value = 1;
        taskNameInput.focus();
      }
    }
    renderTasks();
  });

  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener("click", () => {
      if (editingTaskId) {
        const success = deleteTask(editingTaskId);
        if (success) {
          editingTaskId = null;
          renderTasks();
        }
      }
    });
  }

  if (taskDropdownBtn && taskDropdownMenu) {
    taskDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      taskDropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (
        !taskDropdownMenu.classList.contains("hidden") &&
        !taskDropdownMenu.contains(e.target) &&
        !taskDropdownBtn.contains(e.target)
      ) {
        taskDropdownMenu.classList.add("hidden");
      }
    });
  }

  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all tasks?")) {
        deleteAllTasks();
        if (taskDropdownMenu) {
          taskDropdownMenu.classList.add("hidden");
        }
        renderTasks();
      }
    });
  }

  renderTasks();
}

export function initUI() {
  initTimerEvents();
  initTaskEvents();
  renderTasks();
}
