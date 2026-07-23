# The Pomodoro Technique

This technique helps  work better by breaking  time into clear parts. Here is how it works:

## The Six Steps

1. **Choose a task:** Pick one thing you want to get done.
2. **Set a timer:** Set your timer for 25 minutes.
3. **Work:** Focus only on your task until the timer rings.
4. **Take a short break:** When the timer rings, stop working and rest for 5 to 10 minutes.
5. **Repeat:** Go back to step 2 and do this again until you have finished four work periods.
6. **Take a long break:** After finishing four work periods, take a longer rest, usually 20 to 30 minutes. Once you are done resting, go back to step 2.

## Important Points

* **What is a Pomodoro?** It is just a name for one 25-minute period of focused work.
* **The Goal:** The main idea is to stop outside distractions from breaking your concentration. 
* **Handling Interruptions:** Should not stop once start a 25-minute period. If someone interrupts, either write down the new task to do later, or stop work session and start over.
* **Planning and Tracking:**
    * **Plan:** Write down a list of things want to do today. This helps guess how much time will need.
    * **Track:** As  finish each 25-minute period, write it down. This helps feel like have achieved something and lets look back to see how can do even better next time.

# Code Explanation
js/pomodoro.js
```javascript
let tasks = [];
const pomodoroForm = document.querySelector( '.js-add-task' );
const pomodoroTableBody = document.querySelector( '.js-task-table-body' );
```
## 1. `let tasks = [];`
* **What it is:** A blank array to store all your task data.
* **Analogy:** Think of this as the manager's empty notebook. Every time a user adds a new task, the manager writes the details (task name, pomodoro count) into this notebook. Any changes (marking a task as done, increasing pomodoros, or deleting a task) must be updated in this notebook first.

## 2. `const pomodoroForm = document.querySelector( '.js-add-task' );`
* **What it is:** A reference to the HTML form used to add new tasks.
* **Analogy:** This is like the manager pointing to the order counter labeled `.js-add-task`. The manager says: "This is the order counter. Whenever someone submits a new task form here, I need to handle it right away."

## 3. `const pomodoroTableBody = document.querySelector( '.js-task-table-body' );`
* **What it is:** A reference to the HTML table body where tasks will be displayed as rows.
* **Analogy:** This is like the manager pointing to the empty bulletin board on the wall labeled `.js-task-table-body`. The manager says: "This is our display board. Later, I will read the data from my notebook, create HTML rows, and pin them here for the user to see."

---
**Summary:** These lines help JavaScript connect to the HTML elements and set up a data storage area in memory.
 
# Code Explanation: addTask
## 4. Form Submission & `event.preventDefault()`
* **The Concept:** By default, when an HTML form is submitted, it tries to send data to a server and reload the page. In our modern app, we want to handle the data directly in the browser without reloading.
* **The Analogy:** Imagine when a customer submits an order, the standard procedure is to run to the Central Kitchen (Server) and reset the whole restaurant (page reload). `event.preventDefault()` is the manager shouting: *"Stop! Do not go to the kitchen. I will process this order right here at the counter!"*

## 5. `javascript:void(0)` vs `preventDefault()`
* **The Concept:** The HTML attribute `action="javascript:void(0)"` already stops the page from reloading. However, using `preventDefault()` inside JavaScript acts as a safety net in case someone accidentally deletes that HTML code.
* **The Analogy:** The HTML attribute is a sticky note on the counter saying *"Don't run to the kitchen."* But what if someone accidentally throws the note away? The manager explicitly enforcing `preventDefault()` guarantees the rule is always followed.

## 6. `this.reset()`
* **The Concept:** Inside the event handler, `this` refers to the form element itself. Calling `.reset()` clears all the input fields.
* **The Analogy:** After the manager has successfully copied the customer's order into the notebook, `this.reset()` is the manager wiping the counter clean so it is perfectly ready for the next customer.

## 7. Extracting Values: `this.querySelector` vs `document.querySelector`
```javascript
const taskName = this.querySelector( '.js-task-name' ).value;

```

* **The Concept:** Inside the form submission handler, `this` refers to the form element. Using `this.querySelector` restricts the search only to the elements inside that specific form, which is faster and safer than searching the entire `document`. The `.value` property is then used to extract the actual text or selection the user inputted.
* **The Analogy:** `document.querySelector` is like searching the entire restaurant building for a specific item. `this.querySelector` is the manager saying, *"I am standing right at this specific order counter (`this`). I will only look exactly here to find the customer's input."* Looking at the input box just gives you the physical box; `.value` is reading the actual handwriting inside it.

## 8. Updating the State: `tasks.push(...)`

```javascript
tasks.push( { taskName, pomodoroDone: 0, pomodoroCount, finished: false } );

```

* **The Concept:** We take the extracted values and create a new JavaScript Object representing the task. We then push this object into our `tasks` array (our state). Note the ES6 object property shorthand: writing `taskName` is the same as `taskName: taskName`.
* **The Analogy:** After reading the customer's input, the manager opens the master notebook (`tasks`) and writes (`push`) a new entry. The manager records the requested name and count, and sets the starting rules: 0 pomodoros done so far, and it is not finished yet (`false`).