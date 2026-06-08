let tasks = [];
const pomodoroForm = document.querySelector(".js-add-task");
const pomodoroTableBody = document.querySelector(".js-task-table-body");

const addTask = function (event) {
  event.preventDefault();
  const taskName = this.querySelector(".js-task-name").value;
  const pomodoroCount = this.querySelector(".js-pomodoro-count").value;
  this.reset();
  tasks.push({
    taskName,
    pomodoroDone: 0,
    pomodoroCount,
    finished: false,
  });
  renderTasks(pomodoroTableBody, tasks);
};
pomodoroForm.addEventListener("submit", addTask);
