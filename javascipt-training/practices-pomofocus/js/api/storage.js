import { getCurrentUserId } from "../logic/authLogic.js";
import { fetchAPI } from "../api/apiClient.js";
import { LocalDB } from "./localDB.js";

export async function loadTasksFromAPI() {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI(`/tasks?userId=${userId}`);
    } else {
      return LocalDB.getTasks();
    }
  } catch (error) {
    throw new Error(
      "Network error: Unable to connect. Please check internet connection",
      { cause: error },
    );
  }
}

export async function saveTasksToAPI(newtask) {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      const taskToSave = Object.assign({}, newtask);
      taskToSave.userId = userId;
      return await fetchAPI("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToSave),
      });
    } else {
      const currentTasks = LocalDB.getTasks();
      currentTasks.push(newtask);
      LocalDB.saveTasks(currentTasks);
      return newtask;
    }
  } catch (error) {
    throw new Error("Network error: Unable to save", { cause: error });
  }
}

export async function deleteTaskFromAPI(taskId) {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI(`/tasks/${taskId}`, {
        method: "DELETE",
      });
    } else {
      let currentTasks = LocalDB.getTasks();
      if (currentTasks.length === 0) return false;
      let filteredTasks = currentTasks.filter((task) => task.id !== taskId);
      LocalDB.saveTasks(filteredTasks);
      return true;
    }
  } catch (error) {
    throw new Error("Network error: Unable to delete", { cause: error });
  }
}

export async function updateTaskInAPI(taskId, updatedTask) {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
    } else {
      let currentTasks = LocalDB.getTasks();
      const taskIndex = currentTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return null;
      Object.assign(currentTasks[taskIndex], updatedTask);
      LocalDB.saveTasks(currentTasks);
      return currentTasks[taskIndex];
    }
  } catch (error) {
    throw new Error("Network error: Unable to update", { cause: error });
  }
}
