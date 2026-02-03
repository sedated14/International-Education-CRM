import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Agency } from '../../../types';

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

export async function GET() {
    const agencies = readAgencies();
    return NextResponse.json(agencies);
}

// Minimal POST implementation for future use
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const agencies = readAgencies();
        const newAgency = {
            ...body,
            id: Date.now(),
        };
        const updatedAgencies = [...agencies, newAgency];
        fs.writeFileSync(dataFilePath, JSON.stringify(updatedAgencies, null, 2));

        return NextResponse.json(newAgency, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 });
    }
}
