const colors = ['Blue', 'Red', 'Purple'];
console.log('First element:', colors[0]);
console.log('Array length:', colors.length);

colors[2] = 'Yellow';
console.log('New color array:', colors);

const tasks = [];
tasks.push('Learn JS');
tasks.unshift('Exercise');
console.log('Tasks after adding:', tasks);

tasks.pop();
console.log('Tasks after removing last:', tasks);

const matrix = [
    [1, 2],
    [3, 4]
];
console.log('Number 4 in matrix:', matrix[1][1]);