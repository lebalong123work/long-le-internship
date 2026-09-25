import { initHeaderEvents } from "./ui/uiHeader.js";
import { initTaskEvents, renderTasks } from "./ui/uiTasks.js";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./ui/uiTimer.js";

import { initTasksData } from "./logic/taskLogic.js";
import { initGlobalErrorHandler } from "./utils/errorHandler.js";
import { removeInitialLoader } from "./ui/uiLoader.js";

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
