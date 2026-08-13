import { initHeaderEvents } from "./javascript/ui_header.js";
import { initTaskEvents, renderTasks } from "./javascript/ui_tasks.js";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./javascript/ui_timer.js";

import { initTasksData } from "./javascript/taskLogic.js";

document.addEventListener("DOMContentLoaded", async () => {
  initHeaderEvents();

  initTimerEvents();

  initTaskEvents();

  await initTasksData();

  updatePomodoroCountUI();
  renderTasks();
});
