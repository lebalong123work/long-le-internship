let tasks = [];

// Logic: Add a new task
function addTask(taskname, estPomodoros) {
  // Check Name Task
  if (typeof taskname !== "string" || taskname.trim() === "") {
    console.error("Error: Adding Task: Invalid or blank task name.");
    return false;
  }

  // BLOCK BLANK: If no input is entered, enter an empty string, or null. Error will be reported.
  if (
    estPomodoros === undefined ||
    estPomodoros === "" ||
    estPomodoros === null
  ) {
    console.error("Error: Adding Task: Est. Pomodoros cannot be left blank.");
    return false;
  }

  let finalEst = Number(estPomodoros);

  // Block invalid values ​​(NaN) and negative numbers.
  if (Number.isNaN(finalEst) || finalEst < 0) {
    console.error(
      "Error: Adding Task: The Est. Pomodoros number must be >= 0.",
    );
    return false;
  }

  // Handling decimal rules:
  // - If less than 1 (0 to 0.9): Keep as is.
  // - If 1 or more: Remove the decimal part.
  if (finalEst >= 1) {
    finalEst = Math.floor(finalEst);
  }

  const newId = crypto.randomUUID(); // Random ID

  const newTask = {
    id: newId,
    name: taskname.trim(),
    est: finalEst,
    act: 0,
    isDone: false,
  };

  tasks.push(newTask);
  console.log(`More success: "${newTask.name}" (Est: ${newTask.est})`);
  return newTask;
}

// Logic: Edit Task
function editTask(id, newName, newAct, newEst) {
  // Block incoming junk IDs.
  if (typeof id !== "string" || id.trim() === "") {
    console.error("Error: Editing Task: Invalid or blank ID.");
    return false;
  }

  // Find Task
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    console.error(`Error: Editing Task: No tasks with ID found [${id}].`);
    return false;
  }

  const task = tasks[taskIndex];

  // Check act

  // Block Blank Name
  if (typeof newName !== "string" || newName.trim() === "") {
    console.error("Error: Editing Task: Invalid or blank task name.");
    return false;
  }

  // Block Blank Act & Decimal Logic Handling
  if (newAct === undefined || newAct === "" || newAct === null) {
    console.error("Error: Editing Task: Act Pomodoros cannot be left blank.");
    return false;
  }
  let finalAct = Number(newAct);
  if (Number.isNaN(finalAct) || finalAct < 0) {
    console.error(
      "Error: Editing Task: The Act Pomodoros number must be >= 0.",
    );
    return false;
  }
  if (finalAct >= 1) {
    finalAct = Math.floor(finalAct);
  }

  // Block Blank Est. & Decimal Logic Handling
  if (newEst === undefined || newEst === "" || newEst === null) {
    console.error("Error: Editing Task: Est Pomodoros cannot be left blank.");
    return false;
  }
  let finalEst = Number(newEst);
  if (Number.isNaN(finalEst) || finalEst < 0) {
    console.error(
      "Error: Editing Task: The Est Pomodoros number must be >= 0.",
    );
    return false;
  }
  if (finalEst >= 1) {
    finalEst = Math.floor(finalEst);
  }

  task.name = newName.trim();
  task.act = finalAct;
  task.est = finalEst;

  console.log(
    `Edited successfully: Task ID [${id}] has been updated. (Act: ${task.act}, Est: ${task.est})`,
  );
  return true;
}

// Logic: Delete a Task
function deleteTask(id) {
  // Block junk ID input
  if (typeof id !== "string" || id.trim() === "") {
    console.error("Task Deletion Error: ID task invalid.");
    return false;
  }

  // Remember the array length before deleting
  const initialLength = tasks.length;

  // Filter out tasks with the corresponding ID.
  tasks = tasks.filter((task) => task.id !== id);

  // Verify that the deletion was actually done.
  if (tasks.length === initialLength) {
    console.warn(
      `Warning: Deleted: No task with ID found [${id}], Nothing was deleted.`,
    );
    return false;
  }

  console.log(
    `Deletion successful: Task ID [${id}] It has been removed from the system.`,
  );
  return true;
}

// Logic: Toggle Task Done Status
function toggleTaskDone(id) {
  // Block junk ID input
  if (typeof id !== "string" || id.trim() === "") {
    console.error("Error: Toggling Task: Invalid or blank ID.");
    return false;
  }

  // Find Task
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    console.error(`Error: Toggling Task: No tasks with ID found [${id}].`);
    return false;
  }

  // Toggle the status
  const task = tasks[taskIndex];
  task.isDone = !task.isDone;

  console.log(
    `Status updated: Task "${task.name}" is now ${task.isDone ? "DONE (True)" : "NOT DONE (False)"}.`,
  );
  return true;
}

// Logic: Delete All Tasks
function deleteAllTasks() {
  // Check if the array is already empty
  if (tasks.length === 0) {
    console.warn(
      "Warning: Delete All: The task list is already empty. Nothing to delete.",
    );
    return false;
  }

  // Clear the array
  tasks = [];

  console.log("Delete All successful: All tasks have been completely cleared.");
  return true;
}

function calculateTotals() {
  return tasks.reduce(
    (acc, task) => {
      acc.totalEst += task.est;
      acc.totalAct += task.act;

      if (!task.isDone && task.est > task.act) {
        acc.remainingPomos += task.est - task.act;
      }

      return acc;
    },
    { totalEst: 0, totalAct: 0, remainingPomos: 0 },
  );
}

function calculateFinishTime(remainingPomos) {
  if (remainingPomos <= 0) return "";

  const POMO_SECONDS = 25 * 60;
  const totalSeconds = remainingPomos * POMO_SECONDS;

  const hoursNeeded = (totalSeconds / 3600).toFixed(1);

  const now = new Date();

  now.setSeconds(now.getSeconds() + totalSeconds);

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes} (${hoursNeeded}h)`;
}

function getAggregationData() {
  const totals = calculateTotals();
  const finishAtString = calculateFinishTime(totals.remainingPomos);

  const data = {
    totalEst: totals.totalEst,
    totalAct: totals.totalAct,
    finishAt: finishAtString,
  };

  console.log("Aggregation Data:", data);
  return data;
}
