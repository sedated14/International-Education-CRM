"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../../components/Navigation';
import { useLeads } from '../../../../context/LeadContext';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { StudentForm } from '../../../../components/forms/StudentForm';

export default function EditStudentPage() {
    const params = useParams();
    const router = useRouter();
    const { leads, updateLead, deleteLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Find lead
    const lead = leads.find(l => String(l.id) === String(params.id) && l.type === 'Student');

    if (!leads.length) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Loading...</div>;
    if (!lead) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Student not found</div>;

    const handleSubmit = async (submissionData: any) => {
        setIsSubmitting(true);
        try {
            await updateLead(lead.id, submissionData);
            router.push(`/students/${lead.id}`);
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this student profile? This cannot be undone.")) {
            await deleteLead(lead.id);
            router.push('/students');
        }
    }

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-[#F0F2F5] dark:bg-gray-950 z-20">
                    <div className="flex items-center gap-4">
                        <Link href={`/students/${lead.id}`} className="p-2 hover:bg-white dark:hover:bg-gray-900 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Edit Student</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Update details for {lead.studentName}</p>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-20 max-w-5xl mx-auto w-full">
                    <StudentForm
                        lead={lead}
                        onSubmit={handleSubmit}
                        onDelete={handleDelete}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
        </div>
    );
}
