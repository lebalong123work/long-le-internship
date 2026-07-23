let accountgame = {};

Object.defineProperty(accountgame, "name", {
  value: "LeeSan", // [value] Items inside the drawer
  writable: false, // [writable] Hardlock, NO NAME CHANGE ALLOWED
  enumerable: false, // [enumerable] Invisible, NOT VISIBLE WHEN SCANNING IN A LOOP
  configurable: false, // [configurable] Immortal, DO NOT DELETE this attribute
});

// Test
//[value]
console.log("Name: ", accountgame.name);

//[writable: false]
accountgame.name = "LBL";
console.log("Try change name: ", accountgame.name);

//[enumerable: false]
accountgame.level = 50;
for (let key in accountgame) {
  console.log("See attribute: ", key)
}

//[configurable: false]
delete accountgame.name;
console.log("Delete: ", accountgame.name);

try {
  Object.defineProperty(accountgame, "name", {
    writable: true // try turn on
  });
} catch (error) {
  console.log(Error);
}
