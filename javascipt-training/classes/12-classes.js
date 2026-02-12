class Dog {
    constructor(name) {
        this.name = name;
    }

    bark() {
        console.log(this.name + ' barks woof woof!');
    }
}

const myDog = new Dog('Buddy');
myDog.bark();

class BankAccount {
    constructor() {
        this.balance = 0;
    }

    deposit(amount) {
        this.balance = this.balance + amount;
        console.log('Deposited ' + amount + '. New balance: ' + this.balance);
    }
}

const myAccount = new BankAccount();
myAccount.deposit(100);

class Animal {
    move() {
        console.log('Moving...');
    }
}

class Bird extends Animal {
    fly() {
        console.log('Flying');
    }
}

const myBird = new Bird();
myBird.move();
myBird.fly();