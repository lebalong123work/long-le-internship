// PROVING THE UNIQUENESS OF SYMBOL

let account1 = Symbol("id");
let account2 = Symbol("id");

console.log("See: ", account1, account2);
// ===
console.log("Answer: ", account1 === account2);

// Overwrite in OBJECT

let accountuser = {
  name: "Le Ba Long"
}

// Use Symbol to make key secret for account
const keysecret = Symbol("id_123");
accountuser[keysecret] = "User_VIP_123";

// Creat same Symbol

const keysame = Symbol("id_123");
accountuser[keysame] = "Hack";

// What Happen

console.log("ID account: ", accountuser[keysecret]);
console.log("ID fake: ", accountuser[keysame]);

// Hide Symbol

console.log("Look at the common properties: ");
for (let key in accountuser){
  console.log("See key: ", key); // See "name", Symbol is hide
}

// Whant to see Symbol
let keySymbol = Object.getOwnPropertySymbols(accountuser);
console.log("Now can see Symbol: ", keySymbol);