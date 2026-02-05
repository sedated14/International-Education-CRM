"use client";
import React, { useState } from 'react';
import { AgencyForm } from './agencies/AgencyForm';
import { useLeads } from '../context/LeadContext';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { X } from 'lucide-react';
import { Agency, Lead } from '../types';

interface Props {
    onClose: () => void;
}

export const AgentLeadModal: React.FC<Props> = ({ onClose }) => {
    const { addLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (agencyData: any) => {
        setIsSubmitting(true);
        try {
            // 1. Create Agency in 'agencies' collection
            // We strip 'id' just in case, let Firestore generate it
            const cleanAgencyData = JSON.parse(JSON.stringify(agencyData));
            delete cleanAgencyData.id;

            // Default status if missing
            if (!cleanAgencyData.partnershipStatus) cleanAgencyData.partnershipStatus = 'Prospective';

            const agencyRef = await addDoc(collection(db, 'agencies'), {
                ...cleanAgencyData,
                createdAt: new Date().toISOString()
            });

            // 2. Create Lead in 'leads' collection
            const newLead: Omit<Lead, 'id'> = {
                title: `${agencyData.name} - Partnership Inquiry`,
                type: 'Agent',
                source: 'Manual',
                createdAt: new Date().toISOString(),
                studentName: '', // Not applicable
                agentName: agencyData.name,
                country: agencyData.country,
                status: 'Inquiry', // Lead Status (Dashboard)
                score: 5,
                timestamp: 'Just now',
                commission: agencyData.commissionRate ? true : false,
                agencyProfile: { ...cleanAgencyData, id: agencyRef.id } // Link back to real agency doc
            };

            await addLead(newLead);
            onClose();
        } catch (error) {
            console.error("Failed to crate agent lead", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container - Maximize height and allow scroll */}
            <div className="bg-[#F0F2F5] dark:bg-gray-950 w-full max-w-5xl h-[90vh] rounded-[32px] shadow-2xl overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">New Agent Lead</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Enter agency details manually</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Form Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AgencyForm
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        submitLabel="Create Lead"
                        cancelHref="#" // Override link behavior
                        renderFooter={true}
                    />
                </div>
            </div>
        </div>
    );
};
