const { AsYouType, validatePhoneNumberLength } = require('libphonenumber-js');

const country = 'AU';
let digits = '4'; // Start with 4 (No trunk)

console.log(`Stress Testing AU validation starting with '4'...\n`);

for (let i = 1; i <= 20; i++) {
    const raw = digits.padEnd(i, '1'); // 4111...
    const result = validatePhoneNumberLength(raw, country);
    console.log(`Length ${i}: ${raw} -> ${result}`);
}

console.log("\nStress Testing AU validation starting with '04' (Mobile)...\n");
digits = '04';
for (let i = 2; i <= 20; i++) {
    const raw = digits.padEnd(i, '1'); // 04111...
    const result = validatePhoneNumberLength(raw, country);
    console.log(`Length ${i}: ${raw} -> ${result}`);
}
