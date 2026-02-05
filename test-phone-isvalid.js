const { parsePhoneNumber } = require('libphonenumber-js');

const country = 'AU';
const digitsMobile = '04';

console.log(`Stress Testing AU isValid() starting with '04'...\n`);

for (let i = 2; i <= 15; i++) {
    const raw = digitsMobile.padEnd(i, '1'); // 04111...
    let isValid = false;
    try {
        const parsed = parsePhoneNumber(raw, country);
        isValid = parsed.isValid();
    } catch (e) {
        isValid = false;
    }
    console.log(`Length ${i}: ${raw} -> Valid: ${isValid}`);
}

const digitsNoTrunk = '4';
console.log(`\nStress Testing AU isValid() starting with '4'...\n`);
for (let i = 1; i <= 15; i++) {
    const raw = digitsNoTrunk.padEnd(i, '1'); // 4111...
    let isValid = false;
    try {
        const parsed = parsePhoneNumber(raw, country);
        isValid = parsed.isValid();
    } catch (e) {
        isValid = false;
    }
    console.log(`Length ${i}: ${raw} -> Valid: ${isValid}`);
}
