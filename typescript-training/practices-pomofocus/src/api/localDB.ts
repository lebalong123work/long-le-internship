import { CONFIG } from "../config/config.ts";
import { Task } from "../logic/taskLogic.ts";

export const LocalDB = {
  getTasks: (): Task[] => {
    const data = localStorage.getItem(CONFIG.STORAGE.ANONYMOUS_KEY);
    return data ? (JSON.parse(data) as Task[]) : [];
  },

  saveTasks: (tasksArray: Task[]) => {
    const stringifiedData = JSON.stringify(tasksArray);
    localStorage.setItem(CONFIG.STORAGE.ANONYMOUS_KEY, stringifiedData);
  },
};
