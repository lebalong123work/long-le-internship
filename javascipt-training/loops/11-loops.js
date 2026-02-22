const numbers = [2, 4, 6, 8, 10];
console.log('--- Iterate numbers array ---');
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i]);
}

const names = ['Alice', 'Bob', 'Charlie'];
console.log('--- Iterate names array ---');
for (const name of names) {
    console.log('Hello ' + name);
}

const bills = [100, 50, 200];
let total = 0;

for (const bill of bills) {
    total = total + bill;
}
console.log('Total bill:', total);