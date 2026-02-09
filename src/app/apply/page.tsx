"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useLeads } from '../../context/LeadContext';
import { Lead } from '../../types';
import { StudentForm } from '../../components/forms/StudentForm';

export default function ApplyPage() {
    const router = useRouter();
    const { addLead } = useLeads();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (data: any) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Construct New Lead Object based on StudentForm output
        // StudentForm returns a structure like { studentName, country, studentProfile: {...} }
        // We need to wrap this into the full Lead object expected by addLead

        const newLead: Lead = {
            id: Date.now(), // Simple ID generation
            title: `Inquiry: Student - ${data.country || 'Unknown'}`,
            type: 'Student',
            source: 'Form',
            createdAt: new Date().toISOString(),
            followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 72h default

            studentName: data.studentName,
            country: data.country,

            status: 'Inquiry',
            score: 0,
            timestamp: 'Just now',

            studentProfile: data.studentProfile
        };

        addLead(newLead);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex items-center justify-center p-4 font-sans">
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[32px] shadow-xl max-w-lg w-full text-center border border-white/50 dark:border-gray-800">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 dark:text-green-400 animate-in zoom-in duration-300">
                        <CheckCircle2 size={40} strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Inquiry Received!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-lg">
                        Thank you for your inquiry. We will review your profile and contact you soon.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 font-sans selection:bg-orange-100 dark:selection:bg-orange-900/30 selection:text-orange-900 dark:selection:text-orange-400">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #E0E7FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFF7ED 0%, transparent 30%)' }}
            />

            <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-20">

                {/* Header */}
                <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-white/50 dark:border-white/10 mb-6">
                        <Sparkles size={14} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Student Inquiry / Consultation</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Begin Your Journey.</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                        Complete this inquiry form to receive school recommendations or schedule a consultation.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white dark:border-white/10 p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-700 delay-150">
                    <StudentForm
                        onSubmit={handleSubmit}
                        isModal={true} // Use modal (collapsed) styling to fit inside this card
                        isSubmitting={false} // Managed internally by form if needed, or we can hoist state. Form currently handles its own simple state but we simulated submit above.
                        showLinkedAgency={false}
                    />
                </div>

                <p className="text-center text-gray-400 text-sm font-medium mt-8">
                    &copy; 2026 Apex CRM. Secure Inquiry Portal.
                </p>

            </div >
        </div >
    );
}
