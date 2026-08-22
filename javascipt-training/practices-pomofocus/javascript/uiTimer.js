import { DOM } from "./dom.js";
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
  const saved = localStorage.getItem("pomoCount");
  return saved ? Number.parseInt(saved, 10) : 0;
}

let pomodorosCompleted = getSavedPomoCount();

function updateActiveButton(clickedBtn) {
  const allModeBtns = document.querySelectorAll(".mode-btn");
  allModeBtns.forEach((btn) => btn.classList.remove("active"));
  if (clickedBtn) clickedBtn.classList.add("active");
}

export function updatePomodoroCountUI() {
  if (!DOM.currentTaskNumber) return;
  const currentCycle = (pomodorosCompleted % 4) + 1;
  DOM.currentTaskNumber.textContent = `#${currentCycle}`;
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
      localStorage.setItem("pomoCount", pomodorosCompleted);

      if (pomodorosCompleted % 4 === 0) {
        setMode("longBreak");
        updateActiveButton(DOM.longBreakBtn);
        currentMode = "longBreak";
        document.body.classList.add("theme-long-break");
        document.body.classList.remove("theme-short-break");
      } else {
        setMode("shortBreak");
        updateActiveButton(DOM.shortBreakBtn);
        currentMode = "shortBreak";
        document.body.classList.add("theme-short-break");
        document.body.classList.remove("theme-long-break");
      }
    } else {
      setMode("pomo");
      updateActiveButton(DOM.pomoBtn);
      currentMode = "pomo";
      updatePomodoroCountUI();
      document.body.classList.remove("theme-short-break", "theme-long-break");
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

  DOM.pomoBtn.addEventListener("click", () => {
    updateActiveButton(DOM.pomoBtn);
    document.body.classList.remove("theme-short-break", "theme-long-break");
    setMode("pomo");
    currentMode = "pomo";
    updatePomodoroCountUI();
  });

  DOM.shortBreakBtn.addEventListener("click", () => {
    updateActiveButton(DOM.shortBreakBtn);
    document.body.classList.add("theme-short-break");
    document.body.classList.remove("theme-long-break");
    setMode("shortBreak");
    currentMode = "shortBreak";
  });

  DOM.longBreakBtn.addEventListener("click", () => {
    updateActiveButton(DOM.longBreakBtn);
    document.body.classList.add("theme-long-break");
    document.body.classList.remove("theme-short-break");
    setMode("longBreak");
    currentMode = "longBreak";
  });

  if (DOM.resetTimerBtn) {
    DOM.resetTimerBtn.addEventListener("click", () => {
      resetTimer();
      DOM.startTimerBtn.textContent = "START";
      if (DOM.skipTimerBtn) DOM.skipTimerBtn.classList.add("hidden");
    });
  }
}
