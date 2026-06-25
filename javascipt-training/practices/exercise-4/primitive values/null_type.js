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
