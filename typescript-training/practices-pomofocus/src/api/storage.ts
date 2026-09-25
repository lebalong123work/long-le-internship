import { getCurrentUserId } from "../logic/authLogic.js";
import { fetchAPI } from "./apiClient.js";
import { LocalDB } from "./localDB.js";
import { Task } from "../logic/taskLogic.js";

export async function fetchTasks(): Promise<Task[]> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const data: Task[] | boolean = await fetchAPI<Task[]>(
        `/tasks?userId=${userId}`,
      );
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } else {
      return LocalDB.getTasks();
    }
  } catch (error: unknown) {
    throw new Error(
      "Network error: Unable to connect. Please check internet connection",
      { cause: error },
    );
  }
}

export async function createTask(newTask: Task): Promise<Task> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const taskToSave: Task = { ...newTask, userId };
      const data: Task | boolean = await fetchAPI<Task>("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToSave),
      });
      if (typeof data === "boolean") {
        throw new Error("Invalid response format");
      }
      return data;
    } else {
      const currentTasks: Task[] = LocalDB.getTasks();
      currentTasks.push(newTask);
      LocalDB.saveTasks(currentTasks);
      return newTask;
    }
  } catch (error: unknown) {
    throw new Error("Network error: Unable to save", { cause: error });
  }
}

export async function removeTask(taskId: string): Promise<boolean> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      await fetchAPI<unknown>(`/tasks/${taskId}`, {
        method: "DELETE",
      });
      return true;
    } else {
      const currentTasks: Task[] = LocalDB.getTasks();
      if (currentTasks.length === 0) return false;
      const filteredTasks: Task[] = currentTasks.filter(
        (task: Task): boolean => task.id !== taskId,
      );
      LocalDB.saveTasks(filteredTasks);
      return true;
    }
  } catch (error: unknown) {
    throw new Error("Network error: Unable to delete", { cause: error });
  }
}

export async function updateTask(
  taskId: string,
  updatedTask: Partial<Task>,
): Promise<Task | null> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const data: Task | boolean = await fetchAPI<Task>(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      if (typeof data === "boolean") {
        return null;
      }
      return data;
    } else {
      let currentTasks: Task[] = LocalDB.getTasks();
      const taskIndex: number = currentTasks.findIndex(
        (task: Task): boolean => task.id === taskId,
      );
      if (taskIndex === -1) return null;
      Object.assign(currentTasks[taskIndex], updatedTask);
      LocalDB.saveTasks(currentTasks);
      return currentTasks[taskIndex];
    }
  } catch (error: unknown) {
    throw new Error("Network error: Unable to update", { cause: error });
  }
}
