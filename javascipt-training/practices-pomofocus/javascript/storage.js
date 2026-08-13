import { getCurrentUserId } from "./authLogic.js";

const ANONYMOUS_KEY = "anonymous_tasks";

export async function loadTasksFromAPI() {
  try {
    const userId = getCurrentUserId();
    if (userId) {
      const response = await fetch(
        `http://localhost:3000/tasks?userId=${userId}`,
      );

      const data = await response.json();
      return data;
    } else {
      const localData = localStorage.getItem(ANONYMOUS_KEY);

      if (localData) {
        const parsedData = JSON.parse(localData);
        return parsedData;
      } else {
        return [];
      }
    }
  } catch (error) {
    return [];
  }
}

export async function saveTasksToAPI(newtask) {
  try {
    const userId = getCurrentUserId();

    if (userId) {
      const taskToSave = Object.assign({}, newtask);
      taskToSave.userId = userId;

      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskToSave),
      });

      if (!response.ok) {
        throw new Error("Failed to save task to API");
      }

      const savedData = await response.json();
      return savedData;
    } else {
      const localData = localStorage.getItem(ANONYMOUS_KEY);

      let currentTasks;
      if (localData) {
        currentTasks = JSON.parse(localData);
      } else {
        currentTasks = [];
      }

      currentTasks.push(newtask);

      const stringifiedTasks = JSON.stringify(currentTasks);
      localStorage.setItem(ANONYMOUS_KEY, stringifiedTasks);
      return newtask;
    }
  } catch (error) {
    return null;
  }
}

export async function deleteTaskFromAPI(taskId) {
  try {
    const userId = getCurrentUserId();

    if (userId) {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
      });
      return response.ok;
    } else {
      const localData = localStorage.getItem(ANONYMOUS_KEY);
      if (!localData) {
        return false;
      }

      let currentTasks = JSON.parse(localData);

      let filteredTasks = currentTasks.filter(function (task) {
        return task.id !== taskId;
      });

      const stringifiedTasks = JSON.stringify(filteredTasks);
      localStorage.setItem(ANONYMOUS_KEY, stringifiedTasks);

      return true;
    }
  } catch (error) {
    return false;
  }
}

export async function updateTaskInAPI(taskId, updatedTask) {
  try {
    const userId = getCurrentUserId();

    if (userId) {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Failed to update task in API");
      }

      const responseData = await response.json();
      return responseData;
    } else {
      const localData = localStorage.getItem(ANONYMOUS_KEY);
      if (!localData) {
        return null;
      }

      let currentTasks = JSON.parse(localData);

      const taskIndex = currentTasks.findIndex(function (task) {
        return task.id === taskId;
      });

      if (taskIndex === -1) {
        return null;
      }

      let oldTask = currentTasks[taskIndex];

      Object.assign(oldTask, updatedTask);

      currentTasks[taskIndex] = oldTask;

      const stringifiedTasks = JSON.stringify(currentTasks);
      localStorage.setItem(ANONYMOUS_KEY, stringifiedTasks);

      return currentTasks[taskIndex];
    }
  } catch (error) {
    return null;
  }
}
