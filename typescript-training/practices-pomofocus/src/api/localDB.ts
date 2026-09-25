import { CONFIG } from "../config/config.js";
import { Task } from "../logic/taskLogic.js";

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
