'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import leadsData from '../../data/leads.json';

export default function MigratePage() {
    const [status, setStatus] = useState('Idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleMigrate = async () => {
        setStatus('Migrating...');
        setError(null);
        const leadsCollection = collection(db, 'leads');
        let count = 0;

        try {
            for (const lead of leadsData) {
                try {
                    // Sanitize: strip undefineds
                    const cleanLead = JSON.parse(JSON.stringify(lead));
                    // Remove 'id' if you want Firestore to generate a random ID
                    delete cleanLead.id;

                    await addDoc(leadsCollection, cleanLead);
                    count++;
                    setProgress(count);
                } catch (e: any) {
                    console.error('Error adding document: ', e);
                    setError(e.message);
                    setStatus('Failed');
                    return; // Stop on first error
                }
            }
            setStatus(`Migration Complete! Migrated ${count} leads.`);
        } catch (e: any) {
            setError(e.message);
            setStatus('Failed');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Data Migration</h1>
            <p className="mb-4">Found {leadsData.length} leads in <code>src/data/leads.json</code>.</p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <p className="text-xs mt-2 text-red-500">Tip: Check 'Firestore Database' Rules in Firebase Console. Ensure they are set to allow reads and writes for now.</p>
                </div>
            )}

            <button
                onClick={handleMigrate}
                disabled={status === 'Migrating...'}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                {status === 'Idle' || status === 'Failed' ? 'Start Migration' : 'Migrating...'}
            </button>

            <div className="mt-4">
                <p>Status: {status}</p>
                <p>Progress: {progress} / {leadsData.length}</p>
            </div>
        </div>
    );
}
