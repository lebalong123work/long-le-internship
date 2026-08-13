import {
  saveTasksToAPI,
  loadTasksFromAPI,
  deleteTaskFromAPI,
  updateTaskInAPI,
} from "./storage.js";

const POMODORO_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5; // Short break: 5 minutes
const LONG_BREAK_MINUTES = 15; // Long break: 15 minutes
const LONG_BREAK_INTERVAL = 4; // Long break every 4 sets
const SECONDS_PER_HOUR = 3600;

let tasks = [];

export async function initTasksData() {
  const apiData = await loadTasksFromAPI();

  tasks = apiData;
  return true;
}

function getTaskIndexById(id) {
  if (typeof id !== "string" || id.trim() === "") {
    return -1;
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return -1;
  }

  return taskIndex;
}

function parsePomodoro(value) {
  if (value === undefined || value === "" || value === null) {
    return null;
  }

  let finalVal = Number(value);

  if (Number.isNaN(finalVal) || finalVal < 0) {
    return null;
  }

  finalVal = Math.floor(finalVal);

  return finalVal;
}

export function getTasks() {
  return tasks;
}

// Logic: Add a new task
export async function addTask(taskname, estPomodoros) {
  if (typeof taskname !== "string" || taskname.trim() === "") {
    return null;
  }

  let finalEst = parsePomodoro(estPomodoros);
  if (finalEst === null) {
    return null;
  }

  const newId = crypto.randomUUID();

  const newTask = {
    id: newId,
    name: taskname.trim(),
    est: finalEst,
    act: 0,
    isDone: false,
  };

  const savedTask = await saveTasksToAPI(newTask);
  if (savedTask) {
    tasks.push(savedTask);
    return savedTask;
  } else {
    return null;
  }
}

// Logic: Edit Task
export async function editTask(id, newName, newAct, newEst) {
  // Block incoming junk IDs.
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;

  const task = tasks[taskIndex];

  if (typeof newName !== "string" || newName.trim() === "") {
    return false;
  }

  let finalAct = parsePomodoro(newAct);
  if (finalAct === null) return false;

  let finalEst = parsePomodoro(newEst);
  if (finalEst === null) return false;

  const draftUpdatedTask = {};
  let hasChanges = false;

  if (task.name !== newName.trim()) {
    draftUpdatedTask.name = newName.trim();
    hasChanges = true;
  }
  if (task.act !== finalAct) {
    draftUpdatedTask.act = finalAct;
    hasChanges = true;
  }
  if (task.est !== finalEst) {
    draftUpdatedTask.est = finalEst;
    hasChanges = true;
  }

  if (!hasChanges) {
    return true;
  }

  const updatedTask = await updateTaskInAPI(id, draftUpdatedTask);

  if (updatedTask) {
    if (draftUpdatedTask.name !== undefined) {
      task.name = updatedTask.name;
    }
    if (draftUpdatedTask.act !== undefined) {
      task.act = updatedTask.act;
    }
    if (draftUpdatedTask.est !== undefined) {
      task.est = updatedTask.est;
    }
    return true;
  } else {
    return false;
  }
}

// Logic: Delete a Task
export async function deleteTask(id) {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;

  const deleteTask = await deleteTaskFromAPI(id);
  if (deleteTask) {
    tasks.splice(taskIndex, 1);
    return true;
  } else {
    return false;
  }
}

// Logic: Toggle Task Done Status
export async function toggleTaskDone(id) {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;

  const task = tasks[taskIndex];

  const drafToggleTask = { isDone: !task.isDone };
  const updatedTask = await updateTaskInAPI(id, {
    isDone: drafToggleTask.isDone,
  });

  if (updatedTask) {
    task.isDone = updatedTask.isDone;
    return true;
  } else {
    return false;
  }
}

// Logic: Delete All Tasks
export async function deleteAllTasks() {
  if (tasks.length === 0) {
    return false;
  }
  const deleteAll = tasks.map((task) => deleteTaskFromAPI(task.id));

  const allDeleted = await Promise.all(deleteAll);

  const deleteAllSuccess = allDeleted.every((result) => result === true);

  if (deleteAllSuccess) {
    tasks = [];
    return true;
  } else {
    await initTasksData();
    return false;
  }
}

function calculateTotals() {
  const totals = tasks.reduce(
    (acc, task) => {
      acc.totalAct += task.act;

      if (task.isDone) {
        acc.totalEst += task.act;
      } else {
        const effectiveEst = Math.max(task.est, task.act);
        acc.totalEst += effectiveEst;

        if (effectiveEst > task.act) {
          acc.remainingPomos += effectiveEst - task.act;
        }
      }

      return acc;
    },
    { totalEst: 0, totalAct: 0, remainingPomos: 0 },
  );

  return totals;
}

function calculateFinishTime(remainingPomos) {
  if (remainingPomos < 0) {
    remainingPomos = 0;
  }

  const POMO_SECONDS = POMODORO_MINUTES * 60;
  const workSeconds = remainingPomos * POMO_SECONDS;

  const totalPomosForBreak = Math.ceil(remainingPomos);
  const totalBreaks = totalPomosForBreak > 0 ? totalPomosForBreak - 1 : 0;

  const longBreaks = Math.floor(totalBreaks / LONG_BREAK_INTERVAL);
  const shortBreaks = totalBreaks - longBreaks;

  const shortBreakSeconds = shortBreaks * SHORT_BREAK_MINUTES * 60;
  const longBreakSeconds = longBreaks * LONG_BREAK_MINUTES * 60;

  const totalSeconds = workSeconds + shortBreakSeconds + longBreakSeconds;

  const hoursNeeded = Number((totalSeconds / SECONDS_PER_HOUR).toFixed(1));

  const now = new Date();
  now.setSeconds(now.getSeconds() + totalSeconds);

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} (${hoursNeeded}h)`;
}

export function getAggregationData() {
  const totals = calculateTotals();
  const finishAtString = calculateFinishTime(totals.remainingPomos);

  const data = {
    totalEst: totals.totalEst,
    totalAct: totals.totalAct,
    finishAt: finishAtString,
  };
  return data;
}

export async function increaseActualPomodoros(id) {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) {
    return false;
  }

  const task = tasks[taskIndex];
  const newAct = task.act + 1;
  const draftAct = {
    act: newAct,
  };
  const updatedTask = await updateTaskInAPI(id, draftAct);

  if (updatedTask) {
    task.act = updatedTask.act;
    return true;
  } else {
    return false;
  }
}
