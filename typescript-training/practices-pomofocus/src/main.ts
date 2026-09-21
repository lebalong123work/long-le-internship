import { initHeaderEvents } from "./ui/uiHeader.ts";
import { initTaskEvents, renderTasks } from "./ui/uiTasks.ts";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./ui/uiTimer.ts";

import { initTasksData } from "./logic/taskLogic.ts";
import { initGlobalErrorHandler } from "./utils/errorHandler.ts";
import { removeInitialLoader } from "./ui/uiLoader.ts";

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
