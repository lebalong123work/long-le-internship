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