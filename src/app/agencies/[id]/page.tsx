"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../components/Navigation';
import { Agency } from '../../../types';
import { useLeads } from '../../../context/LeadContext';
import { ArrowLeft, User, Phone, Mail, MapPin, Globe, Calendar, DollarSign, Award, BookOpen, MessageCircle, GraduationCap, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { LeadDetailModal } from '../../../components/LeadDetailModal';

export default function AgencyProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { leads, updateLead } = useLeads();

    // Find lead and map to Agency
    const foundLead = leads.find(l => String(l.id) === String(params.id));
    const agency = foundLead && foundLead.type === 'Agent' && foundLead.agencyProfile ? {
        ...foundLead.agencyProfile,
        id: foundLead.id,
        name: foundLead.agentName,
        country: foundLead.country,
        type: 'Agent',
        // Merge defaults
        historicalSends: foundLead.agencyProfile.historicalSends || 0,
        partnershipStatus: foundLead.agencyProfile.partnershipStatus || 'Prospective',
        lastContactDate: foundLead.lastContacted || foundLead.createdAt,
        keyContacts: foundLead.agencyProfile.keyContacts || [],
        secondaryContact: foundLead.agencyProfile.secondaryContact || undefined // explicit
    } as Agency : null;

    const loading = leads.length === 0;

    // Find linked students
    const linkedStudents = leads.filter(l => l.type === 'Student' && String(l.studentProfile?.agencyId) === String(agency?.id));

    // State for Quick View
    const [selectedStudentId, setSelectedStudentId] = useState<string | number | null>(null);
    const selectedStudent = leads.find(l => l.id === selectedStudentId) || null;

    // Helper to calculate time
    const getTime = (zone: string) => {
        try {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'UTC' // Default fallback
            };

            const tzMap: Record<string, string> = {
                'GMT-3': 'Etc/GMT+3', // Posix inverted
                'CET': 'Europe/Berlin',
                'GMT+7': 'Asia/Bangkok',
                'EST': 'America/New_York',
                'PST': 'America/Los_Angeles',
                'UTC': 'UTC'
            };

            let targetZone = tzMap[zone] || zone;

            try {
                options.timeZone = targetZone;
                return new Intl.DateTimeFormat('en-US', options).format(now);
            } catch (e) {
                if (zone.startsWith('GMT') || zone.startsWith('UTC')) {
                    const offsetStr = zone.replace('GMT', '').replace('UTC', '');
                    const offset = parseInt(offsetStr);
                    if (!isNaN(offset)) {
                        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                        const targetTime = new Date(utc + (3600000 * offset));
                        return targetTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                    }
                }
                return '-';
            }
        } catch (e) {
            return '-';
        }
    };

    const pstTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: 'numeric', hour12: true });
    const estTime = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: true });
    const localTime = agency?.timezone ? getTime(agency.timezone) : '-';

    const hasMissingInfo = !agency?.website || !agency?.address || !agency?.region || !agency?.metAt || !agency?.commissionRate || !agency?.timezone;

    if (loading) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Loading...</div>;
    if (!agency) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Agency not found</div>;

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />
            <LeadDetailModal lead={selectedStudent} onClose={() => setSelectedStudentId(null)} />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                {/* Top Bar: Back Link & Action Buttons */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between">
                    <Link href="/agencies" className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                        Back to Agencies
                    </Link>

                    <div className="flex items-center gap-4">
                        {hasMissingInfo && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-900/40 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400" />
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Missing Info</span>
                            </div>
                        )}
                        <Link href={`/agencies/${agency.id}/edit`}>
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

                        {/* Agency Details Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 dark:bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                                <Globe size={20} className="text-blue-500" />
                                Agency Details
                            </h2>

                            <div className="relative z-10 space-y-8">
                                {/* Top Row: Name and Status */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Agency Name</h3>
                                        <div className="flex items-center gap-3">
                                            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{agency.name}</p>
                                            <div className="relative group">
                                                <select
                                                    value={agency.partnershipStatus}
                                                    onChange={(e) => updateLead(agency.id, { agencyProfile: { ...agency, partnershipStatus: e.target.value as any } })}
                                                    className={`appearance-none cursor-pointer border-0 outline-none font-black uppercase tracking-wide py-1.5 px-3 rounded-lg text-xs transition-all hover:opacity-80 pr-8
                                                        ${agency.partnershipStatus === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                                            agency.partnershipStatus === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' :
                                                                agency.partnershipStatus === 'Inactive' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' :
                                                                    agency.partnershipStatus === 'Do Not Contact' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                                                        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' // Prospective
                                                        }`}
                                                >
                                                    <option value="Prospective">Prospective</option>
                                                    <option value="Active">Active</option>
                                                    <option value="Pending">Pending</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="Do Not Contact">Do Not Contact</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Information Grid - Only show present fields */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                                    {agency.city && agency.country && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Location</h3>
                                            <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400 dark:text-gray-500" />
                                                {agency.city}, {agency.country}
                                            </p>
                                        </div>
                                    )}
                                    {agency.region && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Region</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{agency.region}</p>
                                        </div>
                                    )}
                                    {agency.address && (
                                        <div className="col-span-2">
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Address</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{agency.address}</p>
                                        </div>
                                    )}
                                    {agency.website && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Website</h3>
                                            <a href={agency.website} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
                                                <Globe size={16} /> {agency.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    {agency.type && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Agency Type</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{agency.type}</p>
                                        </div>
                                    )}
                                    {agency.metAt && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Met At</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{agency.metAt}</p>
                                        </div>
                                    )}
                                    {agency.language && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Language</h3>
                                            <p className="font-bold text-gray-900 dark:text-white">{agency.language}</p>
                                        </div>
                                    )}
                                    {agency.commissionRate && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Commission Rate</h3>
                                            <p className="text-2xl font-black text-green-600 dark:text-green-400">{agency.commissionRate}</p>
                                        </div>
                                    )}

                                    {/* Timezone & Times */}
                                    {(agency.timezone) && (
                                        <div className="col-span-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-8 justify-between items-center">
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Agency Timezone</h3>
                                                <p className="text-xl font-black text-gray-900 dark:text-white">{agency.timezone}</p>
                                            </div>
                                            <div className="flex gap-8 text-center">
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Local Time</div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{localTime}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">PST (Office)</div>
                                                    <div className="font-bold text-gray-500 dark:text-gray-400">{pstTime}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">EST</div>
                                                    <div className="font-bold text-gray-500 dark:text-gray-400">{estTime}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Student Stats */}
                                    <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <StudentStatsCard total={agency.historicalSends} />
                                    </div>
                                </div>

                                {/* New Profile Details */}
                                {agency.recruitingCountries && agency.recruitingCountries.length > 0 && (
                                    <div className="col-span-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Recruits From</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {agency.recruitingCountries.map(c => (
                                                <span key={c} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold border border-green-100 dark:border-green-900/20 flex items-center gap-2">
                                                    <Globe size={12} /> {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {agency.targetCountries && agency.targetCountries.length > 0 && (
                                    <div className="col-span-2 pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Target Countries</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {agency.targetCountries.map(c => (
                                                <span key={c} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-100 dark:border-blue-900/20">
                                                    {c}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {agency.gradesOffered && agency.gradesOffered.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Grades Offered</h3>
                                        <div className="space-y-2">
                                            {agency.gradesOffered.map(g => (
                                                <div key={g} className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                    {g}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {agency.duration && agency.duration.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Duration</h3>
                                        <div className="space-y-2">
                                            {agency.duration.map(d => (
                                                <div key={d} className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                                    <div className="w-2 h-2 rounded-full bg-green-400" />
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Linked Students Section */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <GraduationCap size={20} className="text-black dark:text-white" />
                                Linked Students ({linkedStudents.length})
                            </h2>

                            {linkedStudents.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {linkedStudents.map(student => (
                                        <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700/80 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{student.studentName}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        {student.status} • {student.studentProfile?.desiredDestination?.join(', ') || 'No Dest.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedStudentId(student.id)}
                                                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Quick View"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <Link href={`/students/${student.id}`}>
                                                    <button className="p-2 text-gray-300 dark:text-gray-600 hover:text-black dark:hover:text-white transition-colors">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic">No students linked to this agency yet.</div>
                            )}
                        </div>

                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* Onboarding Checklist Sidebar */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                Onboarding
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { key: 'agreementSent', label: 'Agreement Sent' },
                                    { key: 'agreementSigned', label: 'Agreement Signed' },
                                    { key: 'applicationAccountCreated', label: 'App Account Created' },
                                    { key: 'schoolPriceListSent', label: 'School Price List Sent' },
                                    { key: 'schoolProfilesSent', label: 'School Profiles Sent' },
                                    { key: 'addedMarketingList', label: 'Added to Marketing List' },
                                    { key: 'agentHandbookSent', label: 'Agent Handbook Sent' },
                                    { key: 'studentHandbookSent', label: 'Student Handbook Sent' },
                                    { key: 'commissionRequestFormSent', label: 'Comm. Request Form Sent' }
                                ].map(item => {
                                    const isChecked = agency.onboardingChecklist?.[item.key as keyof typeof agency.onboardingChecklist] || false;
                                    return (
                                        <div
                                            key={item.key}
                                            className="flex items-center gap-3 cursor-pointer group/check p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            onClick={() => updateLead(agency.id, {
                                                agencyProfile: {
                                                    ...agency,
                                                    onboardingChecklist: {
                                                        ...(agency.onboardingChecklist || {
                                                            agreementSent: false,
                                                            agreementSigned: false,
                                                            applicationAccountCreated: false,
                                                            schoolPriceListSent: false,
                                                            schoolProfilesSent: false,
                                                            addedMarketingList: false,
                                                            agentHandbookSent: false,
                                                            studentHandbookSent: false,
                                                            commissionRequestFormSent: false
                                                        }),
                                                        [item.key]: !isChecked
                                                    }
                                                }
                                            })}
                                        >
                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 group-hover/check:border-blue-400'}`}>
                                                {isChecked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                                            </div>
                                            <span className={`text-sm font-bold transition-colors ${isChecked ? 'text-gray-900 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400 group-hover/check:text-blue-600'}`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cultural & General Notes - ONLY Render if exists */}
                        {(agency.generalNotes || agency.culturalNotes) && (
                            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <BookOpen size={20} className="text-purple-500" />
                                    Partnership Notes
                                </h2>

                                <div className="space-y-6">
                                    {agency.generalNotes && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">General Info</h3>
                                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{agency.generalNotes}</p>
                                        </div>
                                    )}

                                    {agency.culturalNotes && (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Cultural & Communication Notes</h3>
                                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-purple-50/50 dark:bg-purple-900/20 p-6 rounded-2xl border border-purple-50 dark:border-purple-900/30">
                                                {agency.culturalNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contacts Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <User size={20} className="text-orange-500" />
                                Key Contacts
                            </h2>

                            <div className="space-y-6">
                                {agency.keyContacts.map((contact, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <div className="text-lg font-black text-gray-900 dark:text-white">{contact.name}</div>
                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{contact.role}</div>
                                            {contact.nickname && <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">aka "{contact.nickname}"</div>}
                                        </div>

                                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                                                    <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <a href={`mailto:${contact.email}`} className="hover:text-black dark:hover:text-white transition-colors truncate">{contact.email}</a>
                                            </div>
                                            {contact.phone && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                                                        <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <span className="text-gray-900 dark:text-gray-300">{contact.phone}</span>
                                                </div>
                                            )}
                                            {contact.whatsapp && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900/20 flex items-center justify-center shrink-0">
                                                        <MessageCircle size={14} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <span className="text-green-700 dark:text-green-400">{contact.whatsapp}</span>
                                                </div>
                                            )}
                                            {contact.preferredCommunication && (
                                                <div className="pt-2">
                                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                                        Prefers: {contact.preferredCommunication}
                                                    </span>
                                                </div>
                                            )}
                                            {contact.notes && (
                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">"{contact.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Secondary Contact */}
                                {agency.secondaryContact && agency.secondaryContact.name && (
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-4 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl text-gray-500 dark:text-gray-300 uppercase">Secondary</div>
                                        <div>
                                            <div className="text-lg font-black text-gray-900 dark:text-white">{agency.secondaryContact.name}</div>
                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">{agency.secondaryContact.role}</div>
                                        </div>

                                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 font-medium">
                                            {agency.secondaryContact.email && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                                                        <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <a href={`mailto:${agency.secondaryContact.email}`} className="hover:text-black dark:hover:text-white transition-colors truncate">{agency.secondaryContact.email}</a>
                                                </div>
                                            )}
                                            {agency.secondaryContact.whatsapp && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-900/20 flex items-center justify-center shrink-0">
                                                        <MessageCircle size={14} className="text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <span className="text-green-700 dark:text-green-400">{agency.secondaryContact.whatsapp}</span>
                                                </div>
                                            )}
                                            {agency.secondaryContact.notes && (
                                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">"{agency.secondaryContact.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Award size={20} className="text-gray-400" />
                                Metadata
                            </h2>
                            <div className="space-y-4 text-sm">
                                {agency.contractSignedDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Contract Signed</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{new Date(agency.contractSignedDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Last Contact</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{new Date(agency.lastContactDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main >
        </div >
    );
}

const StudentStatsCard = ({ total }: { total: number }) => {
    const [timeframe, setTimeframe] = useState('Total');
    const [stat, setStat] = useState(total);

    // Mock logic for timeframes (since backend doesn't exist yet)
    useEffect(() => {
        if (timeframe === 'Total') {
            setStat(total);
        } else {
            // Mock random stats based on total for demo purposes
            const seed = timeframe.length;
            // Just show a fraction or 0 if total is 0
            setStat(total > 0 ? Math.max(1, Math.floor(total / (timeframe.includes('Years') ? 2 : 5))) : 0);
        }
    }, [timeframe, total]);

    const timeframes = [
        'Total',
        'This Year',
        'Last Year',
        '2 Years Ago',
        '3 Years Ago',
        '4 Years Ago',
        '5 Years Ago',
        'Last 2 Years',
        'Last 3 Years',
        'Last 4 Years',
        'Last 5 Years'
    ];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6 min-w-[320px]">
            <div className="bg-blue-50 dark:bg-blue-900/30 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Number of Students Sent</h3>
                </div>

                <div className="flex items-end gap-3">
                    <div className="text-4xl font-black text-gray-900 dark:text-white leading-none">
                        {stat}
                    </div>
                </div>

                <div className="mt-2">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 py-1.5 px-3 rounded-lg border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-100 dark:focus:border-blue-900/40 hover:bg-gray-100 dark:hover:bg-gray-700 outline-none w-full cursor-pointer transition-all"
                    >
                        {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};
