// PART I - INTERFACES & EXTENDING
//
// Required JavaScript source to read:
// - db.json -> examine the "tasks" array structure, especially the "userId" field.
// - js/api/storage.js -> read the createTask() function, pay attention to the code checking userId to insert it into newTask.
// Requirements:
// 1. Define a `BaseTask` interface with properties: id, name, est, act, isDone.
// 2. Define a `CloudTask` interface that extends `BaseTask`. The newly added property is `userId: string`.
// 3. Write a simulated function `saveTaskToCloud(task: CloudTask)`. Inside this function, try calling both `task.name` (from BaseTask) and `task.userId` (from CloudTask) to log them.
// 4. Verify the difference with type aliases:
//    - Create an `interface WindowConfig { title: string; }`. Right below it, create another `interface WindowConfig { isDarkMode: boolean; }`.
//    - Create a `type AppState = { isLoading: boolean; }`. Right below it, create another `type AppState = { hasError: boolean; }`.

interface BaseTask {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
}
interface CloudTask extends BaseTask {
  userId: string;
}
function saveTaskToCloud(task: CloudTask) {
  console.log("Saving task:", task.name);
  console.log("For user:", task.userId);
}
const localTask: BaseTask = {
  id: "1",
  name: "Học TS",
  est: 1,
  act: 0,
  isDone: false,
};
saveTaskToCloud({ ...localTask, userId: "user-123" });

interface WindowConfig {
  title: string;
}
interface WindowConfig {
  isDarkMode: boolean;
}

const myWindow: WindowConfig = {
  title: "Pomofocus",
  isDarkMode: true,
};

type AppState = {
  isLoading: boolean;
};
type AppStateError = { hasError: boolean };
type FullAppState = AppState & AppStateError;

export {};
