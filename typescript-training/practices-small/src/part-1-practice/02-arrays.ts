// PART I - ARRAYS
// Requirements:
// 1. Create a Task interface based on the newTask object in taskLogic.js.
// 2. Declare `tasks` as `Task[]`, replacing `let tasks = []` in JS.
// 3. Create a `number[]` containing pomodoro numbers and a `string[]` containing task names.
// 4. Create an array using `Array<number>` and add a comment: it is equivalent to `number[]`.
// 5. Write a function to filter incomplete tasks using filter.
// 6. Write a function to calculate total est using reduce; the accumulator must be a number.
// 7. Write a function to find a task by id and handle the `Task | undefined` case.
// 8. Write a separate example showing that `[number]` is a 1-element tuple, not
//    a number array. Try adding a second element to read the TypeScript error.

interface Task {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
}

let tasks: Task[] = [];

let estPomodoros: number[] = [1, 2, 4];
let taskNames: string[] = ["Học TS", "Đọc sách"];

let actPomodoros: Array<number> = [0, 1, 0];

function getActiveTasks(allTasks: Task[]): Task[] {
  return allTasks.filter((task) => !task.isDone);
}

function getTotalEst(allTasks: Task[]): number {
  return allTasks.reduce((acc, task) => acc + task.est, 0);
}

function getTaskById(allTasks: Task[], id: string): Task | undefined {
  const foundTask = allTasks.find((task) => task.id === id);
  if (foundTask === undefined) {
    return undefined;
  }
  return foundTask;
}

let singleNumberTuple: [number] = [42];
export {};
