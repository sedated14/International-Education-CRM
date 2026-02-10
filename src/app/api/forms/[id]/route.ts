import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// GET /api/forms/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const docRef = doc(db, 'forms', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        console.error('Error fetching form:', error);
        return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
    }
}

// PUT /api/forms/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const docRef = doc(db, 'forms', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const updatedData = {
            ...body,
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, updatedData);

        return NextResponse.json({ id, ...docSnap.data(), ...updatedData });
    } catch (error) {
        console.error('Error updating form:', error);
        return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
    }
}

// DELETE /api/forms/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const docRef = doc(db, 'forms', id);

        await deleteDoc(docRef);

        return NextResponse.json({ message: 'Form deleted successfully' });
    } catch (error) {
        console.error('Error deleting form:', error);
        return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
    }
}
