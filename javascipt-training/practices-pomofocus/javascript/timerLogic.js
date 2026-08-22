import { CONFIG } from "./config.js";

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const stringMinutes = minutes.toString().padStart(2, "0");
  const stringSeconds = seconds.toString().padStart(2, "0");
  return `${stringMinutes}:${stringSeconds}`;
}

let currentDuration = CONFIG.TIMER.POMO * 60;
let timeLeft = currentDuration;
let isRunning = false;
let timerId = null;

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
  } else {
    isRunning = true;
    timerId = setInterval(() => {
      timeLeft--;

      if (onTickCallback) {
        onTickCallback(formatTime(timeLeft));
      }

      if (timeLeft <= 0) {
        clearInterval(timerId);
        isRunning = false;

        if (onCompleteCallback) {
          onCompleteCallback();
        }

        timeLeft = currentDuration;

        if (onTickCallback) {
          onTickCallback(formatTime(timeLeft));
        }
      }
    }, 1000);
  }

  return isRunning;
}

export function setMode(modeName) {
  clearInterval(timerId);
  isRunning = false;
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
  timeLeft = currentDuration;
  if (onTickCallback) {
    onTickCallback(formatTime(timeLeft));
  }
}
