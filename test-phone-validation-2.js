const { AsYouType, validatePhoneNumberLength } = require('libphonenumber-js');

const testCases = [
    // AU Tests
    { iso: 'AU', digits: '4', description: 'AU 1 digit' },
    { iso: 'AU', digits: '04', description: 'AU 2 digits' },
    { iso: 'AU', digits: '0412345678', description: 'AU Full Mobile (10)' },
    { iso: 'AU', digits: '04123456789', description: 'AU Too Long (11)' },
    { iso: 'AU', digits: '412345678', description: 'AU No Trunk (9)' },
    { iso: 'AU', digits: '41234567890', description: 'AU No Trunk Too Long (11)' },

    // GB Tests
    { iso: 'GB', digits: '7', description: 'GB 1 digit' },
    { iso: 'GB', digits: '07911123456', description: 'GB Full Mobile (11)' },
    { iso: 'GB', digits: '7911123456', description: 'GB No Trunk (10)' },
    { iso: 'GB', digits: '79111234561', description: 'GB No Trunk Too long (11)' },
];

console.log("Detailed Phone Validation Check:\n");

testCases.forEach(({ iso, digits, description }) => {
    // 1. AsYouType
    const asYouType = new AsYouType(iso);
    const formatted = asYouType.input(digits);

    // 2. Validation
    const validationResult = validatePhoneNumberLength(digits, iso);

    console.log(`Test Case: ${description}`);
    console.log(`  ISO: ${iso}`);
    console.log(`  Input: ${digits}`);
    console.log(`  Formatted: '${formatted}'`);
    console.log(`  Validation: ${validationResult}`);
    console.log("------------------------------------------------");
});
