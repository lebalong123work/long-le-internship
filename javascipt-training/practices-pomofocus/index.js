let tasks = [];
const POMODORO_MINUTES = 25;
const SECONDS_PER_HOUR = 3600;

function getTaskIndexById(id, actionName) {
  if (typeof id !== "string" || id.trim() === "") {
    console.error(`Error: ${actionName}: Invalid or blank ID.`);
    return -1;
  }

  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    console.error(`Error: ${actionName}: No tasks with ID found [${id}].`);
    return -1;
  }

  return taskIndex;
}

function parsePomodoro(value, fieldName, actionName) {
  if (value === undefined || value === "" || value === null) {
    console.error(`Error: ${actionName}: ${fieldName} cannot be left blank.`);
    return null;
  }

  let finalVal = Number(value);

  if (Number.isNaN(finalVal) || finalVal < 0) {
    console.error(
      `Error: ${actionName}: The ${fieldName} number must be >= 0.`,
    );
    return null;
  }

  if (finalVal >= 1) {
    finalVal = Math.floor(finalVal);
  }

  return finalVal;
}

// Logic: Add a new task
function addTask(taskname, estPomodoros) {
  // Check Name Task
  if (typeof taskname !== "string" || taskname.trim() === "") {
    console.error("Error: Adding Task: Invalid or blank task name.");
    return null;
  }

  // BLOCK BLANK: If no input is entered, enter an empty string, or null. Error will be reported.
  let finalEst = parsePomodoro(estPomodoros, "Est. Pomodoros", "Adding Task");
  if (finalEst === null) {
    return null;
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
  const taskIndex = getTaskIndexById(id, "Editing Task");
  if (taskIndex === -1) return false;

  const task = tasks[taskIndex];

  // Check act

  // Block Blank Name
  if (typeof newName !== "string" || newName.trim() === "") {
    console.error("Error: Editing Task: Invalid or blank task name.");
    return false;
  }

  // Block Blank Act & Decimal Logic Handling
  let finalAct = parsePomodoro(newAct, "Act Pomodoros", "Editing Task");
  if (finalAct === null) return false;

  // Block Blank Est. & Decimal Logic Handling
  let finalEst = parsePomodoro(newEst, "Est Pomodoros", "Editing Task");
  if (finalEst === null) return false;

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
  const taskIndex = getTaskIndexById(id, "Deleting Task");
  if (taskIndex === -1) return false;

  tasks.splice(taskIndex, 1);

  console.log(
    `Deletion successful: Task ID [${id}] has been removed from the system.`,
  );
  return true;
}

// Logic: Toggle Task Done Status
function toggleTaskDone(id) {
  // Block junk ID input
  const taskIndex = getTaskIndexById(id, "Toggling Task");
  if (taskIndex === -1) return false;

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
      acc.totalAct += task.act;
      if (!task.isDone) {
        acc.totalEst += task.est;

        if (!task.isDone && task.est > task.act) {
          acc.remainingPomos += task.est - task.act;
        }
      }

      return acc;
    },
    { totalEst: 0, totalAct: 0, remainingPomos: 0 },
  );
}

function calculateFinishTime(remainingPomos) {
  if (remainingPomos <= 0) return "";

  const POMO_SECONDS = POMODORO_MINUTES * 60;
  const totalSeconds = remainingPomos * POMO_SECONDS;

  const hoursNeeded = (totalSeconds / SECONDS_PER_HOUR).toFixed(1);

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
