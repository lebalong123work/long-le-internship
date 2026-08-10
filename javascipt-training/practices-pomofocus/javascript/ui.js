import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskDone,
  deleteAllTasks,
  getAggregationData,
  initTasksData,
} from "./taskLogic.js";

import {
  toggleTimer,
  setTimerCallback,
  setMode,
  setTimerCompleteCallback,
} from "./timerLogic.js";

let editingTaskId = null;

let selectedTaskId = null;

const actionGroup = document.querySelector(".action-group");

const currentTaskMessage = document.getElementById("currentTaskMessage");

// UI list
function renderTasks() {
  if (taskList.contains(taskFormContainer)) {
    actionGroup.after(taskFormContainer);
    taskFormContainer.classList.add("hidden");
    actionGroup.classList.remove("hidden");
  }

  taskList.innerHTML = "";
  const currentTasks = getTasks();

  if (currentTasks.length === 0) {
    summaryBoard.classList.add("hidden");
  } else {
    summaryBoard.classList.remove("hidden");
  }

  currentTasks.forEach((task) => {
    const clone = taskTemplate.content.cloneNode(true);

    const li = clone.querySelector("li");

    if (task.isDone) li.classList.add("task-done");

    if (task.id === selectedTaskId) {
      li.classList.add("active-task");
    }

    li.querySelector(".task-name").textContent = task.name;
    li.querySelector(".task-pomos").textContent = `${task.act} / ${task.est}`;

    const checkBtn = li.querySelector(".task-check-btn");
    checkBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const success = await toggleTaskDone(task.id);
      if (success) {
        renderTasks();
      }
    });

    const editBtn = li.querySelector(".task-edit-btn");

    const openEditForm = (e) => {

      e.stopPropagation();
      document.querySelectorAll(".task-item").forEach((item) => {
        item.classList.remove("hidden");
      });

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

    li.addEventListener("click", () => {
      if (selectedTaskId === task.id) {
        selectedTaskId = null;
        currentTaskMessage.textContent = "Time to focus!";
      } else {
        selectedTaskId = task.id;
        currentTaskMessage.textContent = task.name;
      }
      renderTasks();
    });

    taskList.appendChild(clone);
  });

  updateAggregationUI();
}

function updateAggregationUI() {
  const data = getAggregationData();

  actCount.textContent = data.totalAct;
  estCount.textContent = data.totalEst;
  finishTime.textContent = data.finishAt || "--:--";
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

  taskFormContainer.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameVal = taskNameInput.value;
    const estVal = estPomodorosInput.value;
    const actVal = actPomodorosInput.value;

    if (editingTaskId) {
      const success = await editTask(editingTaskId, nameVal, actVal, estVal);
      if (success) {
        editingTaskId = null;
      } else {
        return;
      }
    } else {
      const newTask = await addTask(nameVal, estVal);
      if (newTask) {
        taskNameInput.value = "";
        estPomodorosInput.value = 1;
        taskNameInput.focus();
      } else {
        return;
      }
    }
    renderTasks();
  });

  if (deleteTaskBtn) {
    deleteTaskBtn.addEventListener("click", async () => {
      if (editingTaskId) {
        const success = await deleteTask(editingTaskId);
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
    deleteAllBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete all tasks?")) {
        const success = await deleteAllTasks();
        if (success) {
          if (taskDropdownMenu) {
            taskDropdownMenu.classList.add("hidden");
          }
          renderTasks();
        }
      }
    });
  }

  renderTasks();
}

export async function initUI() {
  initTimerEvents();
  initTaskEvents();
  await initTasksData();
  renderTasks();
}
