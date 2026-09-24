import { CONFIG } from "../config/config.ts";
import { formatTime } from "../utils/timeUtils.ts";

export type TimerMode = "pomo" | "shortBreak" | "longBreak";

type TickCallback = (timeString: string) => void;
type CompleteCallback = () => void;

let currentDuration: number = CONFIG.TIMER.POMO * 60;
let timeLeft: number = currentDuration;
let isRunning: boolean = false;
let timerId: ReturnType<typeof setInterval> | null = null;

let expectedEndTime: number | null = null;

let onTickCallback: TickCallback | null = null;
let onCompleteCallback: CompleteCallback | null = null;

export function setTimerCallback(callback: TickCallback): void {
  onTickCallback = callback;
}

export function setTimerCompleteCallback(callback: CompleteCallback): void {
  onCompleteCallback = callback;
}

export function toggleTimer(): boolean {
  if (isRunning) {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    isRunning = false;

    if (expectedEndTime !== null) {
      timeLeft = Math.max(0, Math.round((expectedEndTime - Date.now()) / 1000));
    }
  } else {
    isRunning = true;
    expectedEndTime = Date.now() + timeLeft * 1000;

    timerId = setInterval(() => {
      if (expectedEndTime !== null) {
        const secondsLeft = Math.round((expectedEndTime - Date.now()) / 1000);
        timeLeft = secondsLeft;
      }

      if (onTickCallback !== null) {
        onTickCallback(formatTime(Math.max(0, timeLeft)));
      }

      if (timeLeft <= 0) {
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
        isRunning = false;
        expectedEndTime = null;
        timeLeft = currentDuration;

        if (onCompleteCallback !== null) {
          onCompleteCallback();
        }
      }
    }, 1000);
  }

  return isRunning;
}

export function setMode(modeName: TimerMode): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
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

  if (onTickCallback !== null) {
    onTickCallback(formatTime(timeLeft));
  }
}

export function resetTimer(): void {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  expectedEndTime = null;
  timeLeft = currentDuration;

  if (onTickCallback !== null) {
    onTickCallback(formatTime(timeLeft));
  }
}
