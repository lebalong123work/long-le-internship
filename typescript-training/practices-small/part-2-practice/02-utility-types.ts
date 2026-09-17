// PART I - UTILITY TYPES
//
// Required JavaScript source to read:
// - js/logic/taskLogic.js -> read the editTask() function (takes draftUpdatedTask) and getSummaryData().
// - js/api/storage.js -> read the updateTask(taskId, updatedTask) function.
// Requirements:
// 1. Define: `interface Task { id: string; name: string; est: number; act: number; isDone: boolean; }`
// 2. Create `type TaskUpdate = Partial<Task>;`. Write a simulated function `updateTask(id: string, payload: TaskUpdate)`.
// 3. Create `type NewTaskInput = Omit<Task, "id" | "isDone" | "act">;`. Write a simulated function `addTask(data: NewTaskInput)`.
// 4. Automatically extract the return type of getSummaryData:
//    `function getSummaryData() { return { totalEst: 10, totalAct: 5, finishAt: "12:00" }; }`
//    `type Summary = ReturnType<typeof getSummaryData>;`
// 5. Use Record: Create `const taskDictionary: Record<string, Task> = {};` to quickly look up tasks by ID.
// 6. Use Readonly: Create `const strictTask: Readonly<Task> = { ... }`. Try modifying `strictTask.name = "New"`.

interface Task {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
}
type TaskUpdate = Partial<Task>;

function updateTask(id: string, payload: TaskUpdate) {
  console.log(`Updating ${id} with`, payload);
}

type NewTaskInput = Omit<Task, "id" | "isDone" | "act">;

function addTask(data: NewTaskInput) {
}
function getSummaryData() {
  return { totalEst: 10, totalAct: 5, finishAt: "12:00" }; 
}

type Summary = ReturnType<typeof getSummaryData>;

const taskDictionary: Record<string, Task> = {
  "task-1": { id: "task-1", name: "Đọc sách", est: 2, act: 0, isDone: false }
};

const strictTask: Readonly<Task> = {
  id: "2",
  name: "Can not change",
  est: 3,
  act: 1,
  isDone: true
};
export {};

