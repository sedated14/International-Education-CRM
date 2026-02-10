import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Lead, FormConfig } from '../../../../types';

const leadsFilePath = path.join(process.cwd(), 'src/data/leads.json');
const formsFilePath = path.join(process.cwd(), 'src/data/forms.json');

const readLeads = (): Lead[] => {
    try {
        const fileContents = fs.readFileSync(leadsFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        return [];
    }
};

const writeLeads = (leads: Lead[]) => {
    try {
        fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing leads:', error);
    }
};

const readForms = (): FormConfig[] => {
    try {
        if (!fs.existsSync(formsFilePath)) return [];
        const fileContents = fs.readFileSync(formsFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        return [];
    }
};

// POST /api/public/submit-form
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { formId, leadData } = body;

        // 1. Validate Form
        const forms = readForms();
        const formConfig = forms.find(f => f.id === formId);

        if (!formConfig) {
            return NextResponse.json({ error: 'Invalid Form ID' }, { status: 404 });
        }

        // 2. Create Lead
        const leads = readLeads();

        // Generate a new ID (simple max + 1)
        const maxId = leads.reduce((max, lead) => {
            const currentId = Number(lead.id);
            return !isNaN(currentId) && currentId > max ? currentId : max;
        }, 0);

        const newLead: Lead = {
            ...leadData,
            id: maxId + 1,
            type: 'Student',
            source: 'Form',
            title: `Web Inquiry: ${leadData.studentProfile?.firstName || 'Student'} - ${formConfig.name}`,
            status: 'Inquiry',
            score: 5,
            createdAt: new Date().toISOString(),
            lastContactDate: new Date().toISOString(),
            // Add metadata about which form generated this
            notes: [{
                id: crypto.randomUUID(),
                content: `Lead captured via "${formConfig.name}" form.`,
                timestamp: new Date().toISOString(),
                author: 'System'
            }]
        };

        leads.unshift(newLead);
        writeLeads(leads);

        // 3. Trigger Notifications (Mock for now)
        if (formConfig.notificationEmails && formConfig.notificationEmails.length > 0) {
            console.log(`[Mock Email Service] Sending notification to: ${formConfig.notificationEmails.join(', ')}`);
            console.log(`[Mock Email Content] New submission for form "${formConfig.name}"`);
            console.log(`[Mock Email Data] Name: ${newLead.studentName}, Email: ${newLead.studentProfile?.email}`);
        }

        return NextResponse.json({ success: true, leadId: newLead.id }, { status: 201 });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
    }
}
