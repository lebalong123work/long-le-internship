import { initHeaderEvents } from "./javascript/uiHeader.js";
import { initTaskEvents, renderTasks } from "./javascript/uiTasks.js";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./javascript/uiTimer.js";

import { initTasksData } from "./javascript/taskLogic.js";
import { initGlobalErrorHandler } from "./javascript/errorHandler.js";
import { removeInitialLoader } from "./javascript/uiLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  initGlobalErrorHandler();
  initHeaderEvents();

  initTimerEvents();

  initTaskEvents();
  try {
    await initTasksData();
  } finally {
    removeInitialLoader();
  }
  updatePomodoroCountUI();
  renderTasks();
});
