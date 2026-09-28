// PART I - MIXINS & CLASS COMPOSITION
//
// Required JavaScript source to read:
// - js/logic/taskLogic.js -> Analyze the separated logic of the toggleTaskDone() and increaseActualPomodoros() functions.
// Requirements:
// 1. Define the `Constructor` type as shown in the documentation.
// 2. Create a simple `BaseTask` class containing only 3 properties: `public id: string`, `public name: string`, and `public isDone: boolean = false`.
// 3. Write the first Mixin: `function Toggleable<TBase extends Constructor>(Base: TBase)`.
//    Return an anonymous class inheriting from `Base`, adding a `toggleDone()` method to toggle `isDone`.
// 4. Write the second Mixin: `function Trackable<TBase extends Constructor>(Base: TBase)`.
//    Return an anonymous class inheriting from `Base`, adding an `act: number = 0` property and an `increaseAct()` method.
// 5. Compose them together: `const AdvancedTask = Trackable(Toggleable(BaseTask));`
// 6. Instantiate `const myTask = new AdvancedTask("1", "Learn Mixins");`.
//    Call `myTask.toggleDone()` and `myTask.increaseAct()`, then print `myTask` to the console.

type Constructor = new (...args: any[]) => {};

class BaseTask {
  constructor(
    public id: string,
    public name: string,
    public isDone: boolean = false,
  ) {}
}

type HasIsDone = new (...args: any[]) => { isDone: boolean };

function Toggleable<TBase extends HasIsDone>(Base: TBase) {
  return class extends Base {
    toggleDone() {
      this.isDone = !this.isDone;
    }
  };
}

function Trackable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    act: number = 0;

    increaseAct() {
      this.act += 1;
    }
  };
}

const AdvancedTask = Trackable(Toggleable(BaseTask));

// 6. Chạy thử nghiệm
const myTask = new AdvancedTask("1", "Learn Mixins");
myTask.toggleDone();
myTask.increaseAct();
console.log(myTask);

const basicTask = new BaseTask("2", "Basic");

export {};
