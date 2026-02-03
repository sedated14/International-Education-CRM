"use client";
import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { Lead } from '../../types';
import { Search, Filter, Download, Plus, GraduationCap, MapPin, ChevronRight, Trash2, Archive, Calendar, Mail, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLeads } from '../../context/LeadContext';
import { LeadDetailModal } from '../../components/LeadDetailModal';

export default function StudentsPage() {
    const { leads, updateLead, deleteLead } = useLeads();
    const router = useRouter();

    // 1. Filter and Map Data
    const students = leads
        .filter(l => l.type === 'Student')
        .map(l => ({
            ...l,
            // Derived fields for easy access/sorting
            name: l.studentName,
            email: l.studentProfile?.preferredCommunication?.includes('Email') ? 'Available' : 'Not listed', // Placeholder logic
            program: l.studentProfile?.desiredDestination?.join(', ') || 'Undecided',
            duration: l.studentProfile?.duration || 'Any',
            agencyId: l.studentProfile?.agencyId,
            agencyName: l.studentProfile?.agencyId ? (leads || []).find(agent => String(agent.id) === String(l.studentProfile?.agencyId))?.agentName : null,
        }));

    // 2. State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Inquiry' | 'Contacted' | 'Qualified' | 'Lost'>('All');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedLeadId, setSelectedLeadId] = useState<string | number | null>(null);

    const selectedLead = leads.find(l => l.id === selectedLeadId) || null;

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // 3. Filter Options
    const availableCountries = Array.from(new Set(students.map(s => s.country).filter(Boolean))).sort();

    // 4. Filtering Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
            student.country.toLowerCase().includes(search.toLowerCase());

        // If 'All', exclude 'Lost' (Archived) unless specifically searching or handling otherwise?
        // Usually "All" means "Active". Let's treat 'Lost' as Archived.
        // If user selects 'Lost', show Lost. If 'All', show everything EXCEPT Lost?
        // Or just show everything. The user said "moved out of the dashboard view".
        // Let's make 'All' exclude 'Lost' by default for a dashboard feel, OR assume 'All' means literally all.
        // A common pattern is Tabs: All (Active) | Archived.
        // Given the status filter tabs, let's keep 'All' as 'All Active' (Inquiry, Contacted, Qualified).
        // And 'Lost' is separate.

        let matchesStatus = true;
        if (statusFilter === 'All') {
            matchesStatus = student.status !== 'Lost';
        } else {
            matchesStatus = student.status === statusFilter;
        }

        const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(student.country);

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && new Date(student.createdAt) >= new Date(dateRange.start);
        }
        if (dateRange.end) {
            matchesDate = matchesDate && new Date(student.createdAt) <= new Date(dateRange.end);
        }

        return matchesSearch && matchesStatus && matchesCountry && matchesDate;
    });

    // 5. Sorting Logic
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = a[key as keyof typeof a] || '';
        let bValue: any = b[key as keyof typeof b] || '';

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // 6. Selection Logic
    const handleSelectAll = () => {
        if (selectedIds.size === sortedStudents.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedStudents.map(s => String(s.id))));
        }
    };

    const handleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // 7. Bulk Actions
    const handleBulkArchive = async () => {
        if (!confirm(`Are you sure you want to archive ${selectedIds.size} leads?`)) return;
        const ids = Array.from(selectedIds);

        // Optimistically update or wait?
        // We'll just loop update.
        // Assuming updateLead takes (id, partialLead).
        try {
            await Promise.all(ids.map(id => updateLead(id, { status: 'Lost' })));
            setSelectedIds(new Set());
        } catch (e) {
            console.error("Error archiving leads:", e);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete ${selectedIds.size} leads?`)) return;
        const ids = Array.from(selectedIds);
        try {
            await Promise.all(ids.map(id => deleteLead(String(id))));
            setSelectedIds(new Set());
        } catch (e) {
            console.error("Error deleting leads:", e);
        }
    };

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLeadId(null)} />
                {/* Header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex justify-between items-center z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg">
                                <GraduationCap size={20} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Student Leads</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm ml-12">Manage student inquiries and applications</p>
                    </div>
                    <div className="flex gap-4">
                        {selectedIds.size > 0 && (
                            <>
                                <button
                                    onClick={handleBulkArchive}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm animate-in fade-in slide-in-from-top-2"
                                >
                                    <Archive size={16} />
                                    Archive ({selectedIds.size})
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm animate-in fade-in slide-in-from-top-2"
                                >
                                    <Trash2 size={16} />
                                    Delete ({selectedIds.size})
                                </button>
                            </>
                        )}
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            <Download size={16} />
                            Export CSV
                        </button>
                        <Link href="/apply">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-900 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all text-sm">
                                <Plus size={16} />
                                Add Student
                            </button>
                        </Link>
                    </div>
                </header>

                {/* Filters & Content */}
                <div className="flex-1 overflow-auto p-8">

                    {/* Search & Tabs */}
                    <div className="flex gap-4 mb-8">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-transparent focus:border-black dark:focus:border-white rounded-2xl font-medium outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm ${showFilters ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                        >
                            <Filter size={18} />
                            Filters
                        </button>
                        <div className="flex bg-white dark:bg-gray-900 rounded-2xl p-1 shadow-sm overflow-x-auto custom-scrollbar">
                            {(['All', 'Inquiry', 'Contacted', 'Qualified', 'Lost'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${statusFilter === status
                                        ? 'bg-black text-white shadow-md dark:bg-gray-700'
                                        : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {status === 'Lost' ? 'Archived' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Filter Panel */}
                    {showFilters && (
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 mb-8 shadow-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <Filter size={20} className="text-blue-500" /> Advanced Filters
                                </h3>
                                <button
                                    onClick={() => {
                                        setSelectedCountries([]);
                                        setDateRange({ start: '', end: '' });
                                    }}
                                    className="text-sm font-bold text-red-500 hover:underline"
                                >
                                    Reset All
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Date Range */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Created Date</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                                value={dateRange.start}
                                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="date"
                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold focus:border-blue-500 outline-none text-gray-900 dark:text-white"
                                                value={dateRange.end}
                                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Countries */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Country</label>
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {availableCountries.map(country => (
                                            <button
                                                key={country}
                                                onClick={() => {
                                                    if (selectedCountries.includes(country)) {
                                                        setSelectedCountries(selectedCountries.filter(c => c !== country));
                                                    } else {
                                                        setSelectedCountries([...selectedCountries, country]);
                                                    }
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedCountries.includes(country)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                {country}
                                            </button>
                                        ))}
                                        {availableCountries.length === 0 && <span className="text-sm text-gray-400 italic">No available countries</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-bold cursor-pointer select-none">
                                    <th className="px-6 py-5 w-16 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.size > 0 && selectedIds.size === sortedStudents.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                    </th>
                                    <th className="px-2 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('name')}>
                                        Student Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('country')}>
                                        Country {sortConfig?.key === 'country' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('status')}>
                                        Status {sortConfig?.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('program')}>
                                        Program Interest {sortConfig?.key === 'program' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-5 text-right hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('source')}>
                                        Source / Agency {sortConfig?.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-5 text-right hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('createdAt')}>
                                        Created {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {sortedStudents.map(student => (
                                    <tr key={student.id} className={`group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${selectedIds.has(String(student.id)) ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                                        <td className="px-6 py-5 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(String(student.id))}
                                                onChange={() => handleSelect(String(student.id))}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </td>
                                        <td className="px-2 py-5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedLeadId(student.id); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Quick View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <div>
                                                    <Link
                                                        href={`/students/${student.id}`}
                                                        className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-base block"
                                                    >
                                                        {student.name}
                                                    </Link>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium mt-0.5">
                                                        <Mail size={10} />
                                                        {student.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium text-sm">
                                                <MapPin size={14} className="text-gray-400" />
                                                {student.country}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={student.status} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{student.program}</div>
                                            <div className="text-xs text-gray-400">{student.duration}</div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md inline-block">
                                                {student.source}
                                            </div>
                                            {student.agencyName && (
                                                <div className="text-xs mt-1 font-bold text-blue-600 dark:text-blue-400">
                                                    via {student.agencyName}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-300">
                                                {new Date(student.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] text-gray-400">{new Date(student.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => router.push(`/students/${student.id}`)}
                                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-gray-400"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedStudents.length === 0 && (
                            <div className="p-12 text-center text-gray-400">
                                <GraduationCap size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="font-medium">No student leads found matching your criteria.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        Inquiry: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        Contacted: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        Qualified: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        Lost: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    };

    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
            {status}
        </span>
    );
};
