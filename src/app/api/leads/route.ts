import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Lead } from '../../../types';

// Path to the JSON file acting as a database
const dataFilePath = path.join(process.cwd(), 'src/data/leads.json');

// Helper to read leads
const readLeads = (): Lead[] => {
    try {
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error reading leads:', error);
        return [];
    }
};

// Helper to write leads
const writeLeads = (leads: Lead[]) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing leads:', error);
    }
};

// GET /api/leads
export async function GET() {
    const leads = readLeads();
    return NextResponse.json(leads);
}

// POST /api/leads
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const leads = readLeads();

        // Generate a new ID (simple max + 1)
        const maxId = leads.reduce((max, lead) => {
            const currentId = Number(lead.id);
            return !isNaN(currentId) && currentId > max ? currentId : max;
        }, 0);
        const newLead: Lead = {
            ...body,
            id: maxId + 1,
            createdAt: new Date().toISOString(), // Ensure server-side timestamp
        };

        // If it's a student lead from the form, ensure correct defaults
        if (newLead.type === 'Student' && newLead.source === 'Form') {
            newLead.title = `Inquiry: ${newLead.studentProfile?.currentGrade || 'Student'} - ${newLead.country}`;
            newLead.status = 'Inquiry';
            newLead.score = 5; // Default score for new inquiries
        }

        leads.unshift(newLead); // Add to beginning
        writeLeads(leads);

        return NextResponse.json(newLead, { status: 201 });
    } catch (error) {
        console.error('Error processing lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
