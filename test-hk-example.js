const { getExampleNumber } = require('libphonenumber-js');
const examples = require('libphonenumber-js/examples.mobile.json');

const iso = 'HK';
const example = getExampleNumber(iso, examples);
if (example) {
    console.log(`Example for ${iso}: ${example.number} (Length: ${example.number.length})`);
    console.log(`National Number: ${example.nationalNumber} (Length: ${example.nationalNumber.length})`);
} else {
    console.log("No example found");
}
