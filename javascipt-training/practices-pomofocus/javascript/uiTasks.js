import { DOM } from "./dom.js";
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
let selectedTaskId = null;

export function getSelectedTaskId() {
  return selectedTaskId;
}

export function updateAggregationUI() {
  const data = getAggregationData();
  DOM.actCount.textContent = data.totalAct;
  DOM.estCount.textContent = data.totalEst;
  DOM.finishTime.textContent = data.finishAt || "--:--";
}

export function renderTasks() {
  DOM.taskList.innerHTML = "";
  const currentTasks = getTasks();

  if (currentTasks.length === 0) {
    DOM.summaryBoard.classList.add("hidden");
  } else {
    DOM.summaryBoard.classList.remove("hidden");
  }

  currentTasks.forEach((task) => {
    const clone = DOM.taskTemplate.content.cloneNode(true);
    const li = clone.querySelector("li");

    if (task.isDone) li.classList.add("task-done");
    if (task.id === selectedTaskId) li.classList.add("active-task");

    li.querySelector(".task-name").textContent = task.name;
    li.querySelector(".task-pomos").textContent = `${task.act} / ${task.est}`;

    const checkBtn = li.querySelector(".task-check-btn");
    checkBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const success = await toggleTaskDone(task.id);
      if (success) renderTasks();
    });

    const editBtn = li.querySelector(".task-edit-btn");
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document
        .querySelectorAll(".task-item")
        .forEach((item) => item.classList.remove("hidden"));

      editingTaskId = task.id;
      DOM.formTitle.textContent = "Edit Task";
      DOM.taskNameInput.value = task.name;
      DOM.estPomodorosInput.value = task.est;
      DOM.actPomodorosInput.value = task.act;

      DOM.actPomodorosContainer.classList.remove("hidden");
      if (DOM.deleteTaskBtn) DOM.deleteTaskBtn.classList.remove("hidden");

      li.after(DOM.taskFormContainer);
      li.classList.add("hidden");

      DOM.actionGroup.classList.remove("hidden");
      DOM.taskFormContainer.classList.remove("hidden");
      DOM.taskNameInput.focus();
    });

    li.addEventListener("click", () => {
      if (selectedTaskId === task.id) {
        selectedTaskId = null;
        DOM.currentTaskMessage.textContent = "Time to focus!";
      } else {
        selectedTaskId = task.id;
        DOM.currentTaskMessage.textContent = task.name;
      }
      renderTasks();
    });

    DOM.taskList.appendChild(clone);
  });

  updateAggregationUI();
}

export function initTaskEvents() {
  DOM.showTaskFormBtn.addEventListener("click", () => {
    document
      .querySelectorAll(".task-item")
      .forEach((item) => item.classList.remove("hidden"));
    editingTaskId = null;
    DOM.formTitle.textContent = "Add Task";
    DOM.taskNameInput.value = "";
    DOM.estPomodorosInput.value = 1;
    DOM.actPomodorosContainer.classList.add("hidden");
    if (DOM.deleteTaskBtn) DOM.deleteTaskBtn.classList.add("hidden");

    DOM.actionGroup.after(DOM.taskFormContainer);
    DOM.actionGroup.classList.add("hidden");
    DOM.taskFormContainer.classList.remove("hidden");
    DOM.taskNameInput.focus();
  });

  DOM.cancelTaskBtn.addEventListener("click", () => {
    DOM.actionGroup.after(DOM.taskFormContainer);
    DOM.taskFormContainer.classList.add("hidden");
    DOM.actionGroup.classList.remove("hidden");
    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("hidden");
    });
  });

  DOM.taskFormContainer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nameVal = DOM.taskNameInput.value;
    const estVal = DOM.estPomodorosInput.value;
    const actVal = DOM.actPomodorosInput.value;

    if (editingTaskId) {
      const success = await editTask(editingTaskId, nameVal, actVal, estVal);
      if (success) {
        editingTaskId = null;
        DOM.actionGroup.after(DOM.taskFormContainer);
        DOM.taskFormContainer.classList.add("hidden");
        DOM.actionGroup.classList.remove("hidden");
      }
    } else {
      const newTask = await addTask(nameVal, estVal);
      if (newTask) {
        DOM.taskNameInput.value = "";
        DOM.estPomodorosInput.value = 1;
        DOM.taskNameInput.focus();
      }
    }

    renderTasks();
  });

  if (DOM.deleteTaskBtn) {
    DOM.deleteTaskBtn.addEventListener("click", async () => {
      if (editingTaskId) {
        const success = await deleteTask(editingTaskId);
        if (success) {
          editingTaskId = null;
          renderTasks();
        }
      }
    });
  }

  if (DOM.taskDropdownBtn && DOM.taskDropdownMenu) {
    DOM.taskDropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.taskDropdownMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (
        !DOM.taskDropdownMenu.classList.contains("hidden") &&
        !DOM.taskDropdownMenu.contains(e.target) &&
        !DOM.taskDropdownBtn.contains(e.target)
      ) {
        DOM.taskDropdownMenu.classList.add("hidden");
      }
    });
  }

  if (DOM.deleteAllBtn) {
    DOM.deleteAllBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete all tasks?")) {
        const success = await deleteAllTasks();
        if (success) {
          if (DOM.taskDropdownMenu)
            DOM.taskDropdownMenu.classList.add("hidden");
          renderTasks();
        }
      }
    });
  }
}
