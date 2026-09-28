// PART I - OBJECT TYPES & OPTIONAL PROPERTIES
// Requirements:
// 1. Define a `Task` type representing a complete task object (id, name, est, act, isDone).
// 2. Define a `TaskUpdate` type representing `draftUpdatedTask`. Because this is update data,
//    make all fields (name, est, act, isDone) optional (using `?`).
// 3. Write a simulated function `updateTask(taskId: string, payload: TaskUpdate)`.
// 4. Inside that function, intentionally call `console.log(payload.name.toUpperCase())` to observe the TypeScript error.
// 5. Fix the error using one of two safe approaches: use an `if (payload.name !== undefined)` check or
//    use the modern `payload.name?.toUpperCase()` syntax.
// 6. Call the `updateTask` function twice: once passing `{ name: "New Name" }`, and once passing `{}` (an empty object).
//

type Task = {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
};

type TaskUpdate = {
  name?: string;
  est?: number;
  act?: number;
  isDone?: boolean;
};

function updateTask(taskId: string, payload: TaskUpdate) {
  console.log(payload.name?.toUpperCase());

  if (payload.name !== undefined) {
    console.log(payload.name.toUpperCase());
  }
}

updateTask("1", { name: "New Name" });
updateTask("2", {});
export {};
