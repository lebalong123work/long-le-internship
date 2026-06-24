let box = 100;
console.log("First time is number:", box, "Type of box:", typeof box);

box = "Hello World";
console.log("Second time is string:", box, "Type of box:", typeof box);

let answer = 10 + "20";
console.log("Answer is:", answer, "Type of answer:", typeof answer);

let variablenotvalue;
console.log("Variable not assigned value:", variablenotvalue, "Type of variablenotvalue:", typeof variablenotvalue);

let wallet = { money: 100 };
console.log("Money doesn't exist in:", wallet.bank);

let accountbank = 1000000;
accountbank = null;
console.log("Account bank is:", accountbank, "Type of accountbank:", typeof accountbank);

// right checking the type of null
console.log(accountbank === null);

// call method on null value
try {
  console.log(accountbank.toUpperCase());
} catch (error) {
  console.log("Error:", error.message);
}

console.log("'?.' operator on null value:", accountbank?.toUpperCase());

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

// NaN
let zeropositive = +0;
let zeronegative = -0;

console.log("Answer: ", zeronegative === zeropositive);

//  But
let answerpositive = 1 / zeropositive;
let answernegative = 1 / zeronegative;

console.log("Answer: ", answerpositive);
console.log("Answer: ", answernegative);

// ===
console.log("Answer: ", answerpositive === answernegative);

// When show out Nan
let math1 = "Hello" * 5;
console.log("Answer:", math1 );
let math2 = 0 / 0;
console.log("Answer:", math2 );

// ===
let valueNaN = NaN;
console.log("Answer: ", valueNaN === NaN);

// How to check this is NaN
console.log("Answer: ", Number.isNaN(valueNaN));
console.log("Answer: ", Number.isNumeric = Number.isNaN(1000));

