import { DOM } from "./dom.js";
import { CONFIG } from "./config.js";
import {
  toggleTimer,
  setTimerCallback,
  setMode,
  setTimerCompleteCallback,
  resetTimer,
} from "./timerLogic.js";
import { increaseActualPomodoros } from "./taskLogic.js";
import { renderTasks, getSelectedTaskId } from "./uiTasks.js";

let currentMode = "pomo";

function getSavedPomoCount() {
  const saved = localStorage.getItem(CONFIG.STORAGE.POMO_COUNT_KEY);
  return saved ? Number.parseInt(saved, 10) : 0;
}

let pomodorosCompleted = getSavedPomoCount();

export function updatePomodoroCountUI() {
  if (!DOM.currentTaskNumber) return;
  const currentCycle = (pomodorosCompleted % 4) + 1;
  DOM.currentTaskNumber.textContent = `#${currentCycle}`;
}

function switchUIMode(modeName) {
  currentMode = modeName;

  setMode(modeName);

  const allModeBtns = document.querySelectorAll(".mode-btn");
  allModeBtns.forEach((btn) => btn.classList.remove("active"));

  document.body.classList.remove("theme-short-break", "theme-long-break");

  if (modeName === "pomo") {
    DOM.pomoBtn.classList.add("active");
    updatePomodoroCountUI();
  } else if (modeName === "shortBreak") {
    DOM.shortBreakBtn.classList.add("active");
    document.body.classList.add("theme-short-break");
  } else if (modeName === "longBreak") {
    DOM.longBreakBtn.classList.add("active");
    document.body.classList.add("theme-long-break");
  }
}

export function initTimerEvents() {
  const handleSessionComplete = async () => {
    if (currentMode === "pomo") {
      const selectedId = getSelectedTaskId();
      if (selectedId !== null) {
        const success = await increaseActualPomodoros(selectedId);
        if (success) renderTasks();
      }
      pomodorosCompleted++;
      localStorage.setItem(CONFIG.STORAGE.POMO_COUNT_KEY, pomodorosCompleted);

      if (pomodorosCompleted % 4 === 0) {
        switchUIMode("longBreak");
      } else {
        switchUIMode("shortBreak");
      }
    } else {
      switchUIMode("pomo");
    }
    DOM.startTimerBtn.textContent = "START";
    if (DOM.skipTimerBtn) DOM.skipTimerBtn.classList.add("hidden");
  };

  setTimerCallback((timeString) => {
    DOM.timeDisplay.textContent = timeString;
  });

  setTimerCompleteCallback(async () => {
    await handleSessionComplete();
  });

  if (DOM.skipTimerBtn) {
    DOM.skipTimerBtn.addEventListener("click", async () => {
      await handleSessionComplete();
    });
  }

  DOM.startTimerBtn.addEventListener("click", () => {
    const isNowRunning = toggleTimer();
    if (isNowRunning) {
      DOM.startTimerBtn.textContent = "PAUSE";
      if (DOM.skipTimerBtn) DOM.skipTimerBtn.classList.remove("hidden");
    } else {
      DOM.startTimerBtn.textContent = "START";
    }
  });

  DOM.pomoBtn.addEventListener("click", () => switchUIMode("pomo"));
  DOM.shortBreakBtn.addEventListener("click", () => switchUIMode("shortBreak"));
  DOM.longBreakBtn.addEventListener("click", () => switchUIMode("longBreak"));

  if (DOM.resetTimerBtn) {
    DOM.resetTimerBtn.addEventListener("click", () => {
      resetTimer();
      DOM.startTimerBtn.textContent = "START";
      if (DOM.skipTimerBtn) DOM.skipTimerBtn.classList.add("hidden");
    });
  }

  switchUIMode("pomo");
  if (DOM.currentTaskMessage) {
    DOM.currentTaskMessage.textContent = "Time to focus!";
  }
}
