// PART I - MODULES: IMPORT, EXPORT & TYPE ONLY IMPORTS
//
// Required JavaScript source to read:
// - js/main.js -> See how this file imports multiple functions from other modules.
// - js/config/config.js -> See how to export a constant `export const CONFIG`.
// - js/utils/timeUtils.js -> Where the formatTime function is located.
// Requirements:
// 1. Simulate a `types.ts` file: Define and `export interface Task { id: string; name: string; }`.
// 2. Simulate a `timeUtils.ts` file: Convert the `formatTime(totalSeconds)` function
//    to TS and use `export default formatTime;`.
// 3. In the current file (treat it as `main.ts`):
//    - Use Named Import to get the `Task` type: `import type { Task } from "./types";`
//    - Use Default Import to get the formatTime function: `import formatTime from "./timeUtils";`
// 4. Declare a variable `const myTask: Task = { id: "1", name: "Learn Modules" };`.
// 5. Call `formatTime(1500)` and print the result to the console.

declare module "./types" {
  export interface Task { 
    id: string; 
    name: string; 
  }
}

declare module "./timeUtils" {
  export default function formatTime(totalSeconds: number): string;
}
import type { Task } from "./04-modules/types";

import formatTime from "./timeUtils";
const myTask: Task = { 
  id: "1", 
  name: "Learn Modules" 
};

console.log(formatTime(1500)); 

export {};