const { getExampleNumber } = require('libphonenumber-js');
const examples = require('libphonenumber-js/examples.mobile.json');

const countries = ['US', 'GB', 'AU', 'CN', 'HK', 'FR', 'DE', 'AE'];

console.log("Country | Example (National) | Length | Simulation: Block > Length?");
console.log("-----------------------------------------------------------------------");

countries.forEach(iso => {
    const example = getExampleNumber(iso, examples);
    if (!example) {
        console.log(`${iso} | No Example Found`);
        return;
    }

    // nationalNumber is the raw digits of the national number (no country code, no formatting)
    // BUT we need to be careful. The user input often includes the leading '0' for some countries if they type it?
    // Usually libphonenumber parses '04...' as national number '4...' for AU.
    // The "digits" variable in our component is stripped of non-numeric chars.
    // If user selects AU (+61), they usually type "412...".
    // If they type "0412...", the library handles it.

    // Let's rely on the library's "nationalNumber" length.
    const natNum = example.nationalNumber;
    const length = natNum.length;

    console.log(`${iso.padEnd(7)} | ${natNum.padEnd(18)} | ${String(length).padEnd(6)} | Block > ${length}?`);
});
