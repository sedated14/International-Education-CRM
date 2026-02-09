import React from 'react';
import { Lead } from '../types';
import { MapPin, StickyNote, Calendar, Clock, Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { useLeads } from '../context/LeadContext';

interface Props {
    lead: Lead;
}

export const AgentLeadCard: React.FC<Props> = ({ lead }) => {
    if (lead.type !== 'Agent') return null;

    const { updateLead } = useLeads();

    const latestNote = lead.notes && lead.notes.length > 0
        ? lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        : null;

    const defaultChecklist = {
        agreementSent: false,
        agreementSigned: false,
        applicationAccountCreated: false,
        schoolPriceListSent: false,
        schoolProfilesSent: false,
        addedMarketingList: false,
        agentHandbookSent: false,
        studentHandbookSent: false,
        commissionRequestFormSent: false,
        marketingSubscribed: false,
        marketingUnsubscribed: false
    };

    const toggleChecklist = (key: string) => {
        if (!lead.agencyProfile) return;
        const currentList = lead.agencyProfile.onboardingChecklist || defaultChecklist;
        updateLead(lead.id, {
            agencyProfile: {
                ...lead.agencyProfile,
                onboardingChecklist: {
                    ...currentList,
                    [key]: !currentList[key as keyof typeof currentList]
                }
            }
        });
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[24px] border-4 border-blue-500 shadow-sm hover:shadow-md cursor-pointer transition-all group h-full flex flex-col overflow-hidden">
            {/* Header: Name and Type */}
            <div className="bg-white dark:bg-gray-900 p-5 border-b-2 border-blue-500 flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{lead.agentName || lead.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <MapPin size={12} className="shrink-0" />
                        <span className="truncate">
                            {lead.country}
                        </span>
                    </div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 bg-blue-500`}>
                    {lead.country.substring(0, 2).toUpperCase()}
                </div>
            </div>

            <div className="p-5 pt-4 flex-1 flex flex-col">


                {/* Latest Note Snippet */}
                {latestNote ? (
                    <div className="mb-4 bg-white dark:bg-gray-800/50 p-3 rounded-xl border-2 border-yellow-500 min-h-[60px] flex flex-col justify-between">
                        <div className="flex gap-2 items-start mb-1">
                            <StickyNote size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-600 dark:text-gray-300 font-medium line-clamp-2 leading-snug italic">
                                "{latestNote.content}"
                            </p>
                        </div>
                        <div className="text-[9px] text-yellow-600/60 dark:text-yellow-500/60 font-bold text-right">
                            {new Date(latestNote.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 bg-white dark:bg-gray-800/50 p-3 rounded-xl border-2 border-yellow-500 flex items-center justify-center min-h-[60px]">
                        <div className="flex items-center gap-1.5 opacity-50">
                            <Edit2 size={12} className="text-gray-400" />
                            <span className="text-[10px] text-gray-400 font-medium italic">No notes yet</span>
                        </div>
                    </div>
                )}

                {lead.agencyProfile && (
                    <div className="mb-4 bg-white dark:bg-gray-800/50 p-3 rounded-xl border-2 border-blue-500">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Onboarding (Next Steps)</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 bg-gray-50 dark:bg-gray-800/80 p-2 rounded-lg">
                            {(() => {
                                const checklistOrder = [
                                    { key: 'agreementSent', label: 'Agreement Sent' },
                                    { key: 'agreementSigned', label: 'Agreement Signed' },
                                    { key: 'applicationAccountCreated', label: 'App Account Created' },
                                    { key: 'schoolPriceListSent', label: 'Price List Sent' },
                                    { key: 'schoolProfilesSent', label: 'Profiles Sent' },
                                    { key: 'addedMarketingList', label: 'Added to Marketing' },
                                    { key: 'agentHandbookSent', label: 'Agent Handbook' },
                                    { key: 'studentHandbookSent', label: 'Student Handbook' },
                                    { key: 'commissionRequestFormSent', label: 'Comm. Form Sent' }
                                ];

                                return checklistOrder.map(item => {
                                    const isChecked = lead.agencyProfile!.onboardingChecklist?.[item.key as keyof typeof lead.agencyProfile.onboardingChecklist] || false;
                                    const isMarketingParent = item.key === 'addedMarketingList';

                                    return (
                                        <React.Fragment key={item.key}>
                                            <div
                                                className="flex items-center gap-2 cursor-pointer group/check"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleChecklist(item.key);
                                                }}
                                            >
                                                <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover/check:border-blue-400'}`}>
                                                    {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                                                </div>
                                                <span className={`text-[9px] font-bold transition-colors ${isChecked ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500 group-hover/check:text-blue-500'}`}>
                                                    {item.label}
                                                </span>
                                            </div>

                                            {/* Marketing Sub-Section - Exclusive Selection */}
                                            {isMarketingParent && isChecked && (
                                                <div className="pl-5 grid grid-cols-1 gap-1 mt-1 mb-1 animate-in fade-in slide-in-from-top-1">
                                                    {[
                                                        { key: 'marketingSubscribed', label: 'Subscribed', type: 'positive' },
                                                        { key: 'marketingUnsubscribed', label: 'Unsubscribed', type: 'negative' }
                                                    ].map(subItem => {
                                                        const isSubChecked = lead.agencyProfile!.onboardingChecklist?.[subItem.key as keyof typeof lead.agencyProfile.onboardingChecklist] || false;

                                                        return (
                                                            <div
                                                                key={subItem.key}
                                                                className="flex items-center gap-2 cursor-pointer group/subcheck"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Exclusive Toggle Logic
                                                                    const currentList = lead.agencyProfile?.onboardingChecklist || {};
                                                                    const isCurrentlyChecked = currentList[subItem.key as keyof typeof currentList];

                                                                    const updatePayload: any = {
                                                                        [subItem.key]: !isCurrentlyChecked
                                                                    };

                                                                    // If we are selecting this one (it was false), deselect the others
                                                                    if (!isCurrentlyChecked) {
                                                                        if (subItem.key === 'marketingSubscribed') updatePayload['marketingUnsubscribed'] = false;
                                                                        if (subItem.key === 'marketingUnsubscribed') updatePayload['marketingSubscribed'] = false;
                                                                    }

                                                                    updateLead(lead.id, {
                                                                        agencyProfile: {
                                                                            ...lead.agencyProfile!,
                                                                            onboardingChecklist: { ...currentList, ...updatePayload }
                                                                        }
                                                                    });
                                                                }}
                                                            >
                                                                <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${isSubChecked
                                                                    ? (subItem.type === 'negative' ? 'bg-red-100 border-red-500' : 'bg-emerald-100 border-emerald-500')
                                                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 group-hover/subcheck:border-gray-400'
                                                                    }`}>
                                                                    {isSubChecked && (
                                                                        subItem.type === 'negative'
                                                                            ? <X size={8} className="text-red-500 stroke-[4]" />
                                                                            : <div className="w-1.5 h-1.5 bg-emerald-600 rounded-sm" />
                                                                    )}
                                                                </div>
                                                                <span className={`text-[9px] font-bold ${isSubChecked
                                                                    ? (subItem.type === 'negative' ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-300')
                                                                    : 'text-gray-400'
                                                                    }`}>
                                                                    {subItem.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {/* Spacer to push Date Tracking to bottom */}
                <div className="flex-1" />

                {/* Date Tracking (Same as existing style) */}
                <div className="pt-3 border-t border-gray-50 dark:border-gray-800 grid grid-cols-1 gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Received</span>
                        <span className="font-bold text-gray-500 dark:text-gray-400">{new Date(lead.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Contact</span>
                        <span className={`font-bold ${lead.lastContacted ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {lead.lastContacted ? new Date(lead.lastContacted).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' }) : 'Never'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 -mx-2 px-2 py-1 rounded-lg mt-1">
                        <span className="font-bold uppercase tracking-wider opacity-70 dark:text-blue-300">Follow Up</span>
                        <span className="font-bold dark:text-blue-200">
                            {lead.followUpDate
                                ? new Date(lead.followUpDate).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })
                                : 'Auto (72h)'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
