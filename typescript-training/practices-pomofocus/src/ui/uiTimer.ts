import { DOM } from "./dom.js";
import { CONFIG } from "../config/config.js";
import {
  toggleTimer,
  setTimerCallback,
  setMode,
  setTimerCompleteCallback,
  resetTimer,
  TimerMode,
} from "../logic/timerLogic.js";
import { increaseActualPomodoros } from "../logic/taskLogic.js";
import { renderTasks, getSelectedTaskId } from "./uiTasks.js";

let currentMode: TimerMode = "pomo";

function getSavedPomoCount(): number {
  const saved: string | null = localStorage.getItem(
    CONFIG.STORAGE.POMO_COUNT_KEY,
  );
  if (saved === null) {
    return 0;
  }

  const parsed: number = Number.parseInt(saved, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

let pomodorosCompleted: number = getSavedPomoCount();

export function updatePomodoroCountUI(): void {
  if (DOM.currentTaskNumber === null) return;
  const currentCycle = (pomodorosCompleted % 4) + 1;
  DOM.currentTaskNumber.textContent = `#${currentCycle}`;
}

function switchUIMode(modeName: TimerMode): void {
  currentMode = modeName;

  setMode(modeName);

  const allModeBtns = document.querySelectorAll(".mode-btn");
  allModeBtns.forEach((btn): void => {
    btn.classList.remove("active");
  });
  document.body.classList.remove("theme-short-break", "theme-long-break");

  if (modeName === "pomo") {
    if (DOM.pomoBtn !== null) {
      DOM.pomoBtn.classList.add("active");
    }
    updatePomodoroCountUI();
  } else if (modeName === "shortBreak") {
    if (DOM.shortBreakBtn !== null) {
      DOM.shortBreakBtn.classList.add("active");
    }
    document.body.classList.add("theme-short-break");
  } else if (modeName === "longBreak") {
    if (DOM.longBreakBtn !== null) {
      DOM.longBreakBtn.classList.add("active");
    }
    document.body.classList.add("theme-long-break");
  }
}

export function initTimerEvents(): void {
  const handleSessionComplete = async (): Promise<void> => {
    if (currentMode === "pomo") {
      const selectedId: string | null = getSelectedTaskId();
      if (selectedId !== null) {
        const success: boolean = await increaseActualPomodoros(selectedId);
        if (success) renderTasks();
      }
      pomodorosCompleted++;

      localStorage.setItem(
        CONFIG.STORAGE.POMO_COUNT_KEY,
        String(pomodorosCompleted),
      );

      if (pomodorosCompleted % 4 === 0) {
        switchUIMode("longBreak");
      } else {
        switchUIMode("shortBreak");
      }
    } else {
      switchUIMode("pomo");
    }
    if (DOM.startTimerBtn !== null) {
      DOM.startTimerBtn.textContent = "START";
    }
    if (DOM.skipTimerBtn !== null) {
      DOM.skipTimerBtn.classList.add("hidden");
    }
  };

  setTimerCallback((timeString): void => {
    if (DOM.timeDisplay !== null) {
      DOM.timeDisplay.textContent = timeString;
    }
  });

  setTimerCompleteCallback((): void => {
    void handleSessionComplete();
  });

  if (DOM.skipTimerBtn !== null) {
    DOM.skipTimerBtn.addEventListener("click", async (): Promise<void> => {
      await handleSessionComplete();
    });
  }

  if (DOM.startTimerBtn !== null) {
    DOM.startTimerBtn.addEventListener("click", (): void => {
      const isNowRunning: boolean = toggleTimer();
      if (isNowRunning) {
        if (DOM.startTimerBtn !== null) {
          DOM.startTimerBtn.textContent = "PAUSE";
        }
        if (DOM.skipTimerBtn !== null) {
          DOM.skipTimerBtn.classList.remove("hidden");
        }
      } else {
        if (DOM.startTimerBtn !== null) {
          DOM.startTimerBtn.textContent = "START";
        }
      }
    });
  }

  if (DOM.pomoBtn !== null) {
    DOM.pomoBtn.addEventListener("click", (): void => switchUIMode("pomo"));
  }
  if (DOM.shortBreakBtn !== null) {
    DOM.shortBreakBtn.addEventListener("click", (): void =>
      switchUIMode("shortBreak"),
    );
  }
  if (DOM.longBreakBtn !== null) {
    DOM.longBreakBtn.addEventListener("click", (): void =>
      switchUIMode("longBreak"),
    );
  }

  if (DOM.resetTimerBtn !== null) {
    DOM.resetTimerBtn.addEventListener("click", (): void => {
      resetTimer();
      if (DOM.startTimerBtn !== null) {
        DOM.startTimerBtn.textContent = "START";
      }
      if (DOM.skipTimerBtn !== null) {
        DOM.skipTimerBtn.classList.add("hidden");
      }
    });
  }

  switchUIMode("pomo");
  if (DOM.currentTaskMessage !== null) {
    DOM.currentTaskMessage.textContent = "Time to focus!";
  }
}
