const { validatePhoneNumberLength, parsePhoneNumber } = require('libphonenumber-js');

const iso = 'HK';
console.log(`Testing Validation for HK (Realistic Numbers)...\n`);

// HK Mobile starts with 5, 6, 9
const cases = [
    '61234567',       // 8 digits (Valid Mobile start)
    '612345678',      // 9 digits
    '6123456789',     // 10 digits
    '61234567890',    // 11 digits (User reported issue)
];

cases.forEach(digits => {
    let lengthResult = validatePhoneNumberLength(digits, iso);
    let isValid = false;
    try {
        const parsed = parsePhoneNumber(digits, iso);
        isValid = parsed && parsed.isValid();
    } catch (e) { isValid = false; }

    console.log(`Input: ${digits} (Length: ${digits.length})`);
    console.log(`  validatePhoneNumberLength: ${lengthResult}`);
    console.log(`  parsePhoneNumber(...).isValid(): ${isValid}`);
    console.log('---');
});
