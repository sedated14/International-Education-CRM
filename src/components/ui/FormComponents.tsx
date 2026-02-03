"use client";
import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';

export interface InputProps {
    label?: string;
    placeholder?: string;
    value?: string;
    onChange: (value: string) => void;
    type?: string;
    isTextArea?: boolean;
    required?: boolean;
    icon?: React.ReactNode;
    className?: string;
    rows?: number;
}

export const Input = ({ label, placeholder, value, onChange, type = "text", isTextArea = false, required = false, icon, className = "" }: InputProps) => (
    <div className={`group ${className}`}>
        {label && (
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
        )}
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            {isTextArea ? (
                <textarea
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none transition-all resize-none"
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    rows={4}
                    required={required}
                />
            ) : (
                <input
                    type={type}
                    className={`w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none transition-all ${icon ? 'pl-10' : ''}`}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    autoComplete="off"
                />
            )}
        </div>
    </div>
);

export interface SelectProps {
    label?: string;
    options: string[];
    value?: string;
    onChange: (value: string) => void;
}

export const Select = ({ label, options, value, onChange }: SelectProps) => (
    <div className="group">
        {label && <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>}
        <div className="relative">
            <select
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer transition-all"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            >
                {options.map((opt: string) => <option key={opt} value={opt} className="dark:bg-gray-800">{opt}</option>)}
            </select>
        </div>
    </div>
);


export interface SearchableSelectProps {
    label?: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
}

export const SearchableSelect = ({ label, options, value, onChange, placeholder, required }: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="group relative">
            {label && (
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}

            <div className="relative">
                <div
                    onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white flex items-center justify-between"
                >
                    <span className={!value ? "text-gray-300 dark:text-gray-600" : ""}>{value || placeholder}</span>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl pl-9 pr-3 py-2 text-sm font-bold outline-none focus:ring-2 ring-black/5 dark:ring-white/10 dark:text-white"
                                    placeholder="Type to search..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-1">
                            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                                <button
                                    type="button"
                                    key={opt}
                                    onClick={() => { onChange(opt); setIsOpen(false); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {opt}
                                </button>
                            )) : (
                                <div className="p-4 text-center text-xs text-gray-400 font-medium">No countries found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Overlay to close */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export const CheckboxGroup = ({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) => {
    const toggle = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter(s => s !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selected.includes(opt)
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
};

const SORTED_COUNTRIES = [
    // Priority
    "United States", "Canada", "United Kingdom", "Australia", "New Zealand", "Ireland",
    // Divider
    "-------------------",
    // Rest
    ...COUNTRIES.filter(c => !["United States", "Canada", "United Kingdom", "Australia", "New Zealand", "Ireland"].includes(c)).sort()
];

export const CountrySelector = ({ selected, onChange }: { selected: string[], onChange: (val: string[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const addCountry = (country: string) => {
        if (country === "-------------------") return;
        if (!selected.includes(country)) {
            onChange([...selected, country]);
        }
        setIsOpen(false);
    };

    const removeCountry = (country: string) => {
        onChange(selected.filter(c => c !== country));
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {selected.map(c => (
                    <div key={c} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                        {c}
                        <button type="button" onClick={() => removeCountry(c)} className="hover:text-blue-900 dark:hover:text-blue-100">
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors"
                    >
                        <Plus size={12} /> Add Destination
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <div className="absolute top-full left-0 mt-2 w-56 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 p-1">
                                {SORTED_COUNTRIES.map((c, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={c === "-------------------"}
                                        onClick={() => addCountry(c)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold ${c === "-------------------" ? "text-gray-300 dark:text-gray-600 cursor-default justify-center flex" : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
