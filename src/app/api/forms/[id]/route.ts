import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FormConfig } from '../../../../types';

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

// GET /api/forms/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const forms = readForms();
    const form = forms.find((f) => f.id === id);

    if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json(form);
}

// PUT /api/forms/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const forms = readForms();
        const index = forms.findIndex((f) => f.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const updatedForm = {
            ...forms[index],
            ...body,
            updatedAt: new Date().toISOString(),
        };

        forms[index] = updatedForm;
        writeForms(forms);

        return NextResponse.json(updatedForm);
    } catch (error) {
        console.error('Error updating form:', error);
        return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }
}

// DELETE /api/forms/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const forms = readForms();
    const filteredForms = forms.filter((f) => f.id !== id);

    if (forms.length === filteredForms.length) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    writeForms(filteredForms);
    return NextResponse.json({ message: 'Form deleted successfully' });
}
