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
  const { leads } = useLeads();

  // Filter out archived (Lost) leads from the dashboard
  const activeLeads = leads.filter(l => l.status !== 'Lost');

  const studentLeads = activeLeads.filter(l => l.type === 'Student');
  // Only show Prospective agents on the Dashboard
  const agentLeads = activeLeads.filter(l => l.type === 'Agent' && l.agencyProfile?.partnershipStatus === 'Prospective');

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
    <div className="flex h-screen bg-[#F0F2F5] text-[#1D1D1F] overflow-hidden font-sans selection:bg-orange-100">

      {/* 1. NAVIGATION */}
      <Navigation />

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLeadId(null)} />

      {/* 2. MAIN DASHBOARD AREA */}
      <main className="flex-1 p-6 h-screen flex flex-col">

        {/* HEADER */}
        <header className="flex justify-between items-center mb-8 px-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 font-medium text-sm">Welcome back, Sean</p>
          </div>
          <div className="flex gap-4">
            <NewLeadMenu onOpenManual={() => alert("Manual Entry Form coming next!")} />
          </div>
        </header>

        {/* 4-COLUMN GRID */}
        <div className="flex-1 grid grid-cols-4 gap-6 min-h-0 pb-2">

          {/* COLUMN 1: STUDENT LEADS */}
          <LeadColumn title="Student Leads" icon={<GraduationCap size={20} />}>
            {studentLeads.map(lead => (
              <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                <StudentLeadCard lead={lead} />
              </div>
            ))}
          </LeadColumn>

          {/* COLUMN 2: AGENT LEADS */}
          <LeadColumn title="Agent Leads" icon={<Briefcase size={20} />}>
            {agentLeads.map(lead => (
              <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)}>
                <AgentLeadCard lead={lead} />
              </div>
            ))}
          </LeadColumn>

          {/* COLUMN 3: FOLLOW UP (Future) */}
          <LeadColumn title="Follow Up" icon={<Clock size={20} />}>
            {[...activeLeads]
              .filter(lead => {
                const dueDate = lead.followUpDate ? new Date(lead.followUpDate) : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000));
                return dueDate >= new Date();
              })
              .sort((a, b) => {
                const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : new Date(a.createdAt).getTime() + (72 * 60 * 60 * 1000);
                const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : new Date(b.createdAt).getTime() + (72 * 60 * 60 * 1000);
                return dateA - dateB; // Soonest first
              })
              .map(lead => (
                <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`bg-white p-4 rounded-[20px] border-2 shadow-sm hover:shadow-md cursor-pointer transition-all group mb-2 ${lead.type === 'Student' ? 'border-yellow-500 hover:border-yellow-600' : 'border-blue-500 hover:border-blue-600'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${lead.type === 'Student' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>{lead.type}</span>
                    <span className={`text-[10px] font-bold ${lead.type === 'Student' ? 'text-yellow-600' : 'text-blue-500'}`}>
                      {lead.followUpDate
                        ? new Date(lead.followUpDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })
                        : 'Auto Due'
                      }
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{lead.type === 'Student' ? lead.studentName : lead.agentName}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-1">{lead.title}</p>

                  <button className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${lead.type === 'Student' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
                    Mark Complete
                  </button>
                </div>
              ))}
          </LeadColumn>

          {/* COLUMN 4: PAST DUE (New) */}
          <LeadColumn title="Past Due" icon={<AlertCircle size={20} />}>
            {[...activeLeads]
              .filter(lead => {
                const dueDate = lead.followUpDate ? new Date(lead.followUpDate) : new Date(new Date(lead.createdAt).getTime() + (72 * 60 * 60 * 1000));
                return dueDate < new Date();
              })
              .sort((a, b) => {
                const dateA = a.followUpDate ? new Date(a.followUpDate).getTime() : new Date(a.createdAt).getTime() + (72 * 60 * 60 * 1000);
                const dateB = b.followUpDate ? new Date(b.followUpDate).getTime() : new Date(b.createdAt).getTime() + (72 * 60 * 60 * 1000);
                return dateA - dateB; // Oldest first (most overdue)
              })
              .map(lead => (
                <div key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className={`bg-white p-4 rounded-[20px] border-2 shadow-sm hover:shadow-md cursor-pointer transition-all group mb-2 ${lead.type === 'Student' ? 'border-yellow-500 hover:border-yellow-600' : 'border-blue-500 hover:border-blue-600'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${lead.type === 'Student' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>{lead.type}</span>
                    <span className="text-[10px] font-bold text-red-500">
                      {lead.followUpDate
                        ? new Date(lead.followUpDate).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric' })
                        : 'Overdue (72h)'
                      }
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{lead.type === 'Student' ? lead.studentName : lead.agentName}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-1">{lead.title}</p>
                  <button className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors">
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