
import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { useLeads } from '../context/LeadContext';
import { X, User, Calendar, Languages, GraduationCap, School as SchoolIcon, Activity, Smile, BookOpen, Briefcase, PenTool, MapPin, Save, Edit2, StickyNote, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { COUNTRIES } from '../data/countries';
import { CheckboxGroup, CountrySelector, Input, Select, PhoneInput, SearchableSelect } from './ui/FormComponents';

interface Props {
    lead: Lead | null;
    onClose: () => void;
}

// Helper to format Date string (UTC) to Local ISO string for datetime-local input
const toLocalISOString = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const LeadDetailModal: React.FC<Props> = ({ lead, onClose }) => {
    const { leads, updateLead } = useLeads();
    const sortedAgencies = (leads || []).filter(l => l.type === 'Agent').sort((a, b) => (a.agentName || '').localeCompare(b.agentName || ''));
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [newNote, setNewNote] = useState('');

    // Generate Hour Options (0-23)
    const HOURS = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return { value: hour, label: `${displayHour} ${ampm}` };
    });

    const updateDateTime = (field: string, type: 'date' | 'hour', value: string) => {
        const currentIso = formData[field] || new Date().toISOString();
        const currentDate = new Date(currentIso);

        if (type === 'date') {
            // Value is YYYY-MM-DD
            if (!value) return; // Handle clear?
            const [y, m, d] = value.split('-').map(Number);
            currentDate.setFullYear(y);
            currentDate.setMonth(m - 1);
            currentDate.setDate(d);
        } else {
            // Value is hour "0"-"23"
            currentDate.setHours(parseInt(value), 0, 0, 0); // Reset min/sec
        }

        setFormData((prev: any) => ({ ...prev, [field]: currentDate.toISOString() }));
    };

    useEffect(() => {
        if (lead) {
            const initialData = JSON.parse(JSON.stringify(lead));
            // Ensure structures exist
            if (!initialData.agencyProfile) initialData.agencyProfile = {};
            if (!initialData.agencyProfile.targetCountries) initialData.agencyProfile.targetCountries = [];
            if (!initialData.agencyProfile.gradesOffered) initialData.agencyProfile.gradesOffered = [];
            if (!initialData.agencyProfile.duration) initialData.agencyProfile.duration = [];

            // Notes init
            if (!initialData.notes) initialData.notes = [];

            // Name fallback
            if (!isStudent && !initialData.agentName) initialData.agentName = initialData.title?.split('-')[0]?.trim() || '';

            setFormData(initialData);
            setNewNote('');
            setIsEditing(false);
        }
    }, [lead]);

    if (!lead) return null;

    const isStudent = lead.type === 'Student';
    const profile = lead.studentProfile; // Read-only reference for display
    const editProfile = formData.studentProfile || {}; // Mutable reference for edit

    const handleSave = () => {
        let submissionData = { ...formData };
        if (newNote.trim()) {
            const note = {
                id: crypto.randomUUID(),
                content: newNote.trim(),
                timestamp: new Date().toISOString()
            };
            submissionData.notes = [...(submissionData.notes || []), note];
        }
        updateLead(lead.id, submissionData);
        setFormData(submissionData);
        setIsEditing(false);
        setNewNote('');
    };

    const updateProfileField = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            studentProfile: {
                ...prev.studentProfile,
                [field]: value
            }
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20 flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="bg-[#F9F9FB] dark:bg-gray-950 p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start">
                    <div className="flex gap-6 w-full">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0 ${isStudent ? 'bg-orange-500' : 'bg-purple-600'}`}>
                            {lead.country.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        {isEditing ? (
                                            <div className="space-y-2 w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap w-12">Name:</span>
                                                    <input
                                                        value={isStudent ? formData.studentName : (formData.agentName || '')}
                                                        onChange={e => setFormData((p: any) => ({ ...p, [isStudent ? 'studentName' : 'agentName']: e.target.value }))}
                                                        className="text-xl font-black text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0 py-1 w-full outline-none"
                                                        placeholder="Agent Name"
                                                    />
                                                </div>
                                                {!isStudent && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap w-12">Web:</span>
                                                            <input
                                                                value={formData.agencyProfile?.website || ''}
                                                                onChange={e => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, website: e.target.value } }))}
                                                                className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0 py-1 w-full outline-none"
                                                                placeholder="www.example.com"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap w-12">Region:</span>
                                                                <input
                                                                    value={formData.agencyProfile?.region || ''}
                                                                    onChange={e => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, region: e.target.value } }))}
                                                                    className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0 py-1 w-full outline-none"
                                                                    placeholder="Region"
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap w-12">City:</span>
                                                                <input
                                                                    value={formData.agencyProfile?.city || ''}
                                                                    onChange={e => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, city: e.target.value } }))}
                                                                    className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0 py-1 w-full outline-none"
                                                                    placeholder="City"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400 font-bold uppercase text-[10px] whitespace-nowrap w-12">Addr:</span>
                                                            <input
                                                                value={formData.agencyProfile?.address || ''}
                                                                onChange={e => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, address: e.target.value } }))}
                                                                className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white rounded-none px-0 py-1 w-full outline-none"
                                                                placeholder="Full Address"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">{isStudent ? lead.studentName : lead.agentName}</h2>
                                        )}
                                        {!isEditing && (
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0 ${isStudent ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {lead.type}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Selector - Student Only */}
                                {isStudent && (
                                    <div className="shrink-0">
                                        <select
                                            value={lead.status || 'Inquiry'}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as any;
                                                // Live Update
                                                updateLead(lead.id, { status: newStatus });
                                                // Sync local form data
                                                setFormData((p: any) => ({ ...p, status: newStatus }));
                                            }}
                                            className={`appearance-none cursor-pointer border-0 outline-none font-black text-xs uppercase tracking-wider py-2 px-4 rounded-xl text-center transition-all hover:opacity-80
                                                ${lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                                                    lead.status === 'Contacted' ? 'bg-orange-100 text-orange-700' :
                                                        lead.status === 'Lost' ? 'bg-gray-100 text-gray-500' :
                                                            'bg-blue-100 text-blue-700' // Inquiry
                                                }`}
                                        >
                                            <option value="Inquiry">Inquiry</option>
                                            <option value="Contacted">Contacted</option>
                                            <option value="Qualified">Qualified</option>
                                            <option value="Lost">Archived</option>
                                        </select>
                                    </div>
                                )}

                                {/* Status Selector - Agent Only */}
                                {!isStudent && (
                                    <div className="shrink-0">
                                        <select
                                            value={lead.agencyProfile?.partnershipStatus || 'Prospective'}
                                            onChange={(e) => {
                                                const newStatus = e.target.value;
                                                // Live Update
                                                updateLead(lead.id, {
                                                    agencyProfile: {
                                                        ...lead.agencyProfile,
                                                        partnershipStatus: newStatus as any
                                                    } as any
                                                });
                                                // Sync local form data too if editing
                                                setFormData((p: any) => ({
                                                    ...p,
                                                    agencyProfile: {
                                                        ...p.agencyProfile,
                                                        partnershipStatus: newStatus as any
                                                    }
                                                }));
                                            }}
                                            className={`appearance-none cursor-pointer border-0 outline-none font-black text-xs uppercase tracking-wider py-2 px-4 rounded-xl text-center transition-all hover:opacity-80
                                                ${lead.agencyProfile?.partnershipStatus === 'Active' ? 'bg-green-100 text-green-700' :
                                                    lead.agencyProfile?.partnershipStatus === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                        lead.agencyProfile?.partnershipStatus === 'Inactive' ? 'bg-gray-100 text-gray-500' :
                                                            lead.agencyProfile?.partnershipStatus === 'Do Not Contact' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700' // Prospective
                                                }`}
                                        >
                                            <option value="Prospective">Prospective</option>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Do Not Contact">Do Not Contact</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-500 font-medium flex items-center gap-2">
                                <MapPin size={16} />
                                {isEditing ? (
                                    <>
                                        <input
                                            list="countries-list"
                                            value={formData.country}
                                            onChange={e => setFormData((p: any) => ({ ...p, country: e.target.value }))}
                                            className="text-sm font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white rounded-none px-0 py-0.5 w-48 outline-none placeholder:text-gray-300 dark:text-gray-300"
                                            placeholder="Select Country..."
                                        />
                                        <datalist id="countries-list">
                                            {COUNTRIES.map(c => <option key={c} value={c} />)}
                                        </datalist>
                                    </>
                                ) : (
                                    <>
                                        {lead.country} • {lead.status}
                                        {!isStudent && lead.agencyProfile?.city && ` • ${lead.agencyProfile.city}`}
                                        {!isStudent && lead.agencyProfile?.website && (
                                            <a href={lead.agencyProfile.website.startsWith('http') ? lead.agencyProfile.website : `https://${lead.agencyProfile.website}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 dark:text-blue-400 hover:underline text-xs">
                                                Website
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>



                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-400'}`}
                    >
                        <Edit2 size={24} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8">


                    {/* TOP METRICS: DATES (Moved & Refined) */}
                    {/* TOP METRICS: DATES (Moved & Refined) */}
                    <div className={`grid gap-3 mb-6 ${(['Prospective', 'Pending'].includes(lead.agencyProfile?.partnershipStatus || 'Prospective')) ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {/* Date Added */}
                        <div className="bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-100/60 dark:border-gray-700/60 h-full flex flex-col">
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider mb-1">Date Added</p>
                            <p className="font-black text-gray-800 dark:text-gray-200 text-xs">
                                {new Date(lead.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}
                            </p>
                        </div>

                        {/* Last Contacted */}
                        <div className="bg-gray-50/80 dark:bg-gray-800/80 p-3 rounded-2xl border border-gray-100/60 dark:border-gray-700/60 h-full flex flex-col">
                            <p className="text-[9px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-wider mb-1">Last Contacted</p>
                            {isEditing ? (
                                <div className="flex flex-col gap-1.5">
                                    <input
                                        type="date"
                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-[10px] font-bold w-full dark:text-white"
                                        value={formData.lastContacted ? new Date(formData.lastContacted).toISOString().split('T')[0] : ''}
                                        onChange={e => updateDateTime('lastContacted', 'date', e.target.value)}
                                    />
                                    <select
                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-[10px] font-bold w-full dark:text-white"
                                        value={formData.lastContacted ? new Date(formData.lastContacted).getHours() : new Date().getHours()}
                                        onChange={e => updateDateTime('lastContacted', 'hour', e.target.value)}
                                    >
                                        {HOURS.map(h => (
                                            <option key={h.value} value={h.value}>{h.label}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <p className={`font-black text-xs ${lead.lastContacted ? 'text-gray-800 dark:text-gray-200' : 'text-gray-300 dark:text-gray-600'}`}>
                                    {lead.lastContacted
                                        ? new Date(lead.lastContacted).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                                        : 'Never'
                                    }
                                </p>
                            )}
                        </div>

                        {/* Follow Up Due - Conditional Display */}
                        {(['Prospective', 'Pending'].includes(lead.agencyProfile?.partnershipStatus || 'Prospective')) && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100/60 dark:border-blue-800/40 relative group h-full flex flex-col">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[9px] text-blue-400 dark:text-blue-300 font-black uppercase tracking-wider">Follow Up</p>
                                    {!isEditing && <PenTool size={10} onClick={() => setIsEditing(true)} className="text-blue-300 dark:text-blue-400 opacity-0 group-hover:opacity-100 cursor-pointer" />}
                                </div>
                                {isEditing ? (
                                    <div className="flex flex-col gap-1.5">
                                        <input
                                            type="date"
                                            className="bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-900 dark:text-blue-100 w-full"
                                            value={formData.followUpDate ? new Date(formData.followUpDate).toISOString().split('T')[0] : ''}
                                            onChange={e => updateDateTime('followUpDate', 'date', e.target.value)}
                                        />
                                        <select
                                            className="bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-lg px-2 py-1 text-[10px] font-bold text-blue-900 dark:text-blue-100 w-full"
                                            value={formData.followUpDate ? new Date(formData.followUpDate).getHours() : 9}
                                            onChange={e => updateDateTime('followUpDate', 'hour', e.target.value)}
                                        >
                                            {HOURS.map(h => (
                                                <option key={h.value} value={h.value}>{h.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <p className="font-black text-blue-600 dark:text-blue-300 text-xs">
                                        {lead.followUpDate
                                            ? new Date(lead.followUpDate).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                                            : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000)).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                                        }
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* NOTES SECTION (Moved to Body) */}
                    <div className="mb-8">
                        <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <StickyNote size={14} /> Notes & History
                        </h3>
                        <div className="bg-yellow-50/50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/20">
                            <div className="space-y-3">
                                {formData.notes && formData.notes.length > 0 && (
                                    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                        {[...formData.notes].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((note: any) => (
                                            <div key={note.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-yellow-100 dark:border-gray-700 shadow-sm text-sm">
                                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold text-right mt-2 flex justify-end items-center gap-1">
                                                    {new Date(note.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isEditing ? (
                                    <div className="mt-3">
                                        <textarea
                                            value={newNote}
                                            onChange={e => setNewNote(e.target.value)}
                                            placeholder="Write a new note..."
                                            className="w-full bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-900/40 focus:border-yellow-400 dark:focus:border-yellow-600 focus:ring-4 focus:ring-yellow-50 dark:focus:ring-yellow-900/10 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all resize-none placeholder:text-gray-400 dark:text-white"
                                            rows={3}
                                            autoFocus
                                        />
                                        <p className="text-[10px] text-gray-400 mt-2 text-right">Saving changes will add this note.</p>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setIsEditing(true)}
                                        className="py-3 px-4 rounded-xl border-2 border-dashed border-yellow-200 dark:border-yellow-900/30 text-yellow-600/70 dark:text-yellow-500/70 text-sm font-bold cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/10 hover:border-yellow-300 dark:hover:border-yellow-900/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <PenTool size={14} /> Click to Add Note
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* STUDENT DETAILS */}
                    {isStudent && profile ? (
                        <div className="space-y-8">

                            {/* DEMOGRAPHICS */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Demographics</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <DetailItem
                                        icon={<User />}
                                        label="Age"
                                        value={isEditing ?
                                            <Input value={editProfile.age} onChange={v => updateProfileField('age', v)} type="number" /> :
                                            `${profile.age} Years`}
                                    />
                                    <DetailItem
                                        icon={<Calendar />}
                                        label="DOB"
                                        value={isEditing ?
                                            <Input value={editProfile.dob} onChange={v => updateProfileField('dob', v)} type="date" /> :
                                            profile.dob}
                                    />
                                    <DetailItem
                                        icon={<User />}
                                        label="Gender"
                                        value={isEditing ?
                                            <Input value={editProfile.gender} onChange={v => updateProfileField('gender', v)} /> :
                                            profile.gender}
                                    />
                                    <DetailItem
                                        icon={<Languages />}
                                        label="English"
                                        value={isEditing ?
                                            <Select value={editProfile.englishLevel} onChange={v => updateProfileField('englishLevel', v)} options={['Low', 'Intermediate', 'Advanced']} /> :
                                            profile.englishLevel}
                                    />
                                    {isEditing && (
                                        <>
                                            <DetailItem
                                                icon={<Globe />}
                                                label="Nationality"
                                                value={<SearchableSelect value={editProfile.nationality || ''} onChange={v => updateProfileField('nationality', v)} options={COUNTRIES} placeholder="Select Country" />}
                                            />
                                            <DetailItem
                                                icon={<MapPin />}
                                                label="Residence"
                                                value={<SearchableSelect value={editProfile.residence || ''} onChange={v => updateProfileField('residence', v)} options={COUNTRIES} placeholder="Select Country" />}
                                            />
                                            <DetailItem
                                                icon={<Activity />}
                                                label="Phone"
                                                className="col-span-full"
                                                value={<PhoneInput value={editProfile.phoneNumber} onChange={v => updateProfileField('phoneNumber', v)} defaultCountry={editProfile.nationality || editProfile.residence} />}
                                            />
                                            <DetailItem
                                                icon={<MessageCircle />}
                                                label="WhatsApp"
                                                className="col-span-full"
                                                value={<PhoneInput value={editProfile.whatsappNumber} onChange={v => updateProfileField('whatsappNumber', v)} defaultCountry={editProfile.nationality || editProfile.residence} icon={<MessageCircle size={14} />} />}
                                            />
                                        </>
                                    )}
                                    <DetailItem
                                        icon={<Briefcase />}
                                        label="Agency Source"
                                        value={isEditing ?
                                            <div className="relative">
                                                <select
                                                    value={editProfile.agencyId || ''}
                                                    onChange={e => updateProfileField('agencyId', e.target.value)}
                                                    className="w-full bg-transparent border-b border-gray-300 focus:border-black rounded-none px-0 py-0.5 text-sm font-medium outline-none appearance-none cursor-pointer"
                                                >
                                                    <option value="">Direct / None</option>
                                                    {sortedAgencies.map(agency => (
                                                        <option key={agency.id} value={agency.id}>
                                                            {agency.agentName || agency.title}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            :
                                            (profile.agencyId ? (
                                                <Link href={`/agencies/${profile.agencyId}`} className="text-blue-600 hover:underline">
                                                    {leads.find(l => String(l.id) === String(profile.agencyId))?.agentName || 'Unknown Agency'}
                                                </Link>
                                            ) : 'Direct')}
                                    />
                                </div>
                            </section>

                            {/* PREFERENCES */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Preferences</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <DetailItem
                                        icon={<GraduationCap />}
                                        label="Desired Dest."
                                        value={isEditing ?
                                            <div className="min-w-[120px]">
                                                <CheckboxGroup
                                                    options={['USA', 'Canada', 'Online']}
                                                    selected={Array.isArray(editProfile.desiredDestination) ? editProfile.desiredDestination : [editProfile.desiredDestination].filter(Boolean)}
                                                    onChange={v => updateProfileField('desiredDestination', v)}
                                                />
                                            </div> :
                                            (Array.isArray(profile.desiredDestination) ? profile.desiredDestination.join(', ') : profile.desiredDestination)}
                                    />
                                    <DetailItem
                                        icon={<SchoolIcon />}
                                        label="Current School"
                                        value={isEditing ?
                                            <Input value={editProfile.currentSchool} onChange={v => updateProfileField('currentSchool', v)} /> :
                                            (profile.currentSchool || 'Undecided')}
                                    />
                                    <DetailItem
                                        icon={<BookOpen />}
                                        label="GPA"
                                        value={isEditing ?
                                            <Input value={editProfile.gpa} onChange={v => updateProfileField('gpa', v)} /> :
                                            (profile.gpa || '-')}
                                    />
                                    <DetailItem
                                        icon={<SchoolIcon />}
                                        label="Target School"
                                        value={isEditing ?
                                            <Input value={editProfile.desiredSchool} onChange={v => updateProfileField('desiredSchool', v)} /> :
                                            (profile.desiredSchool || 'Undecided')}
                                    />
                                    <DetailItem
                                        icon={<SchoolIcon />}
                                        label="Current Grade"
                                        value={isEditing ?
                                            <Select
                                                value={editProfile.currentGrade}
                                                onChange={v => updateProfileField('currentGrade', v)}
                                                options={['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th']}
                                            /> :
                                            (profile.currentGrade || '-')}
                                    />

                                    {/* Conditional: Graduated in Home Country (If Current Grade is 12th) */}
                                    {editProfile.currentGrade === '12th' && isEditing && (
                                        <div className="col-span-2 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                                            <p className="text-[10px] font-bold text-yellow-600 uppercase mb-2">Graduated in Home Country?</p>
                                            <div className="flex gap-2">
                                                {['Yes', 'No'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => updateProfileField('graduatedInHomeCountry', opt === 'Yes')}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${(editProfile.graduatedInHomeCountry === (opt === 'Yes'))
                                                            ? 'bg-yellow-500 text-white border-yellow-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-yellow-50'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Read Only Display for Condition */}
                                    {!isEditing && profile.currentGrade === '12th' && (
                                        <DetailItem
                                            icon={<GraduationCap />}
                                            label="Home Graduation?"
                                            value={profile.graduatedInHomeCountry ? 'Yes' : 'No'}
                                        />
                                    )}

                                    <DetailItem
                                        icon={<SchoolIcon />}
                                        label="Applying Grade"
                                        value={isEditing ?
                                            <Select
                                                value={editProfile.gradeApplyingTo}
                                                onChange={v => updateProfileField('gradeApplyingTo', v)}
                                                options={['6th', '7th', '8th', '9th', '10th', '11th', '12th']}
                                            /> :
                                            (profile.gradeApplyingTo || '-')}
                                    />

                                    {/* Conditional: Seeking Graduation (If Applying Grade is 12th) */}
                                    {editProfile.gradeApplyingTo === '12th' && isEditing && (
                                        <div className="col-span-2 bg-indigo-50 p-3 rounded-xl border border-indigo-200">
                                            <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Seeking Graduation?</p>
                                            <div className="flex gap-2">
                                                {['Yes', 'No'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => updateProfileField('seekingGraduation', opt === 'Yes')}
                                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${(editProfile.seekingGraduation === (opt === 'Yes'))
                                                            ? 'bg-indigo-500 text-white border-indigo-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-indigo-50'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Read Only Display for Condition */}
                                    {!isEditing && profile.gradeApplyingTo === '12th' && (
                                        <DetailItem
                                            icon={<GraduationCap />}
                                            label="Seek Graduation?"
                                            value={profile.seekingGraduation ? 'Yes' : 'No'}
                                        />
                                    )}
                                    <DetailItem
                                        icon={<Calendar />}
                                        label="Duration"
                                        value={isEditing ?
                                            <Select
                                                value={editProfile.duration}
                                                onChange={v => updateProfileField('duration', v)}
                                                options={['Short Term', 'Semester (Aug)', 'Semester (Jan)', 'Academic Year', 'Calendar Year']}
                                            /> :
                                            (profile.duration || '-')}
                                    />
                                    <DetailItem
                                        icon={<SchoolIcon />}
                                        label="Budget"
                                        value={isEditing ?
                                            <Input value={editProfile.budget} onChange={v => updateProfileField('budget', v)} /> :
                                            (profile.budget || '-')}
                                    />
                                </div>
                            </section>

                            {/* INTERESTS */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Interests & Hobbies</h3>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <Input label="Sports (comma sep)" value={Array.isArray(editProfile.sports) ? editProfile.sports.join(', ') : editProfile.sports} onChange={v => updateProfileField('sports', v.split(',').map((s: string) => s.trim()))} />
                                        <Input label="Hobbies (comma sep)" value={Array.isArray(editProfile.hobbies) ? editProfile.hobbies.join(', ') : editProfile.hobbies} onChange={v => updateProfileField('hobbies', v.split(',').map((s: string) => s.trim()))} />
                                        <Input label="Fav Subject" value={editProfile.favoriteSubject} onChange={v => updateProfileField('favoriteSubject', v)} />
                                        <Input label="Dietary Restrictions" value={editProfile.dietaryRestrictions || ''} onChange={v => updateProfileField('dietaryRestrictions', v)} />
                                        <Input label="Allergies" value={editProfile.allergies || ''} onChange={v => updateProfileField('allergies', v)} />
                                        <Input label="Medical Info" isTextArea value={editProfile.medicalInfo || ''} onChange={v => updateProfileField('medicalInfo', v)} />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.sports?.map(s => <Tag key={s} icon={<Activity size={12} />} text={s} />)}
                                        {profile.hobbies?.map(h => <Tag key={h} icon={<Smile size={12} />} text={h} />)}
                                        <Tag icon={<BookOpen size={12} />} text={profile.favoriteSubject || 'N/A'} label="Fav Subject" />
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : (
                        /* AGENT DETAILS (Compact View) */
                        <div className="space-y-8">
                            {/* Profile Details Tag Cloud */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Agency Profile</h3>
                                <div className="space-y-6">
                                    {/* Target Countries & Recruiting Countries */}
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Target Countries */}
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Target Countries</p>
                                            {isEditing ? (
                                                <CountrySelector
                                                    selected={formData.agencyProfile?.targetCountries || []}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, targetCountries: v }
                                                    }))}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {lead.agencyProfile?.targetCountries && lead.agencyProfile.targetCountries.length > 0 ? (
                                                        lead.agencyProfile.targetCountries.map(c => (
                                                            <span key={c} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-bold border border-blue-100 dark:border-blue-800">{c}</span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not Specified</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Recruiting Countries */}
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Recruiting Countries</p>
                                            {isEditing ? (
                                                <CountrySelector
                                                    selected={formData.agencyProfile?.recruitingCountries || []}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, recruitingCountries: v }
                                                    }))}
                                                />
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {lead.agencyProfile?.recruitingCountries && lead.agencyProfile.recruitingCountries.length > 0 ? (
                                                        lead.agencyProfile.recruitingCountries.map(c => (
                                                            <span key={c} className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-bold border border-emerald-100 dark:border-emerald-800">{c}</span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not Specified</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Grades */}
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Grades Offered</p>
                                            {isEditing ? (
                                                <CheckboxGroup
                                                    options={['Elementary', 'Middle School', 'High School', 'College/University']}
                                                    selected={formData.agencyProfile?.gradesOffered || []}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, gradesOffered: v }
                                                    }))}
                                                />
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {lead.agencyProfile?.gradesOffered && lead.agencyProfile.gradesOffered.length > 0 ? (
                                                        lead.agencyProfile.gradesOffered.map(g => (
                                                            <span key={g} className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" /> {g}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not Specified</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Duration */}
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Duration</p>
                                            {isEditing ? (
                                                <CheckboxGroup
                                                    options={['Short Term', 'Semester', 'Academic Year', 'Calendar Year', 'Summer']}
                                                    selected={formData.agencyProfile?.duration || []}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, duration: v }
                                                    }))}
                                                />
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    {lead.agencyProfile?.duration && lead.agencyProfile.duration.length > 0 ? (
                                                        lead.agencyProfile.duration.map(d => (
                                                            <span key={d} className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400" /> {d}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not Specified</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Agency Details (Commission, Language, Timezone) */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <DetailItem
                                            icon={<Briefcase />}
                                            label="Commission"
                                            value={isEditing ?
                                                <Input value={formData.agencyProfile?.commissionRate || ''} onChange={v => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, commissionRate: v } }))} placeholder="15%" /> :
                                                (lead.agencyProfile?.commissionRate || '-')}
                                        />
                                        <DetailItem
                                            icon={<Languages />}
                                            label="Language"
                                            value={isEditing ?
                                                <Input value={formData.agencyProfile?.language || ''} onChange={v => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, language: v } }))} placeholder="English" /> :
                                                (lead.agencyProfile?.language || '-')}
                                        />
                                        <DetailItem
                                            icon={<Clock />}
                                            label="Timezone"
                                            value={isEditing ?
                                                <Input value={formData.agencyProfile?.timezone || ''} onChange={v => setFormData((p: any) => ({ ...p, agencyProfile: { ...p.agencyProfile, timezone: v } }))} placeholder="EST" /> :
                                                (lead.agencyProfile?.timezone || '-')}
                                        />
                                    </div>

                                    {/* Onboarding Checklist */}
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">Onboarding Checklist</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                            {[
                                                { key: 'agreementSent', label: 'Agreement Sent' },
                                                { key: 'agreementSigned', label: 'Agreement Signed' },
                                                { key: 'applicationAccountCreated', label: 'App Account Created' },
                                                { key: 'schoolPriceListSent', label: 'Price List Sent' },
                                                { key: 'schoolProfilesSent', label: 'Profiles Sent' },
                                                { key: 'addedMarketingList', label: 'Added to Marketing' },
                                                { key: 'agentHandbookSent', label: 'Agent Handbook' },
                                                { key: 'studentHandbookSent', label: 'Student Handbook' },
                                                { key: 'commissionRequestFormSent', label: 'Comm. Form Sent' }
                                            ].map(item => {
                                                // Determine checked state based on mode
                                                const isChecked = isEditing
                                                    ? formData.agencyProfile?.onboardingChecklist?.[item.key] || false
                                                    : lead.agencyProfile?.onboardingChecklist?.[item.key as keyof typeof lead.agencyProfile.onboardingChecklist] || false;

                                                return (
                                                    <div
                                                        key={item.key}
                                                        className="flex items-center gap-2 cursor-pointer group/check"
                                                        onClick={() => {
                                                            if (isEditing) {
                                                                // Edit Mode: Update local formData
                                                                const current = formData.agencyProfile?.onboardingChecklist || {};
                                                                setFormData((prev: any) => ({
                                                                    ...prev,
                                                                    agencyProfile: {
                                                                        ...prev.agencyProfile,
                                                                        onboardingChecklist: {
                                                                            ...current,
                                                                            [item.key]: !isChecked
                                                                        }
                                                                    }
                                                                }));
                                                            } else {
                                                                // View Mode: Update DIRECTLY (Real-time)
                                                                if (!lead.agencyProfile) return;
                                                                const currentList = lead.agencyProfile.onboardingChecklist || ({} as any);
                                                                updateLead(lead.id, {
                                                                    agencyProfile: {
                                                                        ...lead.agencyProfile,
                                                                        onboardingChecklist: {
                                                                            ...currentList,
                                                                            [item.key]: !isChecked
                                                                        }
                                                                    }
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover/check:border-blue-400'}`}>
                                                            {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                                        </div>
                                                        <span className={`text-[10px] font-bold ${isChecked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                                                            {item.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Primary Contact */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Primary Contact</h3>
                                {isEditing ? (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="First Name"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.firstName}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].firstName = v;
                                                    contacts[0].name = `${v} ${contacts[0].lastName || ''}`.trim();
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <Input
                                                label="Last Name"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.lastName}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].lastName = v;
                                                    contacts[0].name = `${contacts[0].firstName || ''} ${v}`.trim();
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <Input
                                                label="Nickname"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.nickname}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].nickname = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <Input
                                                label="Role / Position"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.role}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].role = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <Input
                                                label="Met At"
                                                value={formData.agencyProfile?.metAt || ''}
                                                onChange={v => setFormData((prev: any) => ({ ...prev, agencyProfile: { ...prev.agencyProfile, metAt: v } }))}
                                            />
                                            <Input
                                                label="Email"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.email}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].email = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <PhoneInput
                                                label="Phone"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.phone || ''}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].phone = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                                defaultCountry={lead?.agencyProfile?.country}
                                            />
                                            <PhoneInput
                                                label="WhatsApp"
                                                icon={<MessageCircle size={16} />}
                                                value={formData.agencyProfile?.keyContacts?.[0]?.whatsapp || ''}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].whatsapp = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                                defaultCountry={lead?.agencyProfile?.country}
                                            />
                                            <Input
                                                label="Skype"
                                                value={formData.agencyProfile?.keyContacts?.[0]?.skype}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].skype = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                            <Select
                                                label="Pref. Comm."
                                                options={['Email', 'WhatsApp', 'Phone', 'Skype']}
                                                value={formData.agencyProfile?.keyContacts?.[0]?.preferredCommunication}
                                                onChange={v => {
                                                    const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                    if (!contacts[0]) contacts[0] = {};
                                                    contacts[0].preferredCommunication = v;
                                                    setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <Input
                                            label="Contact Notes"
                                            isTextArea
                                            value={formData.agencyProfile?.keyContacts?.[0]?.notes}
                                            onChange={v => {
                                                const contacts = [...(formData.agencyProfile?.keyContacts || [])];
                                                if (!contacts[0]) contacts[0] = {};
                                                contacts[0].notes = v;
                                                setFormData((prev: any) => ({
                                                    ...prev,
                                                    agencyProfile: { ...prev.agencyProfile, keyContacts: contacts }
                                                }));
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-gray-400 shadow-sm">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white">{lead.agencyProfile?.keyContacts?.[0]?.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{lead.agencyProfile?.keyContacts?.[0]?.role} • {lead.agencyProfile?.keyContacts?.[0]?.email}</div>
                                            {lead.agencyProfile?.keyContacts?.[0]?.nickname && <div className="text-xs text-gray-400">aka {lead.agencyProfile.keyContacts[0].nickname}</div>}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Secondary Contact */}
                            {(isEditing || lead.agencyProfile?.secondaryContact) && (
                                <section>
                                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Secondary Contact</h3>
                                    {isEditing ? (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input
                                                    label="First Name"
                                                    value={formData.agencyProfile?.secondaryContact?.firstName || ''}
                                                    onChange={v => {
                                                        const contact = { ...(formData.agencyProfile?.secondaryContact || {}) };
                                                        contact.firstName = v;
                                                        contact.name = `${v} ${contact.lastName || ''}`.trim();
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            agencyProfile: { ...prev.agencyProfile, secondaryContact: contact }
                                                        }));
                                                    }}
                                                />
                                                <Input
                                                    label="Last Name"
                                                    value={formData.agencyProfile?.secondaryContact?.lastName || ''}
                                                    onChange={v => {
                                                        const contact = { ...(formData.agencyProfile?.secondaryContact || {}) };
                                                        contact.lastName = v;
                                                        contact.name = `${contact.firstName || ''} ${v}`.trim();
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            agencyProfile: { ...prev.agencyProfile, secondaryContact: contact }
                                                        }));
                                                    }}
                                                />
                                                <Input
                                                    label="Role / Position"
                                                    value={formData.agencyProfile?.secondaryContact?.role || ''}
                                                    onChange={v => {
                                                        const contact = { ...(formData.agencyProfile?.secondaryContact || {}) };
                                                        contact.role = v;
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            agencyProfile: { ...prev.agencyProfile, secondaryContact: contact }
                                                        }));
                                                    }}
                                                />
                                                <Input
                                                    label="Email"
                                                    value={formData.agencyProfile?.secondaryContact?.email || ''}
                                                    onChange={v => {
                                                        const contact = { ...(formData.agencyProfile?.secondaryContact || {}) };
                                                        contact.email = v;
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            agencyProfile: { ...prev.agencyProfile, secondaryContact: contact }
                                                        }));
                                                    }}
                                                />
                                                <PhoneInput
                                                    label="Phone"
                                                    value={formData.agencyProfile?.secondaryContact?.phone || ''}
                                                    onChange={v => {
                                                        const contact = { ...(formData.agencyProfile?.secondaryContact || {}) };
                                                        contact.phone = v;
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            agencyProfile: { ...prev.agencyProfile, secondaryContact: contact }
                                                        }));
                                                    }}
                                                    defaultCountry={lead?.agencyProfile?.country}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{lead.agencyProfile?.secondaryContact?.name || 'Unknown Name'}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{lead.agencyProfile?.secondaryContact?.role || 'No Role'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 mt-3">
                                                {lead.agencyProfile?.secondaryContact?.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                        <span className="font-bold text-gray-400 w-12 text-[10px] uppercase">Email</span>
                                                        <a href={`mailto:${lead.agencyProfile.secondaryContact.email}`} className="hover:text-blue-500 hover:underline">{lead.agencyProfile.secondaryContact.email}</a>
                                                    </div>
                                                )}
                                                {lead.agencyProfile?.secondaryContact?.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                                        <span className="font-bold text-gray-400 w-12 text-[10px] uppercase">Phone</span>
                                                        <div className="font-mono">{lead.agencyProfile.secondaryContact.phone}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* General Notes Section (Moved Up) */}
                            <section className="animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1">
                                    General Notes
                                    {(lead.agencyProfile?.generalNotes || lead.agencyProfile?.culturalNotes) && (
                                        <span className="text-red-500 text-lg leading-3" title="Has Notes">*</span>
                                    )}
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <Input
                                                label="General Notes"
                                                isTextArea
                                                value={formData.agencyProfile?.generalNotes}
                                                onChange={v => setFormData((prev: any) => ({
                                                    ...prev,
                                                    agencyProfile: { ...prev.agencyProfile, generalNotes: v }
                                                }))}
                                                placeholder="Enter important general notes about this agency..."
                                            />
                                            <Input
                                                label="Cultural Notes"
                                                isTextArea
                                                value={formData.agencyProfile?.culturalNotes}
                                                onChange={v => setFormData((prev: any) => ({
                                                    ...prev,
                                                    agencyProfile: { ...prev.agencyProfile, culturalNotes: v }
                                                }))}
                                                placeholder="Any cultural nuances or tips..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {lead.agencyProfile?.generalNotes ? (
                                                <div>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">General Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.agencyProfile.generalNotes}</p>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-400 italic">No general notes available.</p>
                                            )}
                                            {lead.agencyProfile?.culturalNotes && (
                                                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mb-1">Cultural Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{lead.agencyProfile.culturalNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Partnership Details */}
                            <section>
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Partnership Details</h3>
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Select
                                                    label="Status"
                                                    options={['Prospective', 'Active', 'Pending', 'Inactive', 'Do Not Contact']}
                                                    value={formData.agencyProfile?.partnershipStatus}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, partnershipStatus: v }
                                                    }))}
                                                />
                                                <Input
                                                    label="Commission Rate"
                                                    value={formData.agencyProfile?.commissionRate}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, commissionRate: v }
                                                    }))}
                                                />
                                                <Input
                                                    label="Contract Signed"
                                                    type="date"
                                                    value={formData.agencyProfile?.contractSignedDate ? new Date(formData.agencyProfile.contractSignedDate).toISOString().split('T')[0] : ''}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, contractSignedDate: new Date(v).toISOString() }
                                                    }))}
                                                />
                                                <Input
                                                    label="Timezone"
                                                    value={formData.agencyProfile?.timezone}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, timezone: v }
                                                    }))}
                                                />
                                                <Input
                                                    label="Language"
                                                    value={formData.agencyProfile?.language}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, language: v }
                                                    }))}
                                                />
                                            </div>
                                            <Input
                                                label="Cultural Notes - DEPRECATED (Moved)"
                                                isTextArea
                                                value={formData.agencyProfile?.culturalNotes}
                                                onChange={v => setFormData((prev: any) => ({
                                                    ...prev,
                                                    agencyProfile: { ...prev.agencyProfile, culturalNotes: v }
                                                }))}
                                                // Hiding this as per request to move General Notes up. Assuming Cultural Notes stays or should also move? 
                                                // User said "General Notes". Let's move both to be safe or just General.
                                                // Actually, let's keep Cultural here if not asked, but User pattern implies "Notes".
                                                // Let's remove them from here and put them in the new section.
                                                className="hidden"
                                            />
                                            <div className="hidden">
                                                <Input
                                                    label="General Notes"
                                                    isTextArea
                                                    value={formData.agencyProfile?.generalNotes}
                                                    onChange={v => setFormData((prev: any) => ({
                                                        ...prev,
                                                        agencyProfile: { ...prev.agencyProfile, generalNotes: v }
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Commission Rate</p>
                                                <p className="text-sm font-bold text-gray-900">{lead.agencyProfile?.commissionRate || 'Standard'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
                                                <p className="text-sm font-bold text-gray-900">{lead.agencyProfile?.partnershipStatus}</p>
                                            </div>
                                            {lead.agencyProfile?.contractSignedDate && (
                                                <div className="col-span-2">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Contract Signed</p>
                                                    <p className="text-sm font-bold text-gray-900">{new Date(lead.agencyProfile.contractSignedDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* View Full Profile Action */}
                            {lead.agencyProfile?.id && (
                                <div className="flex gap-4">
                                    <Link href={`/agencies/${lead.agencyProfile.id}`} className="flex-1">
                                        <button className="w-full py-3 rounded-xl bg-gray-100 font-bold text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                            <Briefcase size={16} /> View Full Profile
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ACTIVITY & SCHEDULING (SHARED, EDITABLE) */}


                </div >
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end gap-3 rounded-b-[32px]">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">Close</button>
                    {isEditing ? (
                        <button onClick={handleSave} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 hover:shadow-lg transition-all flex items-center gap-2">
                            <Save size={18} />
                            Save Changes
                        </button>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:shadow-lg transition-all">Edit Lead</button>
                    )}
                </div>
            </div >
        </div >
    );
};

const DetailItem = ({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }) => (
    <div className={`bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3 min-h-[60px] ${className}`}>
        <div className="text-gray-400 [&>svg]:w-5 [&>svg]:h-5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase truncate">{label}</p>
            <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{value}</div>
        </div>
    </div>
);



const Tag = ({ icon, text, label, color = 'gray' }: { icon?: React.ReactNode, text: string, label?: string, color?: 'gray' | 'red' | 'orange' }) => {
    const colorClasses = {
        gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    };

    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${colorClasses[color]}`}>
            {icon && <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 opacity-70">{icon}</span>}
            {label && <span className="opacity-50">{label}:</span>}
            {text}
        </span>
    );
};
