import { getCurrentUserId } from "@/logic/authLogic";
import { fetchAPI } from "@/api/apiClient";
import { LocalDB } from "@/api/localDB";
import { isTask, isTaskArray } from "@/api/validation";
import type { Task } from "@/logic/taskLogic";

export async function fetchTasks(): Promise<Task[]> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const data = await fetchAPI(`/tasks?userId=${userId}`);
      if (!isTaskArray(data)) {
        throw new Error("API returned an invalid task list");
      }
      return data;
    } else {
      return LocalDB.getTasks();
    }
  } catch (error: unknown) {
    throw new Error(
      "Unable to load tasks",
      { cause: error },
    );
  }
}

export async function createTask(newTask: Task): Promise<Task> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const taskToSave: Task = { ...newTask, userId };
      const data = await fetchAPI("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskToSave),
      });
      if (!isTask(data)) {
        throw new Error("API returned an invalid task");
      }
      return data;
    } else {
      const currentTasks: Task[] = LocalDB.getTasks();
      currentTasks.push(newTask);
      LocalDB.saveTasks(currentTasks);
      return newTask;
    }
  } catch (error: unknown) {
    throw new Error("Unable to save task", { cause: error });
  }
}

export async function removeTask(taskId: string): Promise<boolean> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const deleted = await fetchAPI(`/tasks/${taskId}`, {
        method: "DELETE",
      });
      return deleted === true;
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
    throw new Error("Unable to delete task", { cause: error });
  }
}

export async function updateTask(
  taskId: string,
  updatedTask: Partial<Task>,
): Promise<Task | null> {
  try {
    const userId: string | null = getCurrentUserId();
    if (userId !== null) {
      const data = await fetchAPI(`/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      if (!isTask(data)) {
        return null;
      }
      return data;
    } else {
      const currentTasks: Task[] = LocalDB.getTasks();
      const taskIndex: number = currentTasks.findIndex(
        (task: Task): boolean => task.id === taskId,
      );
      if (taskIndex === -1) return null;
      Object.assign(currentTasks[taskIndex], updatedTask);
      LocalDB.saveTasks(currentTasks);
      return currentTasks[taskIndex];
    }
  } catch (error: unknown) {
    throw new Error("Unable to update task", { cause: error });
  }
}
