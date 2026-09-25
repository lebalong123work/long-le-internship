import { DOM } from "./dom.ts";
import {
  getTasks,
  addTask,
  editTask,
  deleteTask,
  toggleTaskDone,
  deleteAllTasks,
  getSummaryData,
  Task,
} from "../logic/taskLogic.ts";
import { withButtonLoading } from "./uiButtonState.ts";

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

export function renderTasks(): void {
  if (DOM.taskList === null) return;
  DOM.taskList.innerHTML = "";

  const currentTasks: Task[] = getTasks();
  const activeTask: Task | undefined = currentTasks.find(
    (t): boolean => t.id === selectedTaskId,
  );

  if (activeTask !== undefined) {
    if (DOM.currentTaskMessage !== null) {
      DOM.currentTaskMessage.textContent = activeTask.name;
    }
  } else {
    selectedTaskId = null;
    if (DOM.currentTaskMessage !== null) {
      DOM.currentTaskMessage.textContent = "Time to focus!";
    }
  }

  if (DOM.summaryBoard !== null) {
    if (currentTasks.length === 0) {
      DOM.summaryBoard.classList.add("hidden");
    } else {
      DOM.summaryBoard.classList.remove("hidden");
    }
  }

  currentTasks.forEach((task: Task): void => {
    if (DOM.taskTemplate === null || DOM.taskList === null) return;

    const clone: Node = DOM.taskTemplate.content.cloneNode(true);
    if (!(clone instanceof DocumentFragment)) return;

    const li: HTMLLIElement | null = clone.querySelector("li");
    if (li === null) return;

    if (task.isDone) li.classList.add("task-done");
    if (task.id === selectedTaskId) li.classList.add("active-task");

    const taskNameEl: Element | null = li.querySelector(".task-name");
    if (taskNameEl !== null) {
      taskNameEl.textContent = task.name;
    }

    const taskPomosEl: Element | null = li.querySelector(".task-pomos");
    if (taskPomosEl !== null) {
      taskPomosEl.textContent = `${task.act} / ${task.est}`;
    }

    const checkBtn: Element | null = li.querySelector(".task-check-btn");
    if (checkBtn !== null) {
      checkBtn.addEventListener("click", async (e): Promise<void> => {
        e.stopPropagation();
        const success: boolean = await toggleTaskDone(task.id);
        if (success) renderTasks();
      });
    }

    const editBtn: Element | null = li.querySelector(".task-edit-btn");
    if (editBtn !== null) {
      editBtn.addEventListener("click", (e): void => {
        e.stopPropagation();
        openEditTaskForm(task, li);
      });
    }

    li.addEventListener("click", (): void => {
      if (selectedTaskId === task.id) {
        selectedTaskId = null;
      } else {
        selectedTaskId = task.id;
      }
      renderTasks();
    });

    DOM.taskList.appendChild(clone);
  });

  updateSummaryUI();
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
              const success: boolean = await editTask(
                editingTaskId,
                nameVal,
                actVal,
                estVal,
              );
              if (success) {
                hideTaskForm();
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
              }
            }
            renderTasks();
          },
          "Saving...",
        );
      },
    );
  }

  if (DOM.deleteTaskBtn !== null) {
    DOM.deleteTaskBtn.addEventListener("click", async (): Promise<void> => {
      if (editingTaskId !== null) {
        const success: boolean = await deleteTask(editingTaskId);
        if (success) {
          editingTaskId = null;
          renderTasks();
        }
      }
    });
  }

  if (DOM.taskDropdownBtn !== null && DOM.taskDropdownMenu !== null) {
    DOM.taskDropdownBtn.addEventListener("click", (e): void => {
      e.stopPropagation();
      if (DOM.taskDropdownMenu !== null) {
        DOM.taskDropdownMenu.classList.toggle("hidden");
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
      }
    });
  }

  if (DOM.deleteAllBtn !== null) {
    DOM.deleteAllBtn.addEventListener("click", async (): Promise<void> => {
      if (confirm("Are you sure you want to delete all tasks?")) {
        const success: boolean = await deleteAllTasks();
        if (success) {
          if (DOM.taskDropdownMenu !== null) {
            DOM.taskDropdownMenu.classList.add("hidden");
          }
          renderTasks();
        }
      }
    });
  }
}
