"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../components/Navigation';
import { StudentProfileView } from '../../../components/views/StudentProfileView';
import { useLeads } from '../../../context/LeadContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Globe, Calendar, Award, BookOpen, Clock, AlertCircle, StickyNote, Send, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { leads, updateLead } = useLeads();

    // Find lead
    const lead = leads.find(l => String(l.id) === String(params.id) && l.type === 'Student');

    // Loading state
    if (!leads.length) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Loading...</div>;
    if (!lead || !lead.studentProfile) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Student not found</div>;

    const { studentProfile } = lead;

    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        const note = {
            id: Date.now().toString(),
            content: newNote,
            timestamp: new Date().toISOString(),
            author: 'You'
        };

        const updatedNotes = lead.notes ? [...lead.notes, note] : [note];
        updateLead(lead.id, { notes: updatedNotes });
        setNewNote('');
    };

    // Helper to format date
    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                {/* Top Bar: Back Link & Action Buttons */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between">
                    <Link href="/students" className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                        Back to Students
                    </Link>

                    <div className="flex gap-3">
                        {/* Status Dropdown */}
                        <div className="relative group">
                            <select
                                value={lead.status}
                                onChange={(e) => updateLead(lead.id, { status: e.target.value as any })}
                                className={`appearance-none cursor-pointer border-0 outline-none font-black uppercase tracking-wide py-3 px-6 rounded-xl text-sm transition-all shadow-lg hover:shadow-xl pr-8
                                    ${lead.status === 'Qualified' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                        lead.status === 'Contacted' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                                            lead.status === 'Lost' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' // Inquiry
                                    }`}
                            >
                                <option value="Inquiry">Inquiry</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <Link href={`/students/${lead.id}/edit`}>
                            <button className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                Edit Profile
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Info Column */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Student Details Standardized View */}
                        <StudentProfileView lead={lead} />

                        {/* Notes & History Section - Kept separate as requested to be distinct */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center gap-2 mb-4">
                                <MessageSquare size={16} className="text-gray-400" />
                                Notes & History
                            </h3>

                            {/* Input */}
                            <div className="flex gap-3 mb-6">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Add a note..."
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-amber-100 dark:focus:border-amber-900/40 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none transition-all resize-none h-[50px] focus:h-[80px]"
                                    />
                                </div>
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all h-fit"
                                >
                                    <Send size={18} />
                                </button>
                            </div>

                            {/* Notes Log */}
                            {lead.notes && lead.notes.length > 0 ? (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[...lead.notes].reverse().map((note) => (
                                        <div key={note.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 relative group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{formatDate(note.timestamp)} • {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">{note.author || 'System'}</span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic font-medium px-1">No notes added yet.</p>
                            )}
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* Follow Up Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock size={20} className="text-orange-500" />
                                    Follow Up
                                </h2>
                                {lead.followUpDate && new Date(lead.followUpDate) < new Date() && (
                                    <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded">Past Due</span>
                                )}
                            </div>

                            <div className="text-center py-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-900/20 mb-4">
                                <p className="text-xs font-bold text-orange-400 uppercase mb-1">Scheduled For</p>
                                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                                    {lead.followUpDate ? formatDate(lead.followUpDate) : 'Not Scheduled'}
                                </p>
                            </div>

                            <button className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all text-xs">
                                Reschedule Follow Up
                            </button>
                        </div>

                    </div>
                </div>

            </main >
        </div >
    );
}
