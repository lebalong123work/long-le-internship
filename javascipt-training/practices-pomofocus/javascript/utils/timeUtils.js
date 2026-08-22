// javascript/utils/timeUtils.js

import { CONFIG } from "../config.js";

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const stringMinutes = minutes.toString().padStart(2, "0");
  const stringSeconds = seconds.toString().padStart(2, "0");

  return `${stringMinutes}:${stringSeconds}`;
}

export function calculateFinishTime(remainingPomos) {
  if (remainingPomos <= 0) return "--:--";

  const pomoSecs = CONFIG.TIMER.POMO * 60;
  const shortBreakSecs = CONFIG.TIMER.SHORT_BREAK * 60;
  const longBreakSecs = CONFIG.TIMER.LONG_BREAK * 60;
  const LONG_BREAK_INTERVAL = 4;

  const workSeconds = remainingPomos * pomoSecs;

  const totalPomosForBreak = Math.ceil(remainingPomos);
  const totalBreaks = totalPomosForBreak > 0 ? totalPomosForBreak - 1 : 0;

  const longBreaks = Math.floor(totalBreaks / LONG_BREAK_INTERVAL);
  const shortBreaks = totalBreaks - longBreaks;

  const totalSeconds =
    workSeconds + shortBreaks * shortBreakSecs + longBreaks * longBreakSecs;
  const hoursNeeded = Number((totalSeconds / 3600).toFixed(1));

  const now = new Date();
  now.setSeconds(now.getSeconds() + totalSeconds);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} (${hoursNeeded}h)`;
}
