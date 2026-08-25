import { calculateFinishTime } from "../utils/timeUtils.js";
import {
  saveTasksToAPI,
  loadTasksFromAPI,
  deleteTaskFromAPI,
  updateTaskInAPI,
} from "../api/storage.js";

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
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;
  const task = tasks[taskIndex];

  if (typeof newName !== "string" || newName.trim() === "") return false;
  const finalAct = parsePomodoro(newAct);
  if (finalAct === null) return false;
  const finalEst = parsePomodoro(newEst);
  if (finalEst === null) return false;

  const parsedName = newName.trim();
  const draftUpdatedTask = {};

  if (task.name !== parsedName) draftUpdatedTask.name = parsedName;
  if (task.act !== finalAct) draftUpdatedTask.act = finalAct;
  if (task.est !== finalEst) draftUpdatedTask.est = finalEst;

  if (Object.keys(draftUpdatedTask).length === 0) {
    return true;
  }

  const updatedTask = await updateTaskInAPI(id, draftUpdatedTask);

  if (!updatedTask) return false;

  Object.assign(task, draftUpdatedTask);

  return true;
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
  const activeTasks = tasks.filter((task) => !task.isDone);

  const totals = activeTasks.reduce(
    (acc, task) => {
      acc.totalAct += task.act;
      acc.totalEst += task.est;

      const remaining = task.est - task.act;
      if (remaining > 0) {
        acc.remainingPomos += remaining;
      }

      return acc;
    },
    { totalEst: 0, totalAct: 0, remainingPomos: 0 },
  );

  return totals;
}

export function getSummaryData() {
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
