import { getCurrentUserId } from "../logic/authLogic.ts";
import { fetchAPI } from "./apiClient.ts";
import { LocalDB } from "./localDB.ts";
import { Task } from "../logic/taskLogic.ts";

export async function fetchTasks(): Promise<Task[]> {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI<Task[]>(`/tasks?userId=${userId}`);
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

export async function createTask(newTask: Task): Promise<Task> {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      const taskToSave = { ...newTask, userId };
      return await fetchAPI<Task>("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToSave),
      });
    } else {
      const currentTasks = LocalDB.getTasks();
      currentTasks.push(newTask);
      LocalDB.saveTasks(currentTasks);
      return newTask;
    }
  } catch (error) {
    throw new Error("Network error: Unable to save", { cause: error });
  }
}

export async function removeTask(taskId: string): Promise<boolean> {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI<boolean>(`/tasks/${taskId}`, {
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

export async function updateTask(
  taskId: string,
  updatedTask: Partial<Task>,
): Promise<Task | null> {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      return await fetchAPI<Task>(`/tasks/${taskId}`, {
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
