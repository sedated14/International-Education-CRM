const { validatePhoneNumberLength, parsePhoneNumber } = require('libphonenumber-js');

const iso = 'HK';
console.log(`Testing Validation for HK (Expected 8 digits)...\n`);

// Test cases
const cases = [
    '12345678',       // 8 digits (Valid)
    '123456789',      // 9 digits (Too Long)
    '1234567890',     // 10 digits
    '12345678901',    // 11 digits (User says this is allowed)
    '85212345678'     // 11 digits (Code + 8 digits) - checking if library expects this
];

cases.forEach(digits => {
    let lengthResult = validatePhoneNumberLength(digits, iso);
    let isValid = false;
    try {
        const parsed = parsePhoneNumber(digits, iso);
        isValid = parsed.isValid();
    } catch (e) { isValid = false; }

    console.log(`Input: ${digits} (Length: ${digits.length})`);
    console.log(`  validatePhoneNumberLength: ${lengthResult}`);
    console.log(`  parsePhoneNumber(...).isValid(): ${isValid}`);
    console.log('---');
});
