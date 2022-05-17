const name = "Yuri";
let age = 28;
const hasHobbies = true;

age = 30;

// console.log(name);

function summarizeUser(userName, userAge, userHasHobby) {
  return "Name is " + userName + ", age is " + userAge + " and the user has hobbies: " + userHasHobby;
}

const add = (a, b) => a + b;
console.log(add(1, 2));

const addOne = (a) => a + 1;
console.log(addOne(1));

const addOneAndTwo = () => 1 + 2;
console.log(addOneAndTwo());

console.log(summarizeUser(name, age, hasHobbies));
