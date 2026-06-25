// Number types
let numberSafeMax = Number.MAX_SAFE_INTEGER;
console.log("Max safe integer:", numberSafeMax);

console.log("Math:", numberSafeMax === (numberSafeMax + 1 - 1));

let numberBig = numberSafeMax + 1;
console.log("numberBig + 1 :", numberBig + 1);
console.log("numberBig + 2 :", numberBig + 2);
console.log("numberBig + 3 :", numberBig + 3);
console.log("numberBig + 4 :", numberBig + 4);
console.log("numberBig + 5 :", numberBig + 5);
// Check
console.log(Number.isSafeInteger(numberBig + 5));

// Too Big
let numberTooBig = Number.MAX_VALUE;
console.log("Number computer can save in:", numberTooBig);

let infinity = numberTooBig * 2;
console.log("Answer: ", infinity);

// Math
console.log("Answer: ", infinity + 10000000000000000000000000);

// Too Small

let numberTooSmall = Number.MIN_VALUE;
console.log("Number small can see:", numberTooSmall);

// Math
console.log("Answer: ", numberTooSmall / 2);

// NEGATIVE ZERO
let negativezero = -Number.MIN_VALUE / 2;

console.log("Answer: ", negativezero);
