const { getExampleNumber, validatePhoneNumberLength, parsePhoneNumber } = require('libphonenumber-js');
const examples = require('libphonenumber-js/examples.mobile.json');

const countries = ['US', 'GB', 'AU', 'CN', 'HK', 'FR', 'DE'];

console.log("Country | Example (National) | Length | Validation Result for Length+1");
console.log("-----------------------------------------------------------------------");

countries.forEach(iso => {
    const example = getExampleNumber(iso, examples);
    if (!example) {
        console.log(`${iso} | No Example Found`);
        return;
    }

    const national = example.formatNational();
    const cleanNational = national.replace(/\D/g, '');
    const length = cleanNational.length;

    // Test Length + 1
    const tooLongNum = cleanNational + '1';
    const validation = validatePhoneNumberLength(tooLongNum, iso);

    // Test isValid transition
    let isValidStrict = false;
    try {
        const p = parsePhoneNumber(tooLongNum, iso);
        isValidStrict = p.isValid();
    } catch (e) { }

    console.log(`${iso.padEnd(7)} | ${cleanNational.padEnd(18)} | ${String(length).padEnd(6)} | ${validation} (isValid: ${isValidStrict})`);
});
