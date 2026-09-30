import { DOM } from "@/ui/dom";
import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskDone,
  deleteAllTasks,
  getSummaryData,
  Task,
  SummaryData,
} from "@/logic/taskLogic";
import { withButtonLoading } from "@/ui/uiButtonState";

let editingTaskId: string | null = null;

export function hideTaskForm(): void {
  if (DOM.actionGroup !== null && DOM.taskFormContainer !== null) {
    DOM.actionGroup.after(DOM.taskFormContainer);
    DOM.taskFormContainer.classList.add("hidden");
    DOM.actionGroup.classList.remove("hidden");
  }
  document.querySelectorAll(".task-item").forEach((item) => {
    item.classList.remove("hidden");
  });
}

export function openAddTaskForm(): void {
  hideTaskForm();

  editingTaskId = null;
  if (DOM.formTitle !== null) {
    DOM.formTitle.textContent = "Add Task";
  }
  if (DOM.taskNameInput !== null) {
    DOM.taskNameInput.value = "";
  }
  if (DOM.estPomodorosInput !== null) {
    DOM.estPomodorosInput.value = "1";
  }

  if (DOM.actPomodorosContainer !== null) {
    DOM.actPomodorosContainer.classList.add("hidden");
  }
  if (DOM.deleteTaskBtn !== null) {
    DOM.deleteTaskBtn.classList.add("hidden");
  }

  if (DOM.actionGroup !== null) {
    DOM.actionGroup.classList.add("hidden");
  }
  if (DOM.taskFormContainer !== null) {
    DOM.taskFormContainer.classList.remove("hidden");
  }

  if (DOM.taskNameInput !== null) {
    DOM.taskNameInput.focus();
  }
}

export function openEditTaskForm(task: Task, liElement: HTMLLIElement): void {
  hideTaskForm();

  editingTaskId = task.id;
  if (DOM.formTitle !== null) {
    DOM.formTitle.textContent = "Edit Task";
  }
  if (DOM.taskNameInput !== null) {
    DOM.taskNameInput.value = task.name;
  }
  if (DOM.estPomodorosInput !== null) {
    DOM.estPomodorosInput.value = String(task.est);
  }
  if (DOM.actPomodorosInput !== null) {
    DOM.actPomodorosInput.value = String(task.act);
  }

  if (DOM.actPomodorosContainer !== null) {
    DOM.actPomodorosContainer.classList.remove("hidden");
  }
  if (DOM.deleteTaskBtn !== null) {
    DOM.deleteTaskBtn.classList.remove("hidden");
  }

  if (DOM.taskFormContainer !== null) {
    liElement.after(DOM.taskFormContainer);
    liElement.classList.add("hidden");
    DOM.taskFormContainer.classList.remove("hidden");
  }

  if (DOM.taskNameInput !== null) {
    DOM.taskNameInput.focus();
  }
}

let selectedTaskId: string | null = null;

export function getSelectedTaskId(): string | null {
  return selectedTaskId;
}

export function updateSummaryUI(): void {
  const data: SummaryData = getSummaryData();
  if (DOM.actCount !== null) {
    DOM.actCount.textContent = String(data.totalAct);
  }
  if (DOM.estCount !== null) {
    DOM.estCount.textContent = String(data.totalEst);
  }
  if (DOM.finishTime !== null) {
    DOM.finishTime.textContent = data.finishAt || "--:--";
  }
}

function updateTaskListSummary(): void {
  if (DOM.summaryBoard !== null) {
    DOM.summaryBoard.classList.toggle("hidden", getTasks().length === 0);
  }
  updateSummaryUI();
}

function updateSelectedTaskUI(task: Task | undefined): void {
  if (DOM.taskList !== null) {
    DOM.taskList.querySelectorAll<HTMLLIElement>(".task-item").forEach((item) => {
      const isSelected = item.dataset.taskId === selectedTaskId;
      item.classList.toggle("active-task", isSelected);

      const selectButton = item.querySelector<HTMLButtonElement>(
        ".task-select-btn",
      );
      if (selectButton !== null) {
        selectButton.setAttribute("aria-pressed", String(isSelected));
      }
    });
  }

  if (DOM.currentTaskMessage !== null) {
    DOM.currentTaskMessage.textContent = task?.name ?? "Time to focus!";
  }
}

