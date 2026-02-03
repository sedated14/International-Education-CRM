"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../../components/Navigation';
import { AgencyForm } from '../../../../components/agencies/AgencyForm';
import { useLeads } from '../../../../context/LeadContext';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Agency } from '../../../../types';

export default function EditAgencyPage() {
    const params = useParams();
    const router = useRouter();
    const { leads, updateLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find lead and map to Agency
    const foundLead = leads.find(l => String(l.id) === String(params.id));

    const agency = foundLead && foundLead.type === 'Agent' && foundLead.agencyProfile ? {
        ...foundLead.agencyProfile,
        id: foundLead.id,
        name: foundLead.agentName,
        country: foundLead.country,
        type: 'Agent',
        keyContacts: foundLead.agencyProfile.keyContacts || [],
        secondaryContact: foundLead.agencyProfile.secondaryContact || undefined,
        partnershipStatus: foundLead.agencyProfile.partnershipStatus || 'Prospective',
        historicalSends: foundLead.agencyProfile.historicalSends || 0,
        lastContactDate: foundLead.lastContacted || foundLead.createdAt
    } as Agency : null;

    const loading = leads.length === 0;

    const handleUpdate = async (updatedData: Agency) => {
        setIsSubmitting(true);
        try {
            await updateLead(params.id as string, {
                agentName: updatedData.name,
                country: updatedData.country,
                title: updatedData.name, // Keep title synced
                agencyProfile: updatedData
            });

            router.push(`/agencies/${params.id}`);
        } catch (error) {
            console.error(error);
            alert('Error updating agency');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#F0F2F5] items-center justify-center">
                <div className="text-gray-500 font-bold">Loading...</div>
            </div>
        );
    }

    if (!agency) {
        return (
            <div className="flex h-screen bg-[#F0F2F5] items-center justify-center">
                <div className="text-gray-500 font-bold">Agency not found</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">

                {/* Header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex items-center gap-4 z-20 sticky top-0">
                    <Link href={`/agencies/${params.id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Edit Agency</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Update profile information for {agency.name}</p>
                    </div>

                    <div className="flex-1" />

                    <div className="flex gap-4">
                        <Link href={`/agencies/${params.id}`}>
                            <button className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                Cancel
                            </button>
                        </Link>
                        <button
                            form="agency-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Save size={18} />
                            {isSubmitting ? 'Updating...' : 'Update Agency'}
                        </button>
                    </div>
                </header>

                <div className="p-8 max-w-5xl mx-auto w-full pb-20">
                    <AgencyForm
                        initialData={agency}
                        onSubmit={handleUpdate}
                        isSubmitting={isSubmitting}
                        submitLabel="Update Agency"
                        cancelHref={`/agencies/${params.id}`}
                    />
                </div>

            </main>
        </div>
    );
}
