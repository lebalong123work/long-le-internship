const showTaskFormBtn = document.getElementById("showTaskFormBtn");
const taskFormContainer = document.getElementById("taskFormContainer");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const taskNameInput = document.getElementById("taskNameInput");
const estPomodorosInput = document.getElementById("estPomodorosInput");
const taskList = document.getElementById("taskList");

let tasks = [];

taskFormContainer.style.display = "none";

showTaskFormBtn.addEventListener("click", () => {
  showTaskFormBtn.style.display = "none";
  taskFormContainer.style.display = "block";
});

cancelTaskBtn.addEventListener("click", () => {
  taskFormContainer.style.display = "none";
  showTaskFormBtn.style.display = "block";

  taskNameInput.value = "";
  estPomodorosInput.value = "1";
});