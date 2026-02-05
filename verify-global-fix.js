const { getExampleNumber, validatePhoneNumberLength } = require('libphonenumber-js');
const examples = require('libphonenumber-js/examples.mobile.json');

const countries = ['US', 'GB', 'AU', 'CN', 'HK', 'FR', 'DE'];
// Scenario: User types "Valid + 1 digit"
// We want to see if our logic blocks it.

console.log("Country | Input (Length+1) | Lib Validation | Our Logic (Example Based)");
console.log("-----------------------------------------------------------------------");

countries.forEach(iso => {
    const example = getExampleNumber(iso, examples);
    if (!example) return;

    // Get "Official" Length
    // Note: formatNational return '+44 7xxx xxx xxx' or '04xx...' depending on parser. 
    // We strip non-digits to get the "Allowed Digit Count".
    // Wait, National Format for AU is '0412 345 678' (10 digits).
    // National Format for HK is '5123 4567' (8 digits).
    const exampleDigits = example.formatNational().replace(/[^0-9]/g, '');
    const maxLen = exampleDigits.length;

    // Simulate input: exampleDigits + '1'
    const input = exampleDigits + '1';

    // Logic Check
    let action = "ALLOWED (Bad)";
    if (input.length > maxLen) {
        action = "BLOCKED (Good)";
    }

    console.log(`${iso.padEnd(7)} | ${input.padEnd(16)} | ${validatePhoneNumberLength(input, iso).padEnd(14)} | ${action}`);
});
