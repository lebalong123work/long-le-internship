export async function loadTasksFromAPI() {
  try {
    const response = await fetch("http://localhost:3000/tasks");

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching tasks from API:", error);
    return [];
  }
}

export async function saveTasksToAPI(newtasks) {
  try {
    const response = await fetch("http://localhost:3000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newtasks),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const savedData = await response.json();
    return savedData;
  } catch (error) {
    console.error("Error saving tasks to API:", error);
    return null;
  }
}

export async function deleteTaskFromAPI(taskId) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error("Error deleting task from API:", error);
    return false;
  }
}

export async function updateTaskInAPI(taskId, updatedTask) {
  try {
    const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error("Error updating task in API:", error);
    return null;
  }
}
