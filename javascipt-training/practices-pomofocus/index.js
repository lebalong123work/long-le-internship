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
