"use client";
import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { Navigation } from '../components/Navigation';
import { LeadColumn } from '../components/LeadColumn';
import { StudentLeadCard } from '../components/StudentLeadCard';
import { AgentLeadCard } from '../components/AgentLeadCard';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { NewLeadMenu } from '../components/NewLeadMenu';
import { Lead } from '../types';
import { Briefcase, GraduationCap, AlertCircle, Clock } from 'lucide-react';

export default function ApexCRM() {

  // Use Global State
  const { leads, updateLead } = useLeads();

  // Filter out archived (Lost) leads from the dashboard


  const [selectedLeadId, setSelectedLeadId] = useState<string | number | null>(null);
  const selectedLead = leads.find(l => l.id === selectedLeadId) || null; // Allow selecting any lead even if archived? Or just active? Let's keep detail lookup on all leads.

  // Helper to format date
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans selection:bg-orange-100">

      {/* 1. NAVIGATION */}
      <Navigation />

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLeadId(null)} />

      {/* 2. MAIN DASHBOARD AREA */}
      <main className="flex-1 p-6 h-screen flex flex-col">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 px-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Welcome back, Sean</p>
          </div>
          <div className="flex gap-4">
            <NewLeadMenu onOpenManual={() => alert("Manual Entry Form coming next!")} />
          </div>
        </header>

        {/* 4-COLUMN GRID */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 min-h-0 pb-2 overflow-y-auto">

          {/* COLUMN 1: STUDENT LEADS (Inquiry ONLY) */}
          <LeadColumn title="Student Leads" icon={<GraduationCap size={20} />}>
            {leads
              .filter(l => l.status !== 'Lost' && l.type === 'Student' && l.status === 'Inquiry')
              .map(lead => (
                <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                  <StudentLeadCard lead={lead} />
                </div>
              ))}
          </LeadColumn>

          {/* COLUMN 2: AGENT LEADS (Prospective ONLY) */}
          <LeadColumn title="Agent Leads" icon={<Briefcase size={20} />}>
            {leads
              .filter(l => l.status !== 'Lost' && l.type === 'Agent' && l.agencyProfile?.partnershipStatus === 'Prospective')
              .map(lead => (
                <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                  <AgentLeadCard lead={lead} />
                </div>
              ))}
          </LeadColumn>

          {/* COLUMN 3: FOLLOW UP (Contacted Students OR Pending Agents - FUTURE DATES) */}
          <LeadColumn title="Follow Up" icon={<Clock size={20} />}>
            {[...leads]
              .filter(lead => {
                if (lead.status === 'Lost') return false;

                // Logic: Must be (Student + Contacted) OR (Agent + Pending)
                const isRelevantStudent = lead.type === 'Student' && lead.status === 'Contacted';
                const isRelevantAgent = lead.type === 'Agent' && lead.agencyProfile?.partnershipStatus === 'Pending';
                if (!isRelevantStudent && !isRelevantAgent) return false;

                // Date Logic: Must be in FUTURE
                const dueDate = lead.followUpDate ? new Date(lead.followUpDate) : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000));
                return dueDate >= new Date();
              })
              .sort((a, b) => {
                const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : new Date(a.createdAt).getTime() + (72 * 60 * 60 * 1000);
                const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : new Date(b.createdAt).getTime() + (72 * 60 * 60 * 1000);
                return dateA - dateB; // Soonest first
              })
              .map(lead => {
                // Smart Checklist Logic for Agent Leads
                let visibleChecklist = null;
                if (lead.type === 'Agent' && lead.agencyProfile) {
                  const checklistItems = [
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

                  const checklist = lead.agencyProfile.onboardingChecklist || {};
                  // @ts-ignore
                  const lastCheckedIndex = checklistItems.findLastIndex(item => checklist[item.key]);

                  let startIndex = lastCheckedIndex === -1 ? 0 : lastCheckedIndex;
                  if (startIndex > checklistItems.length - 3) startIndex = Math.max(0, checklistItems.length - 3);
                  visibleChecklist = checklistItems.slice(startIndex, startIndex + 3);
                }

                return (
                  <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`bg-white dark:bg-gray-900 p-4 rounded-[20px] border-4 shadow-sm hover:shadow-md cursor-pointer transition-all group mb-2 ${lead.type === 'Student' ? 'border-emerald-500 hover:border-emerald-600' : 'border-blue-500 hover:border-blue-600'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${lead.type === 'Student' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                        {lead.type === 'Student' ? lead.status : 'Pending'}
                      </span>
                      <span className={`text-[10px] font-bold ${lead.type === 'Student' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-500 dark:text-blue-400'}`}>
                        {lead.followUpDate
                          ? new Date(lead.followUpDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })
                          : 'Auto Due'
                        }
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{lead.type === 'Student' ? lead.studentName : lead.agentName}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-1">{lead.title}</p>

                    {/* Note Snippet (Always Visible) */}
                    <div className={`mb-3 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg border min-h-[50px] flex flex-col justify-between ${lead.notes && lead.notes.length > 0 ? 'border-yellow-500/50' : 'border-gray-100 dark:border-gray-800 items-center justify-center'}`}>
                      {lead.notes && lead.notes.length > 0 ? (
                        <>
                          <p className="text-[9px] text-gray-600 dark:text-gray-300 font-medium line-clamp-2 leading-snug italic w-full text-left">
                            "{lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].content}"
                          </p>
                          <div className="text-[8px] text-yellow-600/60 dark:text-yellow-500/60 font-bold text-right w-full mt-1">
                            {new Date(lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-gray-400 font-medium italic">No notes yet</span>
                      )}
                    </div>

                    {visibleChecklist && lead.type === 'Agent' ? (
                      <div className="flex flex-col gap-1.5 mt-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                        {visibleChecklist.map((item) => {
                          // @ts-ignore
                          const isChecked = lead.agencyProfile?.onboardingChecklist?.[item.key] || false;
                          return (
                            <div
                              key={item.key}
                              className="flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
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
                              }}
                            >
                              <div className={`w-3 h-3 rounded border flex items-center justify-center ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 dark:border-gray-600'}`}>
                                {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                              </div>
                              <span className={`text-[10px] font-bold ${isChecked ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400'}`}>{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <button className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${lead.type === 'Student' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'}`}>
                        Mark Complete
                      </button>
                    )}
                  </div>
                )
              })}
          </LeadColumn>

          {/* COLUMN 4: PAST DUE (Contacted Students OR Pending Agents - PAST DATES) */}
          <LeadColumn title="Past Due" icon={<AlertCircle size={20} />}>
            {[...leads]
              .filter(lead => {
                if (lead.status === 'Lost') return false;

                // Logic: Must be (Student + Contacted) OR (Agent + Pending)
                const isRelevantStudent = lead.type === 'Student' && lead.status === 'Contacted';
                const isRelevantAgent = lead.type === 'Agent' && lead.agencyProfile?.partnershipStatus === 'Pending';
                if (!isRelevantStudent && !isRelevantAgent) return false;

                // Date Logic: Must be in PAST
                const dueDate = lead.followUpDate ? new Date(lead.followUpDate) : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000));
                return dueDate < new Date();
              })
              .sort((a, b) => {
                const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : new Date(a.createdAt).getTime() + (72 * 60 * 60 * 1000);
                const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : new Date(b.createdAt).getTime() + (72 * 60 * 60 * 1000);
                return dateA - dateB; // Oldest first (most overdue)
              })
              .map(lead => (
                <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`bg-white dark:bg-gray-900 p-4 rounded-[20px] border-4 shadow-sm hover:shadow-md cursor-pointer transition-all group mb-2 ${lead.type === 'Student' ? 'border-emerald-500 hover:border-emerald-600' : 'border-blue-500 hover:border-blue-600'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${lead.type === 'Student' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                      {lead.type === 'Student' ? lead.status : 'Pending'}
                    </span>
                    <span className="text-[10px] font-bold text-red-500 dark:text-red-400">
                      {lead.followUpDate
                        ? new Date(lead.followUpDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })
                        : 'Overdue (72h)'
                      }
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{lead.type === 'Student' ? lead.studentName : lead.agentName}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-1">{lead.title}</p>

                  {/* Note Snippet (Always Visible) */}
                  <div className={`mb-3 bg-gray-50 dark:bg-gray-800/30 p-2 rounded-lg border min-h-[50px] flex flex-col justify-between ${lead.notes && lead.notes.length > 0 ? 'border-yellow-500/50' : 'border-gray-100 dark:border-gray-800 items-center justify-center'}`}>
                    {lead.notes && lead.notes.length > 0 ? (
                      <>
                        <p className="text-[9px] text-gray-600 dark:text-gray-300 font-medium line-clamp-2 leading-snug italic w-full text-left">
                          "{lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].content}"
                        </p>
                        <div className="text-[8px] text-yellow-600/60 dark:text-yellow-500/60 font-bold text-right w-full mt-1">
                          {new Date(lead.notes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </>
                    ) : (
                      <span className="text-[9px] text-gray-400 font-medium italic">No notes yet</span>
                    )}
                  </div>

                  <button className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors">
                    Reschedule
                  </button>
                </div>
              ))}
          </LeadColumn>

        </div>

      </main>
    </div>
  );
}