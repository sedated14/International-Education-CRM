"use client";

import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, writeBatch, addDoc, getDoc } from 'firebase/firestore'; // Added getDoc
import { db } from '@/lib/firebase';
import { useLeads } from '@/context/LeadContext';
import { AlertCircle, Check, X, ArrowRight, User, Trash2, RefreshCw, Database, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';

interface DuplicateItem {
    id: string;
    duplicateReason: string;
    importedAt: string;
    agentName: string;
    country: string;
    agencyProfile: any;
    existingLeadId?: string; // New field
    [key: string]: any;
}

export default function DuplicateReviewPage() {
    const router = useRouter();
    const { leads, updateLead } = useLeads();
    const [duplicates, setDuplicates] = useState<DuplicateItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'conflicts' | 'colleagues'>('conflicts');

    // Fetch Duplicates
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'import_duplicates'), (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DuplicateItem));
            setDuplicates(data);
        });
        return () => unsubscribe();
    }, []);

    // Filter Logic
    const filteredDuplicates = duplicates.filter(d => {
        const isColleague = d.duplicateReason === 'Potential Colleague';
        return activeTab === 'colleagues' ? isColleague : !isColleague;
    });

    const conflictsCount = duplicates.filter(d => d.duplicateReason !== 'Potential Colleague').length;
    const colleaguesCount = duplicates.filter(d => d.duplicateReason === 'Potential Colleague').length;

    const selectedDuplicate = duplicates.find(d => d.id === selectedId);

    // Find the existing lead that matches the duplicate
    const existingMatch = selectedDuplicate ? leads.find(l => {
        if (selectedDuplicate.existingLeadId) {
            return String(l.id) === selectedDuplicate.existingLeadId;
        }

        // Email Match (Generic Conflict)
        const importEmails = [
            ...(selectedDuplicate.agencyProfile.keyContacts?.map((c: any) => c.email?.toLowerCase()) || []),
            selectedDuplicate.agencyProfile.secondaryContact?.email?.toLowerCase()
        ].filter(Boolean);

        if (l.type === 'Agent' && l.agencyProfile) {
            // 1. Check Emails
            const leadEmails = [
                ...(l.agencyProfile.keyContacts?.map(c => c.email?.toLowerCase()) || []),
                l.agencyProfile.secondaryContact?.email?.toLowerCase()
            ].filter(Boolean);

            if (importEmails.some(e => leadEmails.includes(e))) return true;

            // 2. Check Name Match (Fuzzy)
            if (l.agentName?.toLowerCase().trim() === selectedDuplicate.agentName?.toLowerCase().trim()) return true;

            // 3. Check Website Domain Match
            const cleanDomain = (url: string) => url?.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase();
            const importDomain = cleanDomain(selectedDuplicate.agencyProfile.website || '');
            const leadDomain = cleanDomain(l.agencyProfile.website || '');

            if (importDomain && leadDomain && importDomain === leadDomain) return true;
        }
        return false;
    }) : null;

    const handleDiscard = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'import_duplicates', id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Error discarding duplicate:", e);
        }
    };

    const handleOverwrite = async (duplicate: DuplicateItem, existingId: string) => {
        if (!confirm("Are you sure? This will thoroughly overwrite the existing lead with the imported data.")) return;

        try {
            const { id, duplicateReason, importedAt, source, createdAt, existingLeadId, ...updateData } = duplicate;

            await updateLead(existingId, {
                ...updateData,
                source: 'CSV (Overwrite)' as any,
            });

            await deleteDoc(doc(db, 'import_duplicates', duplicate.id));
            setSelectedId(null);
        } catch (e) {
            console.error("Error overwriting:", e);
        }
    };

    const handleReplaceContact = async (duplicate: DuplicateItem, existingId: string) => {
        if (!existingMatch) return;
        if (!confirm("Are you sure you want to REPLACE the current primary contact with this new one? The old contact details will be overwritten.")) return;

        try {
            const newPrimary = duplicate.agencyProfile.keyContacts[0];
            const currentContacts = existingMatch.agencyProfile?.keyContacts || [];

            // Replace index 0, keep others
            const updatedContacts = [newPrimary, ...currentContacts.slice(1)];

            await updateLead(existingId, {
                agencyProfile: {
                    ...existingMatch.agencyProfile,
                    keyContacts: updatedContacts
                } as any
            });

            await deleteDoc(doc(db, 'import_duplicates', duplicate.id));
            setSelectedId(null);
        } catch (e) {
            console.error("Error replacing contact:", e);
        }
    };

    const handleMergeContact = async (duplicate: DuplicateItem, existingId: string) => {
        if (!existingMatch) return;

        try {
            const importedContact = duplicate.agencyProfile.keyContacts[0];
            const currentPrimary = existingMatch.agencyProfile?.keyContacts?.[0] || {};
            const otherContacts = existingMatch.agencyProfile?.keyContacts?.slice(1) || [];

            // Merge logic: Imported fields overwrite existing ONLY if imported has value
            // Actually, usually "Merge" implies "Update with new info". 
            // Let's merge: start with existing, overwrite with ANY non-empty imported field.

            const mergedContact = { ...currentPrimary };
            Object.keys(importedContact).forEach(key => {
                const val = importedContact[key];
                if (val && typeof val === 'string' && val.trim() !== '') {
                    mergedContact[key] = val;
                }
            });

            const updatedContacts = [mergedContact, ...otherContacts];

            await updateLead(existingId, {
                agencyProfile: {
                    ...existingMatch.agencyProfile,
                    keyContacts: updatedContacts
                } as any
            });

            await deleteDoc(doc(db, 'import_duplicates', duplicate.id));
            setSelectedId(null);
        } catch (e) {
            console.error("Error merging contact:", e);
        }
    };

    const handleAddColleague = async (duplicate: DuplicateItem, existingId: string) => {
        if (!existingMatch) return;

        // Current Contacts
        const currentContacts = existingMatch.agencyProfile?.keyContacts || [];
        const existingEmails = new Set(currentContacts.map((c: any) => c.email?.toLowerCase()).filter(Boolean));
        if (existingMatch.agencyProfile?.secondaryContact?.email) {
            existingEmails.add(existingMatch.agencyProfile.secondaryContact.email.toLowerCase());
        }

        // New Contacts from the Duplicate Item (could be 1 or more due to Grouping)
        const newContacts = duplicate.agencyProfile.keyContacts || [];

        // Filter out existing
        const uniqueNewContacts = newContacts.filter((c: any) => {
            if (!c.email) return true; // Always add contact if no email? Or assume unique? Let's add.
            return !existingEmails.has(c.email.toLowerCase());
        });

        if (uniqueNewContacts.length === 0) {
            alert("All contacts in this import already exist in the selected agency.");
            // Optional: Ask if they want to discard the duplicate now?
            // For now, let's just return. User can Discard manually.
            return;
        }

        // Update
        try {
            await updateLead(existingId, {
                agencyProfile: {
                    ...existingMatch.agencyProfile,
                    keyContacts: [...currentContacts, ...uniqueNewContacts]
                } as any
            });

            await deleteDoc(doc(db, 'import_duplicates', duplicate.id));
            setSelectedId(null);
        } catch (e) {
            console.error("Error adding colleague:", e);
        }
    };

    const handleCreateNew = async (duplicate: DuplicateItem) => {
        const { id, duplicateReason, importedAt, existingLeadId, ...leadData } = duplicate;

        try {
            await addDoc(collection(db, 'leads'), {
                ...leadData,
                createdAt: new Date().toISOString()
            });
            await deleteDoc(doc(db, 'import_duplicates', id));
            setSelectedId(null);
        } catch (e) {
            console.error("Error creating new:", e);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {/* 0. MAIN NAVIGATION */}
            <Navigation />

            {/* Sidebar List */}
            <div className="w-1/3 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-10 shadow-xl">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Duplicate Review</h1>

                    {/* TABS */}
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                        <button
                            onClick={() => { setActiveTab('conflicts'); setSelectedId(null); }}
                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'conflicts' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Conflicts
                            {conflictsCount > 0 && <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px]">{conflictsCount}</span>}
                        </button>
                        <button
                            onClick={() => { setActiveTab('colleagues'); setSelectedId(null); }}
                            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'colleagues' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Colleagues
                            {colleaguesCount > 0 && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-[10px]">{colleaguesCount}</span>}
                        </button>
                    </div>

                    <p className="text-gray-400 dark:text-gray-500 font-medium text-xs uppercase tracking-wider pl-1">
                        {filteredDuplicates.length} {activeTab === 'colleagues' ? 'Colleagues' : 'Conflicts'} Found
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredDuplicates.length === 0 && (
                        <div className="text-center p-10 text-gray-400 dark:text-gray-600">
                            <Check className="mx-auto mb-2 text-green-400 dark:text-green-600" size={32} />
                            <p>No {activeTab} found.</p>
                        </div>
                    )}
                    {filteredDuplicates.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setSelectedId(d.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all group ${selectedId === d.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold text-xs px-2 py-0.5 rounded-md ${d.duplicateReason === 'Potential Colleague' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300' :
                                    d.duplicateReason.includes('Primary') ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300'
                                    }`}>
                                    {d.duplicateReason}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(d.importedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{d.agentName}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{d.agencyProfile?.keyContacts?.[0]?.email}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Comparison View */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950 p-8 flex flex-col items-center">
                {selectedDuplicate ? (
                    <div className="w-full max-w-4xl space-y-6">
                        {/* Header Actions */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                                    {selectedDuplicate.duplicateReason === 'Potential Colleague' ? 'New Contact Found' : 'Conflict Resolution'}
                                </h2>
                                <p className="text-gray-400 dark:text-gray-500 text-sm">
                                    {selectedDuplicate.duplicateReason === 'Potential Colleague'
                                        ? 'This looks like a new contact for an existing agency.'
                                        : 'Compare imported data with existing records'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDiscard(selectedDuplicate.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} /> Discard
                                </button>
                                {true && ( // Always show Keep Both option
                                    <button
                                        onClick={() => handleCreateNew(selectedDuplicate)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                                    >
                                        <RefreshCw size={18} /> Keep Both (Create New)
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Comparison Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

                            {/* Comparison Header */}
                            <div className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50">
                                <div className="p-4 border-r border-gray-100 dark:border-gray-800 flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">
                                    <Database size={14} /> Existing Record
                                </div>
                                <div className="p-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest bg-blue-50/50 dark:bg-blue-900/20">
                                    {selectedDuplicate.duplicateReason === 'Potential Colleague' ? <Users size={14} /> : <AlertCircle size={14} />}
                                    {selectedDuplicate.duplicateReason === 'Potential Colleague' ? 'Proposed Colleague' : 'Imported Data'}
                                </div>
                            </div>

                            {/* Comparison Fields Used logic */}
                            {existingMatch ? (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {/* Helper to render a row */}
                                    {[
                                        { label: 'Agency Name', existing: existingMatch.agentName, imported: selectedDuplicate.agentName },
                                        { label: 'Website', existing: existingMatch.agencyProfile?.website, imported: selectedDuplicate.agencyProfile?.website },
                                        { label: 'Location', existing: [existingMatch.agencyProfile?.city, existingMatch.country].filter(Boolean).join(', '), imported: [selectedDuplicate.agencyProfile?.city, selectedDuplicate.country].filter(Boolean).join(', ') },
                                        { label: 'Address', existing: existingMatch.agencyProfile?.address, imported: selectedDuplicate.agencyProfile?.address },
                                        // Primary Contact
                                        { section: 'Primary Contact' },
                                        { label: 'Name', existing: existingMatch.agencyProfile?.keyContacts?.[0]?.name, imported: selectedDuplicate.agencyProfile?.keyContacts?.[0]?.name },
                                        { label: 'Email', existing: existingMatch.agencyProfile?.keyContacts?.[0]?.email, imported: selectedDuplicate.agencyProfile?.keyContacts?.[0]?.email },
                                        { label: 'Role', existing: existingMatch.agencyProfile?.keyContacts?.[0]?.role, imported: selectedDuplicate.agencyProfile?.keyContacts?.[0]?.role },
                                        { label: 'Phone', existing: existingMatch.agencyProfile?.keyContacts?.[0]?.phone, imported: selectedDuplicate.agencyProfile?.keyContacts?.[0]?.phone },
                                    ].map((field, i) => {
                                        if (field.section) {
                                            return (
                                                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 px-8 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                    {field.section}
                                                </div>
                                            );
                                        }

                                        const isDifferent = String(field.existing || '') !== String(field.imported || '');
                                        const highlight = isDifferent && field.imported;

                                        return (
                                            <div key={i} className="grid grid-cols-2 group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className="p-4 px-8 border-r border-gray-100 dark:border-gray-800">
                                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-0.5">{field.label}</div>
                                                    <div className={`text-sm ${!field.existing ? 'text-gray-300 dark:text-gray-600 italic' : 'text-gray-700 dark:text-gray-300 font-medium'}`}>
                                                        {field.existing || 'Empty'}
                                                    </div>
                                                </div>
                                                <div className={`p-4 px-8 relative ${highlight ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                                    <div className="text-[10px] font-bold text-blue-200 dark:text-blue-800 uppercase mb-0.5">{field.label}</div>
                                                    <div className={`text-sm ${!field.imported ? 'text-gray-300 dark:text-gray-600 italic' : 'text-gray-900 dark:text-white font-bold'}`}>
                                                        {field.imported || 'Empty'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Action Footer integrated into the card if desired, or kept outside. Keeping outside for now but cleaner. 
                                        Actually, user asked for side-by-side. 
                                        I'll put the action button row at the bottom of the card.
                                    */}
                                    <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            onClick={() => handleDiscard(selectedDuplicate.id)}
                                            className="px-4 py-2 text-red-500 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                                        >
                                            Discard Record
                                        </button>

                                        {selectedDuplicate.duplicateReason === 'Potential Colleague' ? (
                                            <>
                                                <button
                                                    onClick={() => existingMatch && handleAddColleague(selectedDuplicate, String(existingMatch.id))}
                                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all text-xs"
                                                >
                                                    <Plus size={16} /> Add Secondary
                                                </button>
                                                <button
                                                    onClick={() => existingMatch && handleMergeContact(selectedDuplicate, String(existingMatch.id))}
                                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-md transition-all text-xs"
                                                    title="Merge imported details into current primary contact"
                                                >
                                                    <RefreshCw size={16} /> Merge Info
                                                </button>
                                                <button
                                                    onClick={() => existingMatch && handleReplaceContact(selectedDuplicate, String(existingMatch.id))}
                                                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-700 shadow-md transition-all text-xs"
                                                    title="Replace current primary contact with this one"
                                                >
                                                    <User size={16} /> Replace Contact
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleCreateNew(selectedDuplicate)}
                                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 font-bold hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 border border-transparent rounded-lg transition-colors text-sm"
                                                >
                                                    <RefreshCw size={16} /> Keep Both
                                                </button>
                                                <button
                                                    onClick={() => existingMatch && handleOverwrite(selectedDuplicate, String(existingMatch.id))}
                                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all text-sm"
                                                >
                                                    Overwrite <ArrowRight size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 italic">
                                    Original record not found. It may have been deleted.
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleCreateNew(selectedDuplicate)}
                                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold"
                                        >
                                            Create as New Lead
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 dark:text-gray-700">
                        <User size={64} className="mb-4 text-gray-200 dark:text-gray-800" />
                        <p className="font-bold text-lg">Select a record to review</p>
                    </div>
                )}
            </div>
        </div>
    );
}
