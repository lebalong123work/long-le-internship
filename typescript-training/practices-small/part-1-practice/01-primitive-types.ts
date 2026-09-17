// PART I - PRIMITIVE TYPES: string, number, boolean
// Requirements:
// 1. From the JS newTask object, write a TypeScript object with exactly 5 fields:
//    id, name, est, act, isDone.
// 2. Explicitly assign primitive types to these fields.
// 3. Rewrite the function parsePomodoro with input as string | number | null | undefined
//    and output as number | null, focusing only on distinguishing primitives.
// 4. Keep the original JS logic: empty/non-numeric/negative values return null;
//    valid numbers return number.
// 5. Create an error in a comment to observe:
//    `act: "0"` is incorrect because act must be a number.
//    Fix the error by using `act: 0`, do not use `as number` to bypass the error.

const newTask: {
  id: string;
  name: string;
  est: number;
  act: number;
  isDone: boolean;
} = {
  id: "70eac773-eb03-4b67-8358-e1267b99b477",
  name: "Learn TypeScript",
  est: 1,
  act: 0,

  isDone: false,
};

function parsePomodoro(
  value: string | number | null | undefined,
): number | null {
  if (value === undefined || value === "" || value === null) {
    return null;
  }

  let finalVal = Number(value);

  if (Number.isNaN(finalVal) || finalVal < 0) {
    return null;
  }

  finalVal = Math.floor(finalVal);

  return finalVal;
}
export {};
