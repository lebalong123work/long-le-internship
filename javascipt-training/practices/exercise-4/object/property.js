// 1. ADD, REMOVE DRAWERS AND THE KEY-STYLE TRICK
let cabinet = {
  color: "Red",
};

cabinet.type = "Wood";
console.log("The cabinet after adding items: ", cabinet);

// Press Key: Use numer 100 to make name
cabinet[100] = "Old Book";
// JavaScript silently changes the number 100 to the word "100".
console.log(" Try call by word '100': ", cabinet[100]);

// Delete
delete cabinet.color;
console.log("Cabinet after delete color: ", cabinet);

// (ACCESSOR PROPERTY - GET/SET)
let user = {
  firstname: "Le Ba",
  lastname: "Long",

  // Use get to make +
  get fullname() {
    return this.firstname + " " + this.lastname
  },

  // Use set to check data 

  set updatename(newname) {
    if (newname.length < 2) {
      console.log("Wrong: name short");
    } else {
      this.lastname = newname;
    }
  }
};

console.log("Name: ", user.fullname);

user.updatename = "B";
user.updatename = "Khang";
console.log("Name Update: ", user.fullname);

// ATTRIBUTES

let secret = {};

Object.defineProperty(secret, "password", {
  value: "AA_BBB_CCCC",
  Writable: false, // Editing the content is not allowed.
  configurable: false, // Do not delete this pane.
  enumerable: false, // Hide, Do not show when scanning.
});

// Crack 

secret.password = "Hack";
console.log("Password have chang ?: ", secret.password); // writable: false has been blocked

// Scanning
console.log("Scanning: ", Object.keys(secret)); // Output an empty array [] (enumerable: false has hidden it)

// See something hide
let secrethide = Object.getOwnPropertyDescriptor(secret, "password")
console.log("What hide: ", secrethide);
