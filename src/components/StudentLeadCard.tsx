import React from 'react';
import { Lead } from '../types';
import { User, MapPin, GraduationCap, Activity, Smile, Building2 } from 'lucide-react';

interface Props {
    lead: Lead;
}

export const StudentLeadCard: React.FC<Props> = ({ lead }) => {
    if (lead.type !== 'Student' || !lead.studentProfile) return null;

    const { studentProfile } = lead;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] border-4 border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
            {/* Header: Name, Agency, Status */}
            <div className="bg-white dark:bg-gray-900 p-5 border-b-2 border-emerald-500 grid grid-cols-[1fr_auto] gap-4 items-start">
                <div className="min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{lead.studentName}</h3>
                    {lead.agencyProfile && (
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400 mt-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 w-full backdrop-blur-sm">
                            <span className="text-gray-400 font-extrabold text-[9px] uppercase tracking-wider shrink-0">SO:</span>
                            <div className="flex flex-wrap items-center gap-1 font-bold">
                                <span className="text-gray-900 dark:text-gray-200">{lead.agencyProfile.name}</span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">{lead.agencyProfile.country}</span>
                            </div>
                        </div>
                    )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${lead.status === 'Inquiry' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                    {lead.status}
                </span>
            </div>

            <div className="p-5 pt-4">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span>{studentProfile.age} yo • {studentProfile.gender}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>From {lead.country}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                        <GraduationCap size={14} className="text-gray-400" />
                        <span className="truncate">Wants {Array.isArray(studentProfile.desiredDestination) ? studentProfile.desiredDestination.join(', ') : studentProfile.desiredDestination}</span>
                    </div>
                </div>

                {/* Education Details */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-white dark:bg-gray-800/50 p-3 rounded-xl border-2 border-emerald-500">
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-400 uppercase text-[10px]">Current Grade</span>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{studentProfile.currentGrade || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-blue-400 uppercase text-[10px]">Requested Grade</span>
                        <span className="font-bold text-sm text-blue-900 dark:text-blue-300">{studentProfile.gradeApplyingTo || '?'}</span>
                    </div>

                    {/* Duration Row */}
                    <div className="col-span-2 flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 mt-1 pt-2 border-t-2 border-emerald-500">
                        <span className="font-bold text-gray-400 uppercase text-[10px]">Duration:</span>
                        <span className="font-bold">{studentProfile.duration || 'Not Specified'}</span>
                    </div>

                    {/* Conditional Badges */}
                    {(studentProfile.seekingGraduation || studentProfile.graduatedInHomeCountry) && (
                        <div className="col-span-2 flex gap-2 mt-1">
                            {studentProfile.seekingGraduation && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded text-[10px] font-bold uppercase tracking-wider flex-1 text-center">
                                    Seeking Graduation
                                </span>
                            )}
                            {studentProfile.graduatedInHomeCountry && (
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 rounded text-[10px] font-bold uppercase tracking-wider flex-1 text-center">
                                    Already Graduated
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tags Section */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {studentProfile.sports?.slice(0, 2).map((sport, i) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-md flex items-center gap-1">
                            <Activity size={10} /> {sport}
                        </span>
                    ))}
                    {studentProfile.hobbies?.slice(0, 1).map((hobby, i) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-md flex items-center gap-1">
                            <Smile size={10} /> {hobby}
                        </span>
                    ))}
                </div>



                {/* DATE TRACKING */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 gap-2">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Received</span>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{new Date(lead.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Last Contact</span>
                        <span className={`font-bold ${lead.lastContacted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {lead.lastContacted ? new Date(lead.lastContacted).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' }) : 'Never'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] bg-blue-50 dark:bg-blue-900/20 -mx-4 px-4 py-2 mt-1">
                        <span className="text-blue-400 font-bold uppercase tracking-wider">Follow Up</span>
                        <span className="font-bold text-blue-600 dark:text-blue-300">
                            {lead.followUpDate
                                ? new Date(lead.followUpDate).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                                : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000)).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