function findTaskElement(taskId: string): HTMLLIElement | null {
  if (DOM.taskList === null) return null;

  for (const taskElement of DOM.taskList.querySelectorAll<HTMLLIElement>(
    ".task-item",
  )) {
    if (taskElement.dataset.taskId === taskId) {
      return taskElement;
    }
  }

  return null;
}

function updateTaskElement(taskElement: HTMLLIElement, task: Task): void {
  taskElement.classList.toggle("task-done", task.isDone);
  taskElement.classList.toggle("active-task", task.id === selectedTaskId);

  const taskNameElement = taskElement.querySelector<HTMLSpanElement>(".task-name");
  if (taskNameElement !== null) {
    taskNameElement.textContent = task.name;
  }

  const taskPomosElement =
    taskElement.querySelector<HTMLSpanElement>(".task-pomos");
  if (taskPomosElement !== null) {
    taskPomosElement.textContent = `${task.act} / ${task.est}`;
  }

  const checkButton =
    taskElement.querySelector<HTMLButtonElement>(".task-check-btn");
  if (checkButton !== null) {
    checkButton.setAttribute("aria-label", `Toggle completion for ${task.name}`);
    checkButton.setAttribute("aria-pressed", String(task.isDone));
  }

  const editButton =
    taskElement.querySelector<HTMLButtonElement>(".task-edit-btn");
  if (editButton !== null) {
    editButton.setAttribute("aria-label", `Edit task ${task.name}`);
  }

  const selectButton =
    taskElement.querySelector<HTMLButtonElement>(".task-select-btn");
  if (selectButton !== null) {
    selectButton.setAttribute(
      "aria-pressed",
      String(task.id === selectedTaskId),
    );
  }

  if (selectedTaskId === task.id && DOM.currentTaskMessage !== null) {
    DOM.currentTaskMessage.textContent = task.name;
  }
}

function createTaskElement(task: Task): HTMLLIElement | null {
  if (DOM.taskTemplate === null) return null;

  const clone = DOM.taskTemplate.content.cloneNode(true);
  if (!(clone instanceof DocumentFragment)) return null;

  const taskElement = clone.querySelector<HTMLLIElement>("li");
  if (taskElement === null) return null;

  taskElement.dataset.taskId = task.id;
  updateTaskElement(taskElement, task);

  const checkButton =
    taskElement.querySelector<HTMLButtonElement>(".task-check-btn");
  if (checkButton !== null) {
    checkButton.addEventListener("click", async (event): Promise<void> => {
      event.stopPropagation();
      const success = await toggleTaskDone(task.id);
      if (!success) return;

      const updatedTask = getTasks().find((currentTask) => currentTask.id === task.id);
      if (updatedTask !== undefined) {
        updateTaskDOM(task.id, updatedTask);
      }
    });
  }

  const editButton =
    taskElement.querySelector<HTMLButtonElement>(".task-edit-btn");
  if (editButton !== null) {
    editButton.addEventListener("click", (event): void => {
      event.stopPropagation();
      openEditTaskForm(task, taskElement);
    });
  }

  const selectButton =
    taskElement.querySelector<HTMLButtonElement>(".task-select-btn");
  if (selectButton !== null) {
    selectButton.addEventListener("click", (): void => {
    selectedTaskId = selectedTaskId === task.id ? null : task.id;
    const selectedTask =
      selectedTaskId === null ? undefined : getTasks().find((item) => item.id === selectedTaskId);
    updateSelectedTaskUI(selectedTask);
    });
  }

  return taskElement;
}

export function appendTaskToDOM(task: Task): void {
  if (DOM.taskList === null) return;

  const existingTaskElement = findTaskElement(task.id);
  if (existingTaskElement !== null) {
    updateTaskElement(existingTaskElement, task);
    updateTaskListSummary();
    return;
  }

  const taskElement = createTaskElement(task);
  if (taskElement !== null) {
    DOM.taskList.appendChild(taskElement);
    updateTaskListSummary();
  }
}

export function updateTaskDOM(taskId: string, updatedTask: Task): void {
  const taskElement = findTaskElement(taskId);
  if (taskElement === null) return;

  updateTaskElement(taskElement, updatedTask);
  updateSummaryUI();
}

export function removeTaskDOM(taskId: string): void {
  const taskElement = findTaskElement(taskId);
  if (taskElement !== null) {
    taskElement.remove();
  }

  if (selectedTaskId === taskId) {
    selectedTaskId = null;
    updateSelectedTaskUI(undefined);
  }

  updateTaskListSummary();
}

