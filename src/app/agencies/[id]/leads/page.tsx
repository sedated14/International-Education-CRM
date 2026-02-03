"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../../components/Navigation';
import { useLeads } from '../../../../context/LeadContext';
import { ArrowLeft, User, MapPin, Globe, Eye, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { LeadDetailModal } from '../../../../components/LeadDetailModal';
import { Agency } from '../../../../types';

export default function AgencyLeadsPage() {
    const params = useParams();
    const router = useRouter();
    const { leads } = useLeads();
    const [selectedStudentId, setSelectedStudentId] = useState<string | number | null>(null);

    // Find lead and map to Agency
    const foundLead = leads.find(l => String(l.id) === String(params.id));
    const agency = foundLead && foundLead.type === 'Agent' && foundLead.agencyProfile ? {
        ...foundLead.agencyProfile,
        id: foundLead.id,
        name: foundLead.agentName,
        country: foundLead.country,
        type: 'Agent'
    } as Agency : null;

    const loading = leads.length === 0;

    // Find linked students
    const linkedStudents = leads.filter(l => l.type === 'Student' && String(l.studentProfile?.agencyId) === String(agency?.id));
    const selectedStudent = leads.find(l => l.id === selectedStudentId) || null;

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Loading...</div>;
    if (!agency) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Agency not found</div>;

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />
            <LeadDetailModal lead={selectedStudent} onClose={() => setSelectedStudentId(null)} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto">

                {/* Header */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 z-20">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/agencies" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{agency.name}</h1>
                            <div className="flex items-center gap-4 text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    {agency.city}, {agency.country}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="flex items-center gap-1.5">
                                    <Globe size={14} />
                                    {agency.website ? agency.website.replace(/^https?:\/\//, '') : 'No Website'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 max-w-5xl mx-auto w-full pb-20">

                    <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <GraduationCap size={20} className="text-blue-600 dark:text-blue-400" />
                            Active Student Leads ({linkedStudents.length})
                        </h2>

                        {linkedStudents.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                                {linkedStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl text-amber-600 dark:text-amber-400">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{student.studentName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${student.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                                                        student.status === 'Lost' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {student.status}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{student.studentProfile?.desiredDestination?.join(', ') || 'No Destination'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setSelectedStudentId(student.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold text-xs transition-colors shadow-sm"
                                            >
                                                <Eye size={16} /> Quick View
                                            </button>
                                            <Link href={`/students/${student.id}`}>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 font-bold text-xs transition-colors shadow-lg">
                                                    Profile <ChevronRight size={16} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                                    <User size={32} />
                                </div>
                                <p className="text-gray-900 dark:text-white font-bold text-lg">No active leads found</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">This agency has no students linked currently.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
