import React from 'react';
import { Lead } from '../types';
import { Globe, MapPin, StickyNote, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

interface Props {
    lead: Lead;
}

export const AgentLeadCard: React.FC<Props> = ({ lead }) => {
    if (lead.type !== 'Agent') return null;

    const latestNote = lead.notes && lead.notes.length > 0
        ? lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
        : null;

    return (
        <div className="bg-white rounded-[24px] border-2 border-blue-600 shadow-sm hover:shadow-md cursor-pointer transition-all group h-full flex flex-col overflow-hidden">
            {/* Header: Name and Type */}
            <div className="bg-blue-50/80 p-5 border-b border-blue-100 flex justify-between items-start">
                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">{lead.agentName || lead.title}</h3>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 bg-blue-500`}>
                    {lead.country.substring(0, 2).toUpperCase()}
                </div>
            </div>

            <div className="p-5 pt-4 flex-1 flex flex-col">
                {/* Company Info Snippets */}
                <div className="space-y-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                    {/* Website */}
                    {lead.agencyProfile?.website && (
                        <div className="flex items-center gap-2 group/link">
                            <Globe size={12} className="text-gray-400 group-hover/link:text-blue-500" />
                            <a
                                href={lead.agencyProfile.website.startsWith('http') ? lead.agencyProfile.website : `https://${lead.agencyProfile.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-gray-500 hover:text-blue-600 truncate hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {lead.agencyProfile.website.replace(/^https?:\/\//, '')}
                            </a>
                        </div>
                    )}
                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 truncate">
                            {lead.agencyProfile?.city ? `${lead.agencyProfile.city}, ` : ''}{lead.country}
                        </span>
                    </div>
                </div>

                {/* Latest Note Snippet */}
                {latestNote ? (
                    <div className="mb-4 bg-yellow-50 p-3 rounded-xl border border-yellow-100 min-h-[60px] flex flex-col justify-between">
                        <div className="flex gap-2 items-start mb-1">
                            <StickyNote size={12} className="text-yellow-500 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-gray-600 font-medium line-clamp-2 leading-snug italic">
                                "{latestNote.content}"
                            </p>
                        </div>
                        <div className="text-[9px] text-yellow-600/60 font-bold text-right">
                            {new Date(latestNote.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                ) : (
                    <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-center min-h-[60px]">
                        <span className="text-[10px] text-gray-400 font-medium italic">No notes yet</span>
                    </div>
                )}

                {/* Spacer to push Date Tracking to bottom */}
                <div className="flex-1" />

                {/* Date Tracking (Same as existing style) */}
                <div className="pt-3 border-t border-gray-50 grid grid-cols-1 gap-1">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Received</span>
                        <span className="font-bold text-gray-500">{new Date(lead.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-400 font-bold uppercase tracking-wider">Contact</span>
                        <span className={`font-bold ${lead.lastContacted ? 'text-gray-500' : 'text-gray-300'}`}>
                            {lead.lastContacted ? new Date(lead.lastContacted).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric' }) : 'Never'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-blue-600 bg-blue-50 -mx-2 px-2 py-1 rounded-lg mt-1">
                        <span className="font-bold uppercase tracking-wider opacity-70">Follow Up</span>
                        <span className="font-bold">
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
