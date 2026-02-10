import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FormConfig } from '../../../types';

const formsFilePath = path.join(process.cwd(), 'src/data/forms.json');

const readForms = (): FormConfig[] => {
    try {
        if (!fs.existsSync(formsFilePath)) {
            return [];
        }
        const fileContents = fs.readFileSync(formsFilePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        console.error('Error reading forms:', error);
        return [];
    }
};

const writeForms = (forms: FormConfig[]) => {
    try {
        fs.writeFileSync(formsFilePath, JSON.stringify(forms, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing forms:', error);
    }
};

// GET /api/forms
export async function GET() {
    const forms = readForms();
    return NextResponse.json(forms);
}

// POST /api/forms
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const forms = readForms();

        const newForm: FormConfig = {
            ...body,
            id: crypto.randomUUID(), // Generate a unique ID
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        forms.unshift(newForm);
        writeForms(forms);

        return NextResponse.json(newForm, { status: 201 });
    } catch (error) {
        console.error('Error creating form:', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
