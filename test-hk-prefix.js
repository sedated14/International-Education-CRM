const { validatePhoneNumberLength } = require('libphonenumber-js');

const iso = 'HK'; // +852
const code = '+852';

console.log(`Testing HK Validation with prefix included...\n`);

const cases = [
    { digits: '61234567', desc: '8 Digits (Valid)' },
    { digits: '612345678', desc: '9 Digits' },
    { digits: '61234567890', desc: '11 Digits (Issue)' }
];

cases.forEach(({ digits, desc }) => {
    // Test 1: Standard (User input + ISO)
    const res1 = validatePhoneNumberLength(digits, iso);

    // Test 2: Full International (+Code + Digits)
    const full = code + digits;
    const res2 = validatePhoneNumberLength(full); // Detects country from +852

    console.log(`Case: ${desc}`);
    console.log(`  Input: ${digits}`);
    console.log(`  Standard (digits, 'HK'): ${res1}`);
    console.log(`  Full (${full}): ${res2}`);
    console.log('---');
});
