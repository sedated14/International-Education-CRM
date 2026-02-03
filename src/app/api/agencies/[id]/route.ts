import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Agency } from '../../../../types';

const dataFilePath = path.join(process.cwd(), 'src/data/agencies.json');

const readAgencies = (): Agency[] => {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return [];
        }
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error reading agencies:', error);
        return [];
    }
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const agencies = readAgencies();
    const agency = agencies.find(a => a.id.toString() === id);

    if (agency) {
        return NextResponse.json(agency);
    } else {
        return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const agencies = readAgencies();
        const index = agencies.findIndex(a => a.id.toString() === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
        }

        // Merge updates
        const updatedAgency = {
            ...agencies[index],
            ...body,
            id: agencies[index].id // Ensure ID doesn't change
        };

        agencies[index] = updatedAgency;

        fs.writeFileSync(dataFilePath, JSON.stringify(agencies, null, 2));

        return NextResponse.json(updatedAgency);
    } catch (error) {
        console.error('Error updating agency:', error);
        return NextResponse.json({ error: 'Failed to update agency' }, { status: 500 });
    }
}
