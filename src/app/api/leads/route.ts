import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase'; // Ensure this points to your firebase config
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { Lead } from '../../../types';

// GET /api/leads
export async function GET() {
    try {
        const leadsRef = collection(db, 'leads');
        // Sort by createdAt descending
        const q = query(leadsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        const leads = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Lead[];

        return NextResponse.json(leads);
    } catch (error) {
        console.error('Error fetching leads from Firestore:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

// POST /api/leads (Internal/Manual creation)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const newLeadBase = {
            ...body,
            createdAt: new Date().toISOString(),
        };

        // If it's a student lead from the form, ensure correct defaults (though this route is mostly for internal use)
        if (newLeadBase.type === 'Student' && newLeadBase.source === 'Form') {
            newLeadBase.title = `Inquiry: ${newLeadBase.studentProfile?.currentGrade || 'Student'} - ${newLeadBase.country}`;
            newLeadBase.status = 'Inquiry';
            newLeadBase.score = 5;
        }

        const leadsRef = collection(db, 'leads');
        const docRef = await addDoc(leadsRef, newLeadBase);

        // Return with the generated ID
        const newLead = { id: docRef.id, ...newLeadBase };

        return NextResponse.json(newLead, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
