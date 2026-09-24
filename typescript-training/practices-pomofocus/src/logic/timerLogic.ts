import { CONFIG } from "../config/config.ts";
import { formatTime } from "../utils/timeUtils.ts";

export type TimerMode = "pomo" | "shortBreak" | "longBreak";

let currentDuration = CONFIG.TIMER.POMO * 60;
let timeLeft = currentDuration;
let isRunning = false;
let timerId: ReturnType<typeof setInterval> | null = null;

let expectedEndTime: number | null = null;

let onTickCallback = null;
let onCompleteCallback = null;

export function setTimerCallback(callback) {
  onTickCallback = callback;
}

export function setTimerCompleteCallback(callback) {
  onCompleteCallback = callback;
}

export function toggleTimer() {
  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;

    if (expectedEndTime) {
      timeLeft = Math.max(0, Math.round((expectedEndTime - Date.now()) / 1000));
    }
  } else {
    isRunning = true;
    expectedEndTime = Date.now() + timeLeft * 1000;

    timerId = setInterval(() => {
      const secondsLeft = Math.round((expectedEndTime - Date.now()) / 1000);
      timeLeft = secondsLeft;

      if (onTickCallback) {
        onTickCallback(formatTime(Math.max(0, timeLeft)));
      }

      if (timeLeft <= 0) {
        clearInterval(timerId);
        isRunning = false;
        expectedEndTime = null;
        timeLeft = currentDuration;

        if (onCompleteCallback) {
          onCompleteCallback();
        }
      }
    }, 1000);
  }

  return isRunning;
}

export function setMode(modeName) {
  clearInterval(timerId);
  isRunning = false;
  expectedEndTime = null;

  if (modeName === "pomo") {
    currentDuration = CONFIG.TIMER.POMO * 60;
  } else if (modeName === "shortBreak") {
    currentDuration = CONFIG.TIMER.SHORT_BREAK * 60;
  } else if (modeName === "longBreak") {
    currentDuration = CONFIG.TIMER.LONG_BREAK * 60;
  }

  timeLeft = currentDuration;

  if (onTickCallback) {
    onTickCallback(formatTime(timeLeft));
  }
}

export function resetTimer() {
  clearInterval(timerId);
  isRunning = false;
  expectedEndTime = null;
  timeLeft = currentDuration;
  if (onTickCallback) {
    onTickCallback(formatTime(timeLeft));
  }
}
