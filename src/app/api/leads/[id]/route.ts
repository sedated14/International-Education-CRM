import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Lead } from '../../../../types';

const dataFilePath = path.join(process.cwd(), 'src/data/leads.json');

const readLeads = (): Lead[] => {
    try {
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        return [];
    }
};

const writeLeads = (leads: Lead[]) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(leads, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing leads:', error);
    }
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await request.json();
        const leads = readLeads();

        const index = leads.findIndex(l => l.id.toString() === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Apply updates
        const updatedLead = { ...leads[index], ...updates };
        leads[index] = updatedLead;

        writeLeads(leads);

        return NextResponse.json(updatedLead);
    } catch (error) {
        console.error('Error updating lead:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}
