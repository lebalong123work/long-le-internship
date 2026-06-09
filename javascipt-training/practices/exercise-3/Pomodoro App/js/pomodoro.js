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

const renderTasks = function (tBodyNode, tasks = []) {
  tBodyNode.innerHTML = tasks
    .map(
      (task, id) => `
        <tr>
            <td class="cell-task-name">${task.taskName}</td>
            <td class="cell-pom-count">${task.pomodoroDone} / ${task.pomodoroCount} pomodori</td>
            <td class="cell-pom-controls">
            ${
              task.finished
                ? "Finished"
                : `
                <button class="js-task-done" data-id="${id}">Done</button>
                <button class="js-increase-pomodoro" data-id="${id}">Increase Pomodoro Count</button>`
            }
                <button class="js-delete-task" data-id="${id}">Delete Task</button>
            </td>
        </tr>
    `,
    )
    .join("");
};
