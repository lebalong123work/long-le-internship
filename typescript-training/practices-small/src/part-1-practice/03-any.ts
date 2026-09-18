// PART I - ANY
// Requirements:
// 1. Simulate an API JSON response using `let responseData: any`.
// 2. Write operations inside comments to observe: read a non-existent property,
//    call responseData like a function, assign responseData to a number.
// 3. Explain why the lines above are allowed by TypeScript when using `any`,
//    but can crash or produce incorrect results at runtime.
// 4. Rewrite a safer version using `unknown` + type guard or using a
//    Task interface. Do not use `any` at the final boundary.
// 5. Write a function with an untyped parameter, for example `function read(value)`,
//    then enable `noImplicitAny` in the tsc command to observe the error.
// 6. Fix the implicit any with an explicit type; do not fix it by indiscriminately adding `any`.


let responseData: any = { id: "1", name: "Learn TypeScript", est: 1 };
interface Task {
  id: string;
  name: string;
  est: number;
}

let safeResponseData: unknown = { id: "2", name: "Safe Task", est: 2 };

function isTask(data: any): data is Task {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.id === "string" &&
    typeof data.name === "string" &&
    typeof data.est === "number"
  );
}

if (isTask(safeResponseData)) {
  console.log(safeResponseData.name);
}

function read(value: string | number) {
  console.log(value);
}

export {};
