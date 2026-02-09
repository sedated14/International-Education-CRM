import React from 'react';
import { User, MapPin, Globe, BookOpen, Award, StickyNote, Mail, Phone, Clock, FileText, Heart, DollarSign, MessageCircle, AlertCircle } from 'lucide-react';
import { Lead } from '../../types';

interface Props {
    lead: Lead;
}

export const StudentProfileView = ({ lead }: Props) => {
    const { studentProfile } = lead;
    if (!studentProfile) return null;

    // Helper for displaying boolean Yes/No
    const YesNo = ({ val }: { val?: boolean }) => (
        <span className={`px-2 py-0.5 rounded text-xs font-bold ${val ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
            {val ? 'Yes' : 'No'}
        </span>
    );

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
                                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {[studentProfile.firstName, studentProfile.middleName, studentProfile.lastName].filter(Boolean).join(' ') || lead.studentName}
                                </p>
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400 font-bold">{studentProfile.age ? `${studentProfile.age} yo • ` : ''}{studentProfile.gender}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Residence & Nationality</h3>
                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                                {studentProfile.residence || lead.country}
                                {studentProfile.nationality && studentProfile.nationality !== (studentProfile.residence || lead.country) &&
                                    <span className="text-xs text-gray-400 dark:text-gray-500">(Nat: {studentProfile.nationality})</span>
                                }
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Date of Birth</h3>
                            <p className="font-bold text-gray-900 dark:text-white">{studentProfile.dob || '-'}</p>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Desired Destination</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(studentProfile.desiredDestination) && studentProfile.desiredDestination.length > 0
                                    ? studentProfile.desiredDestination.map(d => (
                                        <span key={d} className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-bold rounded">{d}</span>
                                    ))
                                    : <span className="text-gray-400 font-medium">-</span>
                                }
                            </div>
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
                                <p className="font-bold text-gray-900 dark:text-white">Independent</p>
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
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-6">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" />
                    Academic Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Current Status */}
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">Current School</span>
                            <span className="font-bold text-gray-900 dark:text-white">{studentProfile.currentSchool || '-'}</span>
                        </div>
                        <div className="flex gap-6">
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">Current Grade</span>
                                <span className="font-bold text-gray-900 dark:text-white">{studentProfile.currentGrade || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">GPA</span>
                                <span className="font-bold text-gray-900 dark:text-white">{studentProfile.gpa || '-'}</span>
                            </div>
                        </div>
                        {studentProfile.currentGrade === '12th' && (
                            <div>
                                <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold text-blue-600 dark:text-blue-400">Graduated Home Country?</span>
                                <YesNo val={studentProfile.graduatedInHomeCountry} />
                            </div>
                        )}
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold">English Level</span>
                            <span className="font-bold text-gray-900 dark:text-white">{studentProfile.englishLevel || '-'}</span>
                        </div>
                    </div>

                    {/* Target Status */}
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold mb-1">Target Grades</span>
                            <div className="flex flex-col gap-1">
                                {studentProfile.targetGrades?.USA && <span className="text-gray-700 dark:text-gray-300"><span className="font-bold">USA:</span> {studentProfile.targetGrades.USA}</span>}
                                {studentProfile.targetGrades?.Canada && <span className="text-gray-700 dark:text-gray-300"><span className="font-bold">Canada:</span> {studentProfile.targetGrades.Canada}</span>}
                                {studentProfile.targetGrades?.Online && <span className="text-gray-700 dark:text-gray-300"><span className="font-bold">Online:</span> {studentProfile.targetGrades.Online}</span>}
                                {!studentProfile.targetGrades?.USA && !studentProfile.targetGrades?.Canada && !studentProfile.targetGrades?.Online && <span className="text-gray-400 italic">-</span>}
                            </div>
                        </div>

                        {/* Seeking Graduation Logic */}
                        {(Object.values(studentProfile.targetGrades || {}).some(g => g === '12th')) && (
                            <div className="mt-2">
                                <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase font-bold text-purple-600 dark:text-purple-400">Seeking Graduation?</span>
                                <YesNo val={studentProfile.seekingGraduation} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interests & Health Card */}
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Heart size={20} className="text-pink-500" />
                    Interests & Health
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Sports & Hobbies</h3>
                        <div className="space-y-2">
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Sports:</span> {Array.isArray(studentProfile.sports) ? studentProfile.sports.join(', ') : studentProfile.sports || '-'}</p>
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Hobbies:</span> {Array.isArray(studentProfile.hobbies) ? studentProfile.hobbies.join(', ') : studentProfile.hobbies || '-'}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Personal</h3>
                        <div className="space-y-2">
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Subject:</span> {studentProfile.favoriteSubject || '-'}</p>
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Personality:</span> {studentProfile.personality || '-'}</p>
                            <p className="text-sm flex items-center gap-1"><DollarSign size={14} className="text-green-600" /> <span className="font-bold text-gray-700 dark:text-gray-300">Budget:</span> {studentProfile.budget || '-'}</p>
                        </div>
                    </div>

                    <div className="col-span-full h-px bg-gray-100 dark:bg-gray-800" />

                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Health & Diet</h3>
                        <div className="space-y-2">
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Dietary:</span> {Array.isArray(studentProfile.dietaryRestrictions) ? studentProfile.dietaryRestrictions.join(', ') : studentProfile.dietaryRestrictions || '-'}</p>
                            <p className="text-sm"><span className="font-bold text-gray-700 dark:text-gray-300">Allergies:</span> {Array.isArray(studentProfile.allergies) ? studentProfile.allergies.join(', ') : studentProfile.allergies || '-'}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Medical Notes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                            {studentProfile.medicalInfo || 'No medical info provided.'}
                        </p>
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
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Why do you want to study abroad?</h3>
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
                    {studentProfile.whatsappNumber && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                <MessageCircle size={14} className="text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-gray-900 dark:text-gray-300 group flex items-center gap-2">
                                {studentProfile.whatsappNumber}
                                <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">WhatsApp</span>
                            </span>
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
                            {(!studentProfile.preferredCommunication || studentProfile.preferredCommunication.length === 0) && <span className="text-gray-400 text-xs italic">No specific preference</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
