// PART I - UNION TYPES & NARROWING
//
// Required JavaScript source to read:
// - js/logic/taskLogic.js -> getTaskIndexById(id)
// - js/logic/taskLogic.js -> parsePomodoro(value)
// Requirements:
// 1. Write a function `getTaskIndexById(id: string | number)`. Inside this function, try calling `id.trim()`.
// 2. Observe the error, then fix it by using `if (typeof id === "string")` to narrow the type before calling `.trim()`. In the `else` branch, `id` will be a `number`.
// 3. Write a function `parsePomodoro(value: string | number | null)`. This function converts an input value into a pomodoro number (similar to the original JS code).
// 4. Inside that function, handle the `value === null` case (return null), then check if `typeof value === "string"`.
// 5. Try calling `getTaskIndexById` with input `123` and input `"uuid-string"`.
//

function getTaskIndexById(id: string | number) {
  if (typeof id === "string") {
    return id.trim();
  } else {
    return id;
  }
}

getTaskIndexById(123);
getTaskIndexById("uuid-string");

function parsePomodoro(value: string | number | null): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    if (value === "") return null;
  }
  let finalVal = Number(value);

  if (Number.isNaN(finalVal) || finalVal < 0) {
    return null;
  }

  return Math.floor(finalVal);
}

export {};
