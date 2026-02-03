"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../components/Navigation';
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
        <div className="flex h-screen bg-[#F0F2F5] text-[#1D1D1F] overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                {/* Top Bar: Back Link & Action Buttons */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between">
                    <Link href="/students" className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-black transition-colors">
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
                                    ${lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                                        lead.status === 'Contacted' ? 'bg-orange-100 text-orange-700' :
                                            lead.status === 'Lost' ? 'bg-gray-100 text-gray-500' :
                                                'bg-blue-100 text-blue-700' // Inquiry
                                    }`}
                            >
                                <option value="Inquiry">Inquiry</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Qualified">Qualified</option>
                                <option value="Lost">Lost</option>
                            </select>
                        </div>
                        <Link href={`/students/${lead.id}/edit`}>
                            <button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                Edit Profile
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Main Info Column */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Student Details Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-amber-100 shadow-sm relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
                                <User size={20} className="text-amber-500" />
                                Student Details
                            </h2>

                            <div className="relative z-10 space-y-8">
                                {/* Top Row: Name and Meta */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-3xl font-black text-gray-900 tracking-tight">{lead.studentName}</p>
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">{studentProfile.age} yo • {studentProfile.gender}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Location</h3>
                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                            <MapPin size={16} className="text-gray-400" />
                                            {lead.country}
                                            {studentProfile.residence && studentProfile.residence !== lead.country &&
                                                <span className="text-xs text-gray-400">(Res: {studentProfile.residence})</span>
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nationality</h3>
                                        <p className="font-bold text-gray-900">{studentProfile.nationality || '-'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Desired Destination</h3>
                                        <p className="font-bold text-gray-900">
                                            {Array.isArray(studentProfile.desiredDestination)
                                                ? studentProfile.desiredDestination.join(', ')
                                                : studentProfile.desiredDestination}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Program Duration</h3>
                                        <p className="font-bold text-gray-900">{studentProfile.duration || '-'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Source Agency</h3>
                                        {lead.agencyProfile ? (
                                            <Link href={`/agencies/${lead.agencyProfile.id}`} className="font-bold text-blue-600 hover:underline flex items-center gap-2">
                                                <Globe size={16} /> {lead.agencyProfile.name}
                                            </Link>
                                        ) : (
                                            <p className="font-bold text-gray-900">{lead.source}</p>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Application Date</h3>
                                        <p className="font-bold text-gray-900">{formatDate(lead.createdAt)}</p>
                                    </div>
                                </div>


                                {/* Notes & History Section */}
                                <div className="border-t border-gray-100 pt-8">
                                    <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2 mb-4">
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
                                                className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-amber-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none transition-all resize-none h-[50px] focus:h-[80px]"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddNote}
                                            disabled={!newNote.trim()}
                                            className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all h-fit"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>

                                    {/* Notes Log */}
                                    {lead.notes && lead.notes.length > 0 ? (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                            {[...lead.notes].reverse().map((note) => (
                                                <div key={note.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatDate(note.timestamp)} • {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{note.author || 'System'}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap">{note.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic font-medium px-1">No notes added yet.</p>
                                    )}
                                </div>

                                {/* Academic Info */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                    <h3 className="text-sm font-black text-gray-900 uppercase flex items-center gap-2">
                                        <BookOpen size={16} className="text-gray-400" />
                                        Academic Profile
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase font-bold">Current Grade</span>
                                            <span className="font-bold text-gray-900">{studentProfile.currentGrade || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase font-bold">Applying To</span>
                                            <span className="font-bold text-blue-600">{studentProfile.gradeApplyingTo || 'N/A'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase font-bold">Current School</span>
                                            <span className="font-bold text-gray-900">{studentProfile.currentSchool || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase font-bold">GPA / Grades</span>
                                            <span className="font-bold text-gray-900">{studentProfile.gpa || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase font-bold">English Level</span>
                                            <span className="font-bold text-gray-900">{studentProfile.englishLevel || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Notes / Essay Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <StickyNote size={20} className="text-gray-400" />
                                Personal Statement / Notes
                            </h2>
                            <div className="space-y-6">
                                {studentProfile.essay && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Student Essay</h3>
                                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border-l-4 border-gray-300 italic">
                                            "{studentProfile.essay}"
                                        </p>
                                    </div>
                                )}
                                {studentProfile.otherInfo && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Other Info</h3>
                                        <p className="text-gray-600 leading-relaxed">{studentProfile.otherInfo}</p>
                                    </div>
                                )}
                                {!studentProfile.essay && !studentProfile.otherInfo && (
                                    <p className="text-gray-400 italic">No notes available.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* Contact Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <User size={20} className="text-blue-500" />
                                Contact Info
                            </h2>

                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                        <Mail size={14} className="text-gray-500" />
                                    </div>
                                    <a href={`mailto:${studentProfile.preferredCommunication?.includes('Email') ? 'email@example.com' : ''}`} className="text-gray-900 hover:text-blue-600 transition-colors truncate">
                                        {/* Placeholder email logic since it's not in the main interface yet, usually lead.email */}
                                        Click to Reveal Email
                                    </a>
                                </div>
                                {studentProfile.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                            <Phone size={14} className="text-gray-500" />
                                        </div>
                                        <span>{studentProfile.phoneNumber}</span>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preferences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {studentProfile.preferredCommunication?.map(mode => (
                                            <span key={mode} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                                                {mode}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Follow Up Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <Clock size={20} className="text-orange-500" />
                                    Follow Up
                                </h2>
                                {lead.followUpDate && new Date(lead.followUpDate) < new Date() && (
                                    <span className="bg-red-100 text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded">Past Due</span>
                                )}
                            </div>

                            <div className="text-center py-4 bg-orange-50 rounded-2xl border border-orange-100 mb-4">
                                <p className="text-xs font-bold text-orange-400 uppercase mb-1">Scheduled For</p>
                                <p className="text-2xl font-black text-orange-600">
                                    {lead.followUpDate ? formatDate(lead.followUpDate) : 'Not Scheduled'}
                                </p>
                            </div>

                            <button className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-all text-xs">
                                Reschedule Follow Up
                            </button>
                        </div>

                        {/* Interests Card */}
                        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Award size={20} className="text-purple-500" />
                                Interests
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sports</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {studentProfile.sports?.length ? studentProfile.sports.map(s => (
                                            <span key={s} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100">{s}</span>
                                        )) : <span className="text-gray-400 text-xs italic"> None listed</span>}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Hobbies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {studentProfile.hobbies?.length ? studentProfile.hobbies.map(h => (
                                            <span key={h} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100">{h}</span>
                                        )) : <span className="text-gray-400 text-xs italic"> None listed</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main >
        </div >
    );
}
