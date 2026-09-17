// PART I - LITERAL TYPES & LITERAL INFERENCE
//
// Required JavaScript source to read:
// - js/logic/timerLogic.js -> read the setMode(modeName) function.
// - js/api/apiClient.js -> read the options.method parameter (e.g., options.method === "DELETE").
// Requirements:
// 1. Define a type alias `TimerMode` as a union of 3 literal strings: `"pomo" | "shortBreak" | "longBreak"`.
// 2. Write a simulated function `setMode(mode: TimerMode)`.
// 3. Try calling this function with `setMode("pomo")` (valid) and `setMode("long-break")` (intentionally misspelled to see the error).
// 4. Define a `RequestOptions` interface with property `method?: "GET" | "POST" | "DELETE" | "PATCH"`.
// 5. Write a simulated function `fetchAPI(url: string, options: RequestOptions)`.
// 6. Create an object: `const myOptions = { method: "POST" };`
// 7. Call `fetchAPI("/tasks", myOptions);` and observe the TypeScript error.
// 8. Fix this Inference error using one of the 2 ways taught in the documentation (using `as "POST"` or `as const`).

type TimerMode = "pomo" | "shortBreak" | "longBreak";

function setMode(mode: TimerMode) {
  console.log("Setting mode to:", mode);
}
setMode("pomo");

interface RequestOptions {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
}

function fetchAPI(url: string, options: RequestOptions) {
  console.log("Fetching:", url, "with method:", options.method);
}

const myOptions = { method: "POST" } as const;

fetchAPI("/tasks", myOptions);

export {};
