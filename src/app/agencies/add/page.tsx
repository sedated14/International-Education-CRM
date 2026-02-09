"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/Navigation';
import { AgencyForm } from '../../../components/agencies/AgencyForm';
import { useLeads } from '../../../context/LeadContext';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

import { generateAgencyCode } from '../../../utils/formatters';

export default function AddAgencyPage() {
    const router = useRouter();
    const { leads, addLead } = useLeads(); // Use Context
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (newAgency: any) => {
        setIsSubmitting(true);
        try {
            // Generate Agency Code
            const currentAgentCount = leads.filter(l => l.type === 'Agent').length;
            const code = generateAgencyCode(
                currentAgentCount + 1,
                newAgency.name,
                newAgency.country,
                newAgency.region || 'Unknown'
            );

            await addLead({
                type: 'Agent',
                agencyCode: code,
                agentName: newAgency.name,
                country: newAgency.country,
                status: 'Qualified', // Default status for existing agents? or 'Inquiry'?
                agencyProfile: newAgency, // Embedding the detailed profile
                createdAt: new Date().toISOString(),
                // Basic Lead fields that might be required
                studentName: 'N/A', // Required by Lead type?
                title: newAgency.name,
                source: 'Manual'
            } as any);

            router.push('/agencies');
        } catch (error) {
            console.error(error);
            alert('Error saving agency');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">

                {/* Header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center gap-4 z-20 sticky top-0">
                    <Link href="/agencies" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Add New Agency</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Enter partnership details and contacts</p>
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-4">
                        {/* Actions moved to bottom of form */}
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full pb-20">
                    <AgencyForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        renderFooter={true}
                    />
                </div>

            </main>
        </div>
    );
}

