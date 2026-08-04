const STORAGE_KEY = "my_pomodoro_tasks";

export function saveTasksToStorage(tasks) {
  if (!Array.isArray(tasks)) {
    return;
  }

  const tasksString = JSON.stringify(tasks);
  localStorage.setItem(STORAGE_KEY, tasksString);
}

export function loadTasksFromStorage() {
  const saveData = localStorage.getItem(STORAGE_KEY);

  if (!saveData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(saveData);
    if (Array.isArray(parsedData)) {
      return parsedData;
    } else {
      return [];
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}
