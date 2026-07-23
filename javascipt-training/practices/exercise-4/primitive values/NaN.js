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