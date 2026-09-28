// PART I - CLASSES & OOP IN TYPESCRIPT
//
// Required JavaScript source to read:
// - js/storage/localDB.js -> The LocalDB object currently contains 2 functions: getTasks and saveTasks.
// - js/logic/taskLogic.js -> The addTask() function is manually creating the newTask object.
// Requirements:
// 1. Create an `ITask` interface containing fields: id, name, est, isDone.
// 2. Create a `Task` class that implements `ITask`. Use Parameter Properties in the constructor to quickly create
//    `public id`, `public name`, `public est`, and `public isDone`.
// 3. Inside the `Task` class, create a regular property `private _act: number = 0;` (Do not put it in the constructor).
// 4. Create a Getter `get act()` returning `this._act` and a Setter `set act(val: number)` to check:
//    if `val < 0` do not assign, otherwise set `this._act = val`.
// 5. Create an `abstract class BaseStorage` with an abstract method: `abstract fetchTasks(): Task[];`
// 6. Convert `LocalDB` (from js/storage/localDB.js) into a `LocalDB` class. Turn `getTasks` and `saveTasks`
//    into `static` methods.

interface ITask {
  id: string;
  name: string;
  est: number;
  isDone: boolean;
}
class Task implements ITask {
  private _act: number = 0;

  constructor(
    public id: string,
    public name: string,
    public est: number,
    public isDone: boolean = false,
  ) {}

  get act(): number {
    return this._act;
  }

  set act(val: number) {
    if (val >= 0) {
      this._act = val;
    }
  }
}

const myTask = new Task("1", "Learn OOP", 2);
abstract class BaseStorage {
  abstract fetchTasks(): Task[];
}

class LocalDB {
  static getTasks(): Task[] {
    const data = localStorage.getItem("anonymous_tasks");
    return data ? JSON.parse(data) : [];
  }

  static saveTasks(tasksArray: Task[]): void {
    const stringifiedData = JSON.stringify(tasksArray);
    localStorage.setItem("anonymous_tasks", stringifiedData);
  }
}
const savedTasks = LocalDB.getTasks();
export {};
