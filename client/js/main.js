// function test() {
for (let i = 0; i < 10; i++) {
    setTimeout(function() {
        console.log(Date.now(), i);
    }, 1000 * i);
}
// }
console.log(111);