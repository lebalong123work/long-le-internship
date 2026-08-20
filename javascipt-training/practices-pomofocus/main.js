import { initHeaderEvents } from "./javascript/uiHeader.js";
import { initTaskEvents, renderTasks } from "./javascript/uiTasks.js";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./javascript/uiTimer.js";

import { initTasksData } from "./javascript/taskLogic.js";
import { initGlobalErrorHandler } from "./javascript/errorHandler.js";

document.addEventListener("DOMContentLoaded", async () => {
  initGlobalErrorHandler();
  initHeaderEvents();

  initTimerEvents();

  initTaskEvents();

  await initTasksData();

  updatePomodoroCountUI();
  renderTasks();
});
