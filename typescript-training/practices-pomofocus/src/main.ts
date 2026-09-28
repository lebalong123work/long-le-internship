import { initHeaderEvents } from "@/ui/uiHeader";
import { initTaskEvents, renderTasks } from "@/ui/uiTasks";
import { initTimerEvents, updatePomodoroCountUI } from "@/ui/uiTimer";

import { initTasksData } from "@/logic/taskLogic";
import { initGlobalErrorHandler } from "@/utils/errorHandler";
import { removeInitialLoader } from "@/ui/uiLoader";

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
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
