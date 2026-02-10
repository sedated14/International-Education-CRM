// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000'; // Ensure this matches your running dev server port

async function verify() {
    console.log('--- Starting Form Feature Verification ---');

    // 1. Create a Form
    console.log('\n1. Creating a new form...');
    const createRes = await fetch(`${BASE_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test Setup Form',
            notificationEmails: ['test@example.com'],
            includedFields: ['firstName', 'studentEmail', 'residence']
        })
    });

    if (!createRes.ok) {
        console.error('Failed to create form:', await createRes.text());
        return;
    }

    const form = await createRes.json();
    console.log('Form Created:', form.id);

    // 2. Get the Form
    console.log('\n2. Fetching form details...');
    const getRes = await fetch(`${BASE_URL}/api/forms/${form.id}`);
    if (!getRes.ok) console.error('Failed to fetch form');
    const fetchedForm = await getRes.json();
    console.log('Form Fetched (Name):', fetchedForm.name);

    // 3. Submit a Lead
    console.log('\n3. Submitting a lead to the form...');
    const submitRes = await fetch(`${BASE_URL}/api/public/submit-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formId: form.id,
            leadData: {
                studentProfile: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'testuser@example.com',
                    residence: 'Brazil'
                }
            }
        })
    });

    if (!submitRes.ok) {
        console.error('Failed to submit form:', await submitRes.text());
    } else {
        const result = await submitRes.json();
        console.log('Lead Submitted successfully. Lead ID:', result.leadId);
    }

    console.log('\n--- Verification Complete ---');
}

verify().catch(console.error);
