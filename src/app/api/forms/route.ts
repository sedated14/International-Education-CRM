import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { collection, getDocs, setDoc, doc, query, orderBy } from 'firebase/firestore';
import { FormConfig } from '../../../types';

// GET /api/forms
export async function GET() {
    try {
        const formsRef = collection(db, 'forms');
        // Sort by createdAt descending
        const q = query(formsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const forms = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FormConfig[];

        return NextResponse.json(forms);
    } catch (error) {
        console.error('Error fetching forms from Firestore:', error);
        return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
    }
}

// POST /api/forms
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newId = crypto.randomUUID();
        const newForm: FormConfig = {
            ...body,
            id: newId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Save to Firestore
        await setDoc(doc(db, 'forms', newId), newForm);

        return NextResponse.json(newForm, { status: 201 });
    } catch (error) {
        console.error('Error creating form in Firestore:', error);
        return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
    }
}
