// ACCESSOR PROPERTY
let product ={
  nameproduct : "Shirt",
  originalprice : 200000
};

// defineProperty
Object.defineProperty(product,"sellingprice", {
  // Get: Automatically add a 10% tax when making a call
  get: function() {
    return this.originalprice * 1.1;
  },
  // Set: Automatically deduct the tax before storing in the warehouse
  set: function(askingprice) {
    this.originalprice = askingprice / 1.1;
  },
  enumerable: true,
  configurable: true  
});

console.log("Selling price: ", product.sellingprice);
product.sellingprice = 330000; // New sellingprice
console.log("Original price to low:", product.originalprice);

//PROTOTYPE
let father = {
  firstname: "Nguyen",
  home: "redbook"
};
//Son
let son = Object.create(father);
son.name = "Teo";

console.log("Name son: ", son.name);
console.log("Son sell home:", son.home);