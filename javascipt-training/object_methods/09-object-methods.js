const calculator = {
    a: 5,
    b: 10,
    sum: function() {
        return this.a + this.b;
    }
};
console.log('Sum is:', calculator.sum());

const user = {
    name: 'Admin',
    greet: function(message) {
        console.log(message + ', ' + this.name + '!');
    }
};
user.greet('Hello');

const robot = {
    name: 'Robot 1',
    info_1: function() {
        console.log('Regular Function:', this.name);
    },
    info_2: () => {
        console.log('Arrow Function:', this.name);
    }
};
robot.info_1();
robot.info_2();