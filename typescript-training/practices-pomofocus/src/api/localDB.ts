import { CONFIG } from "@/config";
import type { Task } from "@/logic/taskLogic";
import { isTaskArray } from "@/api/validation";

export const LocalDB = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(CONFIG.STORAGE.ANONYMOUS_KEY);
    if (data === null) return [];

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(data);
    } catch (error: unknown) {
      throw new Error("Saved tasks contain invalid JSON", { cause: error });
    }

    if (!isTaskArray(parsedData)) {
      throw new Error("Saved tasks have an invalid data format");
    }

    return parsedData;
  },

  saveTasks: (tasksArray: Task[]) => {
    const stringifiedData = JSON.stringify(tasksArray);
    localStorage.setItem(CONFIG.STORAGE.ANONYMOUS_KEY, stringifiedData);
  },
};
