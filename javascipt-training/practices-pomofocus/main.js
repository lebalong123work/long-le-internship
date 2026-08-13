import { initHeaderEvents } from "./javascript/uiHeader.js";
import { initTaskEvents, renderTasks } from "./javascript/uiTasks.js";
import {
  initTimerEvents,
  updatePomodoroCountUI,
} from "./javascript/uiTimer.js";

import { initTasksData } from "./javascript/taskLogic.js";

document.addEventListener("DOMContentLoaded", async () => {
  initHeaderEvents();

  initTimerEvents();

  initTaskEvents();

  await initTasksData();

  updatePomodoroCountUI();
  renderTasks();
});
