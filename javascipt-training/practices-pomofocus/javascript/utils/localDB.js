import { CONFIG } from "../config.js";

export const LocalDB = {
  getTasks: () => {
    const data = localStorage.getItem(CONFIG.STORAGE.ANONYMOUS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTasks: (tasksArray) => {
    const stringifiedData = JSON.stringify(tasksArray);
    localStorage.setItem(CONFIG.STORAGE.ANONYMOUS_KEY, stringifiedData);
  }
};