export function renderTasks(): void {
  if (DOM.taskList === null) return;

  const currentTasks: Task[] = getTasks();
  if (!currentTasks.some((task) => task.id === selectedTaskId)) {
    selectedTaskId = null;
  }

  const fragment = document.createDocumentFragment();
  for (const task of currentTasks) {
    const taskElement = createTaskElement(task);
    if (taskElement !== null) {
      fragment.appendChild(taskElement);
    }
  }

  DOM.taskList.replaceChildren(fragment);
  updateSelectedTaskUI(
    currentTasks.find((task) => task.id === selectedTaskId),
  );
  updateTaskListSummary();
}

export function initTaskEvents(): void {
  if (DOM.showTaskFormBtn !== null) {
    DOM.showTaskFormBtn.addEventListener("click", openAddTaskForm);
  }
  if (DOM.cancelTaskBtn !== null) {
    DOM.cancelTaskBtn.addEventListener("click", hideTaskForm);
  }

  if (DOM.taskFormContainer !== null) {
    DOM.taskFormContainer.addEventListener(
      "submit",
      async (e): Promise<void> => {
        e.preventDefault();
        if (
          DOM.taskNameInput === null ||
          DOM.estPomodorosInput === null ||
          DOM.actPomodorosInput === null
        ) {
          return;
        }

        const nameVal: string = DOM.taskNameInput.value;
        const estVal: string = DOM.estPomodorosInput.value;
        const actVal: string = DOM.actPomodorosInput.value;

        await withButtonLoading(
          "saveTaskBtn",
          async (): Promise<void> => {
            if (editingTaskId !== null) {
              const taskId = editingTaskId;
              const success: boolean = await editTask(
                taskId,
                nameVal,
                actVal,
                estVal,
              );
              if (success) {
                hideTaskForm();
                const updatedTask = getTasks().find(
                  (task) => task.id === taskId,
                );
                if (updatedTask !== undefined) {
                  updateTaskDOM(taskId, updatedTask);
                }
              }
            } else {
              const newTask: Task | null = await addTask(nameVal, estVal);
              if (newTask !== null) {
                if (DOM.taskNameInput !== null) {
                  DOM.taskNameInput.value = "";
                }
                if (DOM.estPomodorosInput !== null) {
                  DOM.estPomodorosInput.value = "1";
                }
                if (DOM.taskNameInput !== null) {
                  DOM.taskNameInput.focus();
                }
                appendTaskToDOM(newTask);
              }
            }
          },
          "Saving...",
        );
      },
    );
  }

  if (DOM.deleteTaskBtn !== null) {
    DOM.deleteTaskBtn.addEventListener("click", async (): Promise<void> => {
      if (editingTaskId !== null) {
        const taskId = editingTaskId;
        const success: boolean = await deleteTask(taskId);
        if (success) {
          editingTaskId = null;
          hideTaskForm();
          removeTaskDOM(taskId);
        }
      }
    });
  }

  if (DOM.taskDropdownBtn !== null && DOM.taskDropdownMenu !== null) {
    DOM.taskDropdownBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.taskDropdownMenu !== null) {
        const isExpanded = DOM.taskDropdownMenu.classList.toggle("hidden") === false;
        DOM.taskDropdownBtn?.setAttribute("aria-expanded", String(isExpanded));
      }
    });

    document.addEventListener("click", (e): void => {
      if (
        DOM.taskDropdownMenu !== null &&
        DOM.taskDropdownBtn !== null &&
        e.target instanceof Node &&
        !DOM.taskDropdownMenu.classList.contains("hidden") &&
        !DOM.taskDropdownMenu.contains(e.target) &&
        !DOM.taskDropdownBtn.contains(e.target)
      ) {
        DOM.taskDropdownMenu.classList.add("hidden");
        DOM.taskDropdownBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (DOM.deleteAllBtn !== null) {
    DOM.deleteAllBtn.addEventListener("click", async (): Promise<void> => {
      if (confirm("Are you sure you want to delete all tasks?")) {
        const taskIds = getTasks().map((task) => task.id);
        const success: boolean = await deleteAllTasks();
        if (success) {
          if (editingTaskId !== null) {
            editingTaskId = null;
            hideTaskForm();
          }
          for (const taskId of taskIds) {
            removeTaskDOM(taskId);
          }
          selectedTaskId = null;
          updateSelectedTaskUI(undefined);
          if (DOM.taskDropdownMenu !== null) {
            DOM.taskDropdownMenu.classList.add("hidden");
          }
        }
      }
    });
  }
}
