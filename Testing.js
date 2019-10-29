"use strict";
function generateRandom(low, high) { return (Math.random() * (high - low + 1)) + low; }
for (let i = 0; i < 30; i++) {
    console.log(generateRandom(0, Math.PI / 4));
}
//# sourceMappingURL=Testing.js.map