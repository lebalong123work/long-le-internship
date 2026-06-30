const { Temporal } = require('@js-temporal/polyfill');

// Old
let oldDay = new Date(2026, 6, 30);
console.log("Date: ", oldDay.toLocaleDateString());

let day = new Date(2026, 5, 24);
let daycheck = day;

daycheck.setDate(daycheck.getDate() + 5);

console.log("Wrong day: ", day.toLocaleDateString());

//New

let newday = Temporal.PlainDate.from({year: 2026, month:12, day: 20});
console.log("Date: ", newday.toString());

let myday =  Temporal.PlainDate.from({year: 2026, month: 6, day: 24});

let mydayafter = myday.add({days: 5});

console.log("My day: ", myday.toString());
console.log("My day after: ", mydayafter.toString());

let timeVN = Temporal.Now.zonedDateTimeISO('Asia/Ho_Chi_Minh');
console.log("Time: ", timeVN.toString());

let timeNewYork = timeVN.withTimeZone('America/New_York');
console.log("Time: ", timeNewYork.toString());
