const { AsYouType, validatePhoneNumberLength } = require('libphonenumber-js');

const testCases = [
    { iso: 'US', digits: '2025550100', description: 'US Valid (10)' },
    { iso: 'US', digits: '20255501001', description: 'US Invalid (11)' },
    { iso: 'GB', digits: '7911123456', description: 'GB Mobile Valid (10)' },
    { iso: 'GB', digits: '79111234561', description: 'GB Mobile Invalid (11)' },
    { iso: 'AU', digits: '412345678', description: 'AU Mobile Valid (9)' },
    { iso: 'AU', digits: '41234567890', description: 'AU Mobile Invalid (11)' },
    { iso: 'IN', digits: '9876543210', description: 'IN Mobile Valid (10)' },
];

console.log("Testing Phone Validation Logic:\n");

testCases.forEach(({ iso, digits, description }) => {
    // 1. AsYouType Formatting
    const asYouType = new AsYouType(iso);
    const formatted = asYouType.input(digits);

    // 2. Validation
    const validationResult = validatePhoneNumberLength(digits, iso);

    console.log(`Test Case: ${description}`);
    console.log(`  ISO: ${iso}`);
    console.log(`  Input: ${digits}`);
    console.log(`  Formatted: ${formatted}`);
    console.log(`  Validation: ${validationResult} (Expected: ${description.includes('Invalid') ? 'TOO_LONG' : 'undefined/possible'})`);
    console.log("------------------------------------------------");
});
