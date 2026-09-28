// PART I - ENUMS & OBJECTS VS ENUMS
//
// Required JavaScript source to read:
// - js/config/config.js -> read the properties of CONFIG.TIMER and CONFIG.STORAGE.
// - js/logic/timerLogic.js -> read the parameters of the setMode(modeName) function with the strings "pomo", "shortBreak", "longBreak".
// Requirements:
// 1. Create a Numeric Enum named `TimerDuration` with 3 keys: `Pomo = 25`, `ShortBreak = 5`, `LongBreak = 15`.
// 2. Verify Reverse mapping: Print `TimerDuration[25]` to the console (The result will return the string "Pomo").
// 3. Create a String Enum named `TimerMode` with 3 keys: `Pomo = "pomo"`, `ShortBreak = "shortBreak"`, `LongBreak = "longBreak"`.
// 4. Write a `switchMode(mode: TimerMode)` function. Try calling the function with `switchMode(TimerMode.Pomo)`.
// 5. Create a Const Enum named `StorageKeys` containing `AnonKey = "anonymous_tasks"`.
// 6. Practice "Objects vs Enums": Declare an `OTimer` object exactly like `CONFIG.TIMER` and add `as const` at the end.
//    Then create an `OTimerValues` type to extract the values 25 | 5 | 15 (use `typeof OTimer[keyof typeof OTimer]`).

enum TimerDuration {
  Pomo = 25,
  ShortBreak = 5,
  LongBreak = 15,
}
console.log(TimerDuration[25]);
enum TimerMode {
  Pomo = "pomo",
  ShortBreak = "shortBreak",
  LongBreak = "longBreak",
}
function switchMode(mode: TimerMode) {
  console.log("Mode:", mode);
}
switchMode(TimerMode.Pomo);
const enum StorageKeys {
  AnonKey = "anonymous_tasks",
}

const OTimer = {
  Pomo: 25,
  ShortBreak: 5,
  LongBreak: 15,
} as const;

type OTimerValues = (typeof OTimer)[keyof typeof OTimer];

export {};
