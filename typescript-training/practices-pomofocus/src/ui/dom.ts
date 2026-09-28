function getSafeElement<T extends HTMLElement>(
  id: string,
  expectedClass: new () => T,
): T | null {
  const element = document.getElementById(id);
  if (element instanceof expectedClass) {
    return element;
  }
  return null;
}

function querySafeElement<T extends HTMLElement>(
  selector: string,
  expectedClass: new () => T,
): T | null {
  const element = document.querySelector(selector);
  if (element instanceof expectedClass) {
    return element;
  }
  return null;
}

export const DOM = {
  //HEADER & AUTH
  guestBlock: document.getElementById("guestBlock"),
  userBlock: document.getElementById("userBlock"),
  guestMenuBtn: document.getElementById("guestMenuBtn"),
  guestDropdown: document.getElementById("guestDropdown"),
  avatarMenuBtn: document.getElementById("avatarMenuBtn"),
  userDropdown: document.getElementById("userDropdown"),
  logoutBtn: document.getElementById("logoutBtn"),

  //TIMER & CONTROLS
  timeDisplay: document.getElementById("timeDisplay"),
  pomoBtn: document.getElementById("pomoBtn"),
  shortBreakBtn: document.getElementById("shortBreakBtn"),
  longBreakBtn: document.getElementById("longBreakBtn"),
  startTimerBtn: document.getElementById("startTimerBtn"),
  skipTimerBtn: document.getElementById("skipTimerBtn"),
  resetTimerBtn: document.getElementById("resetTimerBtn"),

  currentTaskNumber: document.getElementById("currentTaskNumber"),
  currentTaskMessage: document.getElementById("currentTaskMessage"),

  //TASKS CONTAINER
  taskList: document.getElementById("taskList"),
  taskTemplate: getSafeElement("taskTemplate", HTMLTemplateElement),
  actionGroup: querySafeElement(".action-group", HTMLElement),
  showTaskFormBtn: document.getElementById("showTaskFormBtn"),

  taskDropdownBtn: document.getElementById("taskDropdownBtn"),
  taskDropdownMenu: document.getElementById("taskDropdownMenu"),
  deleteAllBtn: document.getElementById("deleteAllBtn"),

  //TASK FORM
  taskFormContainer: document.getElementById("taskFormContainer"),
  formTitle: document.getElementById("formTitle"),
  taskNameInput: getSafeElement("taskNameInput", HTMLInputElement),
  estPomodorosInput: getSafeElement("estPomodorosInput", HTMLInputElement),
  actPomodorosInput: getSafeElement("actPomodorosInput", HTMLInputElement),

  actPomodorosContainer: document.getElementById("actPomodorosContainer"),
  cancelTaskBtn: document.getElementById("cancelTaskBtn"),
  deleteTaskBtn: document.getElementById("deleteTaskBtn"),

  //SUMMARY BOARD
  summaryBoard: document.getElementById("summaryBoard"),
  actCount: document.getElementById("actCount"),
  estCount: document.getElementById("estCount"),
  finishTime: document.getElementById("finishTime"),
};
