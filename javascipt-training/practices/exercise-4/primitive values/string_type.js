// Count INDEX and LENGTH
let mess = "Hello";

console.log("The character at position 0: ", mess [0]);
console.log("The character at position 4: ", mess [4]);

// leght
console.log("Leght: ", mess.length);
// emoji
let icon = "🧸";
console.log("See icon: ", icon);
console.log("Leght icon: ", icon.length);

// String IMMUTABLE
let userName = "Long"

userName[0] = "B";

console.log("Name when change: ", userName);

// Want change: Make new String 
let oldname = "Khang";

// method to cut string --- substring()

let newname = oldname.substring(0,3);

console.log("Cut: ",newname);
console.log("See: ",oldname);

// Use + new string
let finalname = oldname + "Li";
console.log("Final name: ", finalname)
