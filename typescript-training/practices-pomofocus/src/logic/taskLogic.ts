import { calculateFinishTime } from "../utils/timeUtils.ts";
import {
  createTask,
  fetchTasks,
  removeTask,
  updateTask,
} from "../api/storage.ts";

export interface Task {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
  userId?: string;
}

export interface SummaryData {
  totalEst: number;
  totalAct: number;
  finishAt: string;
}

let tasks: Task[] = [];

export async function initTasksData() {
  const apiData = await fetchTasks();

  tasks = apiData;
  return true;
}

function getTaskIndexById(id: string): number {
  if (typeof id !== "string" || id.trim() === "") {
    return -1;
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    return -1;
  }

  return taskIndex;
}

function parsePomodoro(
  value: string | number | undefined | null,
): number | null {
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
export async function addTask(taskName: string, estPomodoros: string | number) {
  if (typeof taskName !== "string" || taskName.trim() === "") {
    return null;
  }

  let finalEst = parsePomodoro(estPomodoros);
  if (finalEst === null) {
    return null;
  }

  const newId = crypto.randomUUID();

  const newTask: Task = {
    id: newId,
    name: taskName.trim(),
    est: finalEst,
    act: 0,
    isDone: false,
  };

  const savedTask = await createTask(newTask);
  if (savedTask) {
    tasks.push(savedTask);
    return savedTask;
  } else {
    return null;
  }
}

// Logic: Edit Task
export async function editTask(
  id: string,
  newName: string,
  newAct: string | number,
  newEst: string | number,
): Promise<boolean> {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;
  const task = tasks[taskIndex];

  if (typeof newName !== "string" || newName.trim() === "") return false;
  const finalAct = parsePomodoro(newAct);
  if (finalAct === null) return false;
  const finalEst = parsePomodoro(newEst);
  if (finalEst === null) return false;

  const parsedName = newName.trim();
  const draftUpdatedTask: Partial<Task> = {};

  if (task.name !== parsedName) draftUpdatedTask.name = parsedName;
  if (task.act !== finalAct) draftUpdatedTask.act = finalAct;
  if (task.est !== finalEst) draftUpdatedTask.est = finalEst;

  if (Object.keys(draftUpdatedTask).length === 0) {
    return true;
  }

  const updatedTask = await updateTask(id, draftUpdatedTask);

  if (!updatedTask) return false;

  Object.assign(task, draftUpdatedTask);

  return true;
}

// Logic: Delete a Task
export async function deleteTask(id: string): Promise<boolean> {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;

  const isDeleted = await removeTask(id);
  if (isDeleted) {
    tasks.splice(taskIndex, 1);
    return true;
  } else {
    return false;
  }
}

// Logic: Toggle Task Done Status
export async function toggleTaskDone(id: string): Promise<boolean> {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) return false;

  const task = tasks[taskIndex];

  const draftToggleTask = { isDone: !task.isDone };
  const updatedTask = await updateTask(id, {
    isDone: draftToggleTask.isDone,
  });

  if (updatedTask) {
    task.isDone = updatedTask.isDone;
    return true;
  } else {
    return false;
  }
}

// Logic: Delete All Tasks
export async function deleteAllTasks(): Promise<boolean> {
  if (tasks.length === 0) {
    return false;
  }
  const deleteAll = tasks.map((task) => removeTask(task.id));

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

export function getSummaryData(): SummaryData {
  const totals = calculateTotals();
  const finishAtString = calculateFinishTime(totals.remainingPomos);

  const data: SummaryData = {
    totalEst: totals.totalEst,
    totalAct: totals.totalAct,
    finishAt: finishAtString,
  };
  return data;
}

export async function increaseActualPomodoros(id: string): Promise<boolean> {
  const taskIndex = getTaskIndexById(id);
  if (taskIndex === -1) {
    return false;
  }

  const task = tasks[taskIndex];
  const newAct = task.act + 1;
  const draftAct = {
    act: newAct,
  };
  const updatedTask = await updateTask(id, draftAct);

  if (updatedTask) {
    task.act = updatedTask.act;
    return true;
  } else {
    return false;
  }
}
