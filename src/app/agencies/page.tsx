"use client";
import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Agency } from '../../types';
import { Search, Filter, Download, Plus, Globe, MapPin, User, ChevronRight, Trash2, X, Calendar, CheckSquare, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { ImportAgenciesModal } from '../../components/ImportAgenciesModal';
import { useLeads } from '../../context/LeadContext';
import { generateAgencyCode } from '../../utils/formatters';

export default function AgenciesPage() {
    const { leads, updateLead, deleteLead } = useLeads();
    // Map Leads to Agency format for this view
    const agencies = leads
        .filter(l => l.type === 'Agent')
        .map(l => {
            const checklist = l.agencyProfile?.onboardingChecklist;
            let marketingStatus = 'Not Added';
            if (checklist?.marketingSubscribed) marketingStatus = 'Subscribed';
            else if (checklist?.marketingUnsubscribed) marketingStatus = 'Unsubscribed';

            return {
                ...l.agencyProfile,
                id: l.id,
                agencyCode: l.agencyCode,
                name: l.agentName, // Use Lead name as canonical
                country: l.country, // Use Lead country as canonical
                type: l.type, // FIX: Ensure type is passed
                marketingStatus, // NEW: Derived status
                // Ensure other required fields exist if missing
                keyContacts: l.agencyProfile?.keyContacts || [],
                historicalSends: l.agencyProfile?.historicalSends || 0,
                partnershipStatus: l.agencyProfile?.partnershipStatus || 'Prospective',
                lastContactDate: l.lastContacted || l.createdAt,
                createdAt: l.createdAt, // Map distinct creation date
                studentCount: leads.filter(student => student.type === 'Student' && String(student.studentProfile?.agencyId) === String(l.id)).length
            } as Agency & { studentCount: number, marketingStatus: string };
        });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Prospective' | 'Inactive' | 'Do Not Contact'>('All');
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Advanced Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showImportModal, setShowImportModal] = useState(false);

    // Derive available options from data
    const availableRegions = Array.from(new Set(agencies.map(a => a.region).filter(Boolean))).sort();
    const availableCountries = Array.from(new Set(agencies
        .filter(a => selectedRegions.length === 0 || selectedRegions.includes(a.region)) // Filter countries by selected region if any
        .map(a => a.country).filter(Boolean)
    )).sort();

    const filteredAgencies = agencies.filter(agency => {
        const matchesSearch = agency.name.toLowerCase().includes(search.toLowerCase()) ||
            agency.country.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || agency.partnershipStatus === statusFilter;

        // Advanced Filters
        const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(agency.region);
        const matchesCountry = selectedCountries.length === 0 || selectedCountries.includes(agency.country);

        let matchesDate = true;
        if (dateRange.start) {
            matchesDate = matchesDate && new Date(agency.createdAt || 0) >= new Date(dateRange.start);
        }
        if (dateRange.end) {
            matchesDate = matchesDate && new Date(agency.createdAt || 0) <= new Date(dateRange.end);
        }

        return matchesSearch && matchesStatus && matchesRegion && matchesCountry && matchesDate;
    });

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAgencies = [...filteredAgencies].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let aValue: any = a[key as keyof Agency];
        let bValue: any = b[key as keyof Agency];

        // Custom getters
        if (key === 'keyContactName') {
            aValue = a.keyContacts[0]?.name || '';
            bValue = b.keyContacts[0]?.name || '';
        } else if (key === 'location') {
            aValue = `${a.country} ${a.city}`;
            bValue = `${b.country} ${b.city}`;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Selection Handlers
    const handleSelectAll = () => {
        if (selectedIds.size === sortedAgencies.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(sortedAgencies.map(a => String(a.id))));
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

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} agencies? This action cannot be undone.`)) return;

        const idsToDelete = Array.from(selectedIds);
        try {
            await Promise.all(idsToDelete.map(id => deleteLead(id)));
            setSelectedIds(new Set());
        } catch (e) {
            console.error("Error deleting agencies:", e);
            alert("Some agencies could not be deleted.");
        }
    };



    const handleExportCSV = () => {
        const headers = [
            'Agency ID', 'Name', 'Region', 'Country', 'City', 'Address', 'Type', 'Status', 'Marketing List',
            'Commission', 'Sends', 'Last Contact', 'Date Added', 'Met At',
            'Primary Contact Name', 'Nickname', 'Role', 'Email', 'Phone', 'WhatsApp', 'Skype', 'Pref Comm',
            'Secondary Contact Name', 'Role', 'Email', 'WhatsApp'
        ];

        const csvContent = [
            headers.join(','),
            ...sortedAgencies.map(a => {
                const p = a.keyContacts[0] || {} as any;
                const s = a.secondaryContact || {} as any;
                return [
                    `"${a.agencyCode || a.id}"`, // Use new Code
                    `"${a.name}"`,
                    `"${a.region || ''}"`,
                    `"${a.country}"`,
                    `"${a.city}"`,
                    `"${a.address || ''}"`,
                    `"${a.type || 'Agent'}"`, // Fix: Ensure 'Agent'
                    a.partnershipStatus,
                    `"${a.onboardingChecklist?.addedMarketingList ? (a.onboardingChecklist.marketingSubscribed ? 'Subscribed' : (a.onboardingChecklist.marketingUnsubscribed ? 'Unsubscribed' : 'Added')) : 'Not Added'}"`,
                    a.commissionRate || '',
                    a.historicalSends,
                    a.lastContactDate,
                    a.createdAt,
                    `"${a.metAt || ''}"`,
                    `"${p.name || ''}"`,
                    `"${p.nickname || ''}"`,
                    `"${p.role || ''}"`,
                    p.email || '',
                    p.phone || '',
                    p.whatsapp || '',
                    p.skype || '',
                    p.preferredCommunication || '',
                    `"${s.name || ''}"`,
                    `"${s.role || ''}"`,
                    s.email || '',
                    s.whatsapp || ''
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `agencies_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-8 py-6 flex justify-between items-center z-20">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Globe size={20} />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Agency Network</h1>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm ml-12">Manage partnerships and recruitment channels</p>
                    </div>
                    <div className="flex gap-4">
                        {selectedIds.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm animate-in fade-in slide-in-from-top-2"
                            >
                                <Trash2 size={16} />
                                Delete ({selectedIds.size})
                            </button>
                        )}
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                        >
                            <FileSpreadsheet size={16} />
                            Upload CSV
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                        >
                            <Download size={16} />
                            Export CSV
                        </button>

                        <Link href="/agencies/add">
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-gray-900 dark:hover:bg-gray-200 shadow-lg hover:shadow-xl transition-all text-sm">
                                <Plus size={16} />
                                Add Agency
                            </button>
                        </Link>
                    </div>
                </header>

                {/* Filters & Content */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

                    {/* Fixed Top Section (Search & Filters) */}
                    <div className="p-8 pb-4 shrink-0">
                        <div className="flex gap-4 mb-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search agencies..."
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
                                {(selectedRegions.length > 0 || selectedCountries.length > 0 || dateRange.start || dateRange.end) && (
                                    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                        {selectedRegions.length + selectedCountries.length + (dateRange.start ? 1 : 0)}
                                    </span>
                                )}
                            </button>
                            <div className="flex bg-white dark:bg-gray-900 rounded-2xl p-1 shadow-sm">
                                {(['All', 'Active', 'Pending', 'Prospective', 'Inactive', 'Do Not Contact'] as const).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${statusFilter === status
                                            ? 'bg-black text-white shadow-md dark:bg-gray-700'
                                            : 'text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Panel */}
                        {showFilters && (
                            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-8 mb-8 shadow-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Filter size={20} className="text-blue-500" /> Advanced Filters
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setSelectedRegions([]);
                                            setSelectedCountries([]);
                                            setDateRange({ start: '', end: '' });
                                        }}
                                        className="text-sm font-bold text-red-500 hover:underline"
                                    >
                                        Reset All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Date Added Range */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Date Added</label>
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

                                    {/* Regions */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Region</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableRegions.map(region => (
                                                <button
                                                    key={region}
                                                    onClick={() => {
                                                        if (selectedRegions.includes(region)) {
                                                            setSelectedRegions(selectedRegions.filter(r => r !== region));
                                                        } else {
                                                            setSelectedRegions([...selectedRegions, region]);
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedRegions.includes(region)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                        }`}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                            {availableRegions.length === 0 && <span className="text-sm text-gray-400 italic">No regions found</span>}
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
                                            {availableCountries.length === 0 && <span className="text-sm text-gray-400 italic">No countries found</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    {/* Scrollable Table Area */}
                    <div className="flex-1 overflow-auto px-8 pb-8 min-h-0 custom-scrollbar">
                        <div className="bg-white dark:bg-gray-900 rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden min-w-full inline-block align-middle">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-400 font-bold cursor-pointer select-none sticky top-0 z-10 backdrop-blur-md bg-opacity-90">
                                        <th className="px-6 py-5 w-16 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size > 0 && selectedIds.size === sortedAgencies.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            ID
                                        </th>
                                        <th className="px-2 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('name')}>
                                            Agency Name {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('region')}>
                                            Region {sortConfig?.key === 'region' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('location')}>
                                            Location {sortConfig?.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('partnershipStatus')}>
                                            Status {sortConfig?.key === 'partnershipStatus' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            Marketing List
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            Marketing Status
                                        </th>
                                        <th className="px-6 py-5 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('keyContactName')}>
                                            Key Contact {sortConfig?.key === 'keyContactName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 text-right hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('historicalSends')}>
                                            History {sortConfig?.key === 'historicalSends' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 text-right hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('studentCount')}>
                                            Active Leads {sortConfig?.key === 'studentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-5 text-right hover:text-gray-600 dark:hover:text-gray-300 transition-colors" onClick={() => handleSort('createdAt')}>
                                            Date Added {sortConfig?.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {sortedAgencies.map(agency => (
                                        <tr key={agency.id} className={`group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${selectedIds.has(String(agency.id)) ? 'bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(String(agency.id))}
                                                    onChange={() => handleSelect(String(agency.id))}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-lg">
                                                    {agency.agencyCode || `#${agency.id}`}
                                                </span>
                                            </td>
                                            <td className="px-2 py-5">
                                                <Link href={`/agencies/${agency.id}`}>
                                                    <div className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">{agency.name}</div>
                                                </Link>
                                                <div className="text-xs text-gray-400 font-medium">{agency.type}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
                                                {agency.region || '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium text-sm">
                                                    <MapPin size={14} className="text-gray-400" />
                                                    {[agency.city, agency.country].filter(Boolean).join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={agency.partnershipStatus} />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {agency.onboardingChecklist?.addedMarketingList ? (
                                                    <div className="inline-flex items-center justify-center w-6 h-6 bg-green-100 rounded-full border border-green-200">
                                                        <CheckCircle2 size={14} className="text-green-600" />
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                {(() => {
                                                    const cl = (agency.onboardingChecklist || {}) as any;
                                                    if (cl.marketingSubscribed) {
                                                        return <span className="text-xs font-bold text-green-600 dark:text-green-400">Subscribed</span>;
                                                    }
                                                    if (cl.marketingUnsubscribed) {
                                                        return <span className="text-xs font-bold text-red-600 dark:text-red-400">Unsubscribed</span>;
                                                    }
                                                    return <span className="text-gray-300">-</span>;
                                                })()}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">
                                                        {agency.keyContacts[0]?.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{agency.keyContacts[0]?.name}</div>
                                                        <div className="text-xs text-gray-400">{agency.keyContacts[0]?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="font-black text-lg text-gray-900 dark:text-white">{agency.historicalSends}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">Total Sent</div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Link href={`/agencies/${agency.id}/leads`} className="group/leads inline-flex flex-col items-end cursor-pointer">
                                                    <div className="font-black text-lg text-blue-600 dark:text-blue-400 group-hover/leads:underline decoration-2 underline-offset-2">{(agency as any).studentCount}</div>
                                                    <div className="text-[10px] text-blue-400 dark:text-blue-500 uppercase font-bold group-hover/leads:text-blue-600 dark:group-hover/leads:text-blue-400">View Leads</div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="text-sm font-bold text-gray-900 dark:text-gray-300">
                                                    {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : '-'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Link href={`/agencies/${agency.id}`}>
                                                    <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-black dark:hover:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all text-gray-400">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {sortedAgencies.length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    <p className="font-medium">No agencies found matching your criteria.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            {showImportModal && <ImportAgenciesModal onClose={() => setShowImportModal(false)} />}
        </div >
    );
}

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        Pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        Inactive: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        Prospective: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'Do Not Contact': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }[status] || 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';

    return (
        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide ${styles}`}>
            {status}
        </span>
    );
};
