const STORAGE_KEY = "my_pomodoro_tasks";

export function saveTasksToStorage(tasks) {
  if (!Array.isArray(tasks)) {
    console.error(
      "System error: Incorrect data was pushed to the warehouse.",
      tasks,
    );
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
      console.warn("The data in the warehouse is incorrect.");
      return [];
    }
  } catch (error) {
    console.error("LocalStorage data is corrupted:", error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}
