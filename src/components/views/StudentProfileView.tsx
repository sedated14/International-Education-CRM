import React from 'react';
import { User, MapPin, Globe, BookOpen, Award, StickyNote, Mail, Phone, Clock, FileText } from 'lucide-react';
import { Lead } from '../../types';

interface Props {
    lead: Lead;
}

export const StudentProfileView = ({ lead }: Props) => {
    const { studentProfile } = lead;
    if (!studentProfile) return null;

    return (
        <div className="space-y-6">
            {/* Student Details Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-amber-100 dark:border-amber-900/20 shadow-sm relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 dark:bg-amber-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                    <User size={20} className="text-amber-500" />
                    Student Details
                </h2>

                <div className="relative z-10 space-y-8">
                    {/* Top Row: Name and Meta */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Student Name</h3>
                            <div className="flex items-center gap-3">
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{lead.studentName}</p>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">{studentProfile.age} yo • {studentProfile.gender}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Location</h3>
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                                {lead.country}
                                {studentProfile.residence && studentProfile.residence !== lead.country &&
                                    <span className="text-xs text-gray-400 dark:text-gray-500">(Res: {studentProfile.residence})</span>
                                }
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nationality</h3>
                            <p className="font-bold text-gray-900 dark:text-white">{studentProfile.nationality || '-'}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Desired Destination</h3>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {Array.isArray(studentProfile.desiredDestination)
                                    ? studentProfile.desiredDestination.join(', ')
                                    : studentProfile.desiredDestination}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Program Duration</h3>
                            <p className="font-bold text-gray-900 dark:text-white">{studentProfile.duration || '-'}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Source Agency</h3>
                            {lead.agencyProfile ? (
                                <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <Globe size={16} /> {lead.agencyProfile.name}
                                </p>
                            ) : (
                                <p className="font-bold text-gray-900 dark:text-white">{lead.source}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Application Date</h3>
                            <p className="font-bold text-gray-900 dark:text-white">
                                {new Date(lead.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" />
                    Academic Profile
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">Current Grade</span>
                        <span className="font-bold text-gray-900 dark:text-white">{studentProfile.currentGrade || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">Applying To</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{studentProfile.gradeApplyingTo || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">Current School</span>
                        <span className="font-bold text-gray-900 dark:text-white">{studentProfile.currentSchool || '-'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">GPA / Grades</span>
                        <span className="font-bold text-gray-900 dark:text-white">{studentProfile.gpa || '-'}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">English Level</span>
                        <span className="font-bold text-gray-900 dark:text-white">{studentProfile.englishLevel || '-'}</span>
                    </div>
                </div>
            </div>

            {/* Interests Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Award size={20} className="text-purple-500" />
                    Interests
                </h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Sports</h3>
                        <div className="flex flex-wrap gap-2">
                            {studentProfile.sports?.length ? studentProfile.sports.map((s: string) => (
                                <span key={s} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold border border-gray-100 dark:border-gray-700">{s}</span>
                            )) : <span className="text-gray-400 text-xs italic"> None listed</span>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Hobbies</h3>
                        <div className="flex flex-wrap gap-2">
                            {studentProfile.hobbies?.length ? studentProfile.hobbies.map((h: string) => (
                                <span key={h} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold border border-gray-100 dark:border-gray-700">{h}</span>
                            )) : <span className="text-gray-400 text-xs italic"> None listed</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes / Essay Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <StickyNote size={20} className="text-gray-400" />
                    Personal Statement / Notes
                </h2>
                <div className="space-y-6">
                    {studentProfile.essay && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Student Essay</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border-l-4 border-gray-300 dark:border-gray-600 italic">
                                "{studentProfile.essay}"
                            </p>
                        </div>
                    )}
                    {studentProfile.otherInfo && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Other Info</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{studentProfile.otherInfo}</p>
                        </div>
                    )}
                    {!studentProfile.essay && !studentProfile.otherInfo && (
                        <p className="text-gray-400 italic">No notes available.</p>
                    )}
                </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <User size={20} className="text-blue-500" />
                    Contact Info
                </h2>

                <div className="space-y-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                            <Mail size={14} className="text-gray-500" />
                        </div>
                        <a href={`mailto:${studentProfile.email || ''}`} className="text-gray-900 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                            {studentProfile.email || 'No Email'}
                        </a>
                    </div>
                    {studentProfile.phoneNumber && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                <Phone size={14} className="text-gray-500" />
                            </div>
                            <span className="text-gray-900 dark:text-gray-300">{studentProfile.phoneNumber}</span>
                        </div>
                    )}

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Preferences</h3>
                        <div className="flex flex-wrap gap-2">
                            {studentProfile.preferredCommunication?.map((mode: string) => (
                                <span key={mode} className="text-xs bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-bold">
                                    {mode}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
