// PART I - TYPE INFERENCE, BEST COMMON TYPE & CONTEXTUAL TYPING
//
// Mandatory JavaScript source reading:
// - js/ui/uiTimer.js -> Where event listeners are attached like DOM.startTimerBtn.addEventListener("click", ...).
// - js/logic/taskLogic.js -> The calculateTotals function that uses tasks.filter() and tasks.reduce().
// Requirements:
// 1. Best Common Type: Declare a variable let mixedTasks = [{ id: 1, name: "A" }, { id: 2, est: 3 }, null];.
//    Do not write type annotations. Hover over it to see what type TS infers.
// 2. Contextual Typing with DOM: Write a function to simulate handling events like in uiTimer.js.
//    Declare: declare var myButton: { onclick: (e: MouseEvent) => void };
//    Assign: myButton.onclick = function(event) { console.log(event.button); }.
// 3. Contextual Typing with Array: Define interface Task { id: string; est: number; act: number; }.
//    Declare const myTasks: Task[] = [{ id: "1", est: 2, act: 0 }];.
//    Use myTasks.filter(t => t.act > 0). Hover over t to see how Contextual Typing works.

let mixedTasks = [{ id: 1, name: "A" }, { id: 2, est: 3 }, null];
declare var myButton: { onclick: (e: MouseEvent) => void };

myButton.onclick = function (event) {
  console.log(event.button);
};

interface Task {
  id: string;
  est: number;
  act: number;
}
const myTasks: Task[] = [{ id: "1", est: 2, act: 0 }];

const activeTasks = myTasks.filter((t) => t.act > 0);

export {};
