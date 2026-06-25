let numberMax = Number.MAX_SAFE_INTEGER;

console.log(numberMax);

let room1 = numberMax + 1;
let room2 = numberMax + 2;

console.log("Asnwer: ", room1);
console.log("Asnwer: ", room2);

// compare +1 = +2 ?
console.log("Ansswer: ", room1 === room2); // Wrong (true)

// Right BigInt

let numberMaxBigInt = 9007199254740991n;

let room1BigInt = numberMaxBigInt + 1n;
let room2BigInt = numberMaxBigInt + 2n;

console.log("Answer: ", room1BigInt);
console.log("Answer: ", room2BigInt);

// compare right

console.log("Answer: ", room1BigInt === room2BigInt);

// compare === and ==
console.log("Answer: ", 10n === 10); // false
console.log("Answer: ", 10n == 10); // true same value = 10

console.log("Answer: ", 5n / 2n);
console.log("Answer: ", 5 / 2);

try {
  let math = 10n + 5;
} catch (e) {
  console.log("Wrong");
}

let rightMath = 10n + BigInt(5);
console.log("Answer: ", rightMath);

