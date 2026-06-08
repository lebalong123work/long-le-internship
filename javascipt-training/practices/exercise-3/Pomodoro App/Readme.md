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
 