// PART I - DECLARATIONS, DESTRUCTURING, SPREAD & RESOURCE MANAGEMENT
//
// Required JavaScript source to read:
// - js/logic/taskLogic.js -> read the getSummaryData() function (contains object extraction logic).
// - js/api/storage.js -> read the createTask() function (contains the phrase `const taskToSave = { ...newTask, userId }`).
// Requirements:
// 1. Destructuring & Renaming: Write a simulated `logSummary()` function. Create an object `totals = { totalEst: 10, totalAct: 5 }`.
//    Use destructuring to extract `totalEst` (rename to `estimated`), `totalAct` (rename to `actual`),
//    and `remainingPomos` (give a default value of `0` because `totals` does not have this property).
// 2. Spread: Declare an `interface Task { id: string; name: string }`.
//    Create `const baseTask: Task = { id: "1", name: "Learn TS" };`.
//    Use Spread to create `const cloudTask = { ...baseTask, userId: "user-123" };`.
// 3. using (Disposable): Define a `DbConnection` class that implements `Disposable`.
//    - Inside the `constructor`, `console.log("Open connection")`.
//    - Declare the method `[Symbol.dispose]() { console.log("Automatically close connection"); }`.
//    - Write the function `function syncTasks() { using conn = new DbConnection(); console.log("Syncing..."); }`
//      and try calling this function to observe the log order.

function logSummary() {
  const totals: { totalEst: number; totalAct: number; remainingPomos?: number } = { 
    totalEst: 10, 
    totalAct: 5 
  };

  const { 
    totalEst: estimated, 
    totalAct: actual, 
    remainingPomos = 0 
  } = totals;

  console.log("Estimated:", estimated, "Actual:", actual, "Remaining:", remainingPomos);
}

interface Task {
  id: string;
  name: string;
  userId?: string;
}

const baseTask: Task = { 
  id: "1", 
  name: "Learn TS",
};

const cloudTask = { ...baseTask, userId: "user-123" };

class DbConnection implements Disposable {
  constructor() {
    console.log("Open connection");
  }

  [Symbol.dispose]() {
    console.log("Automatically close connection");
  }
}

function syncTasks() {
  using conn = new DbConnection();
  console.log("Syncing...");
} 
syncTasks(); 

export {};