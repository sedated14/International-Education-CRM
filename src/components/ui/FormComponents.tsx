"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, X, ChevronDown } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';
import { COUNTRY_PHONE_CODES } from '../../data/countryPhoneCodes';

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
    disabled?: boolean;
}

export const Input = ({ label, placeholder, value, onChange, type = "text", isTextArea = false, required = false, icon, className = "", disabled, rows = 4 }: InputProps) => (
    <div className={`group ${className}`}>
        {label && (
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
        )}
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            {isTextArea ? (
                <textarea
                    className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    rows={rows}
                    required={required}
                    disabled={disabled}
                />
            ) : (
                <input
                    type={type}
                    className={`w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-10' : ''}`}
                    placeholder={placeholder}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    required={required}
                    disabled={disabled}
                    autoComplete="off"
                />
            )}
        </div>
    </div>
);

export interface PhoneInputProps {
    label?: string;
    value?: string;
    onChange: (value: string) => void;
    defaultCountry?: string; // Country Name to select default code
    required?: boolean;
    icon?: React.ReactNode;
}

export const PhoneInput = ({ label, value = '', onChange, defaultCountry, required, icon }: PhoneInputProps) => {
    const [selectedCode, setSelectedCode] = useState('+1');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Sort codes alphabetically by country name for the dropdown
    const sortedCodes = [...COUNTRY_PHONE_CODES].sort((a, b) => a.country.localeCompare(b.country));

    // Initialize/Sync State
    useEffect(() => {
        // 1. If value is provided, try to parse it
        if (value) {
            // Find longest matching code to avoid issues with +1 vs +1-246
            const match = COUNTRY_PHONE_CODES
                .filter(c => value.startsWith(c.code))
                .sort((a, b) => b.code.length - a.code.length)[0];

            if (match) {
                setSelectedCode(match.code);
                setPhoneNumber(value.replace(match.code, '').trim());
            } else {
                // If no code match found (might be raw number), keep code as is (or default) and set whole value as number?
                // Or just set whole value as number and let user fix it.
                // Assuming well-formed input if possible.
                setPhoneNumber(value);
            }
        }
        // 2. If value is empty, try to set default code from defaultCountry
        else if (defaultCountry && !value) {
            const countryMatch = COUNTRY_PHONE_CODES.find(c => c.country === defaultCountry);
            if (countryMatch) {
                setSelectedCode(countryMatch.code);
            }
        }
    }, [defaultCountry, value]);

    const handleCodeChange = (newCode: string) => {
        setSelectedCode(newCode);
        onChange(`${newCode} ${phoneNumber}`);
    };

    const handleNumberChange = (newNumber: string) => {
        setPhoneNumber(newNumber);
        onChange(`${selectedCode} ${newNumber}`);
    };

    return (
        <div className="group">
            {label && (
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <div className="flex gap-2">
                {/* Country Code Select */}
                <div className="relative w-32 shrink-0">
                    <select
                        className="w-full h-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-3 py-4 font-bold text-gray-900 dark:text-white outline-none text-xs appearance-none cursor-pointer transition-all"
                        value={selectedCode}
                        onChange={e => handleCodeChange(e.target.value)}
                    >
                        {sortedCodes.map((c) => (
                            <option key={c.country} value={c.code}>
                                {c.country} ({c.code})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Number Input */}
                <div className="relative flex-1">
                    {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                    <input
                        type="tel"
                        className={`w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all ${icon ? 'pl-10' : ''}`}
                        placeholder="123 456 7890"
                        value={phoneNumber}
                        onChange={e => handleNumberChange(e.target.value)}
                        required={required}
                    />
                </div>
            </div>
        </div>
    );
};

export interface SelectProps {
    label?: string;
    options: string[];
    value?: string;
    onChange: (value: string) => void;
}

export const Select = ({ label, options, value, onChange }: SelectProps) => (
    <div className="group">
        {label && <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>}
        <div className="relative">
            <select
                className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer transition-all"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt: string) => <option key={opt} value={opt} className="dark:bg-gray-800">{opt}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
            </div>
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
    icon?: React.ReactNode;
}

export const SearchableSelect = ({ label, options, value, onChange, placeholder, required, icon }: SearchableSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Filter options based on search
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="group relative">
            {label && (
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                <div
                    onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
                    className={`w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white flex items-center justify-between transition-colors ${icon ? 'pl-10' : ''}`}
                >
                    <span className={!value ? "text-gray-400 dark:text-gray-600" : ""}>{value || placeholder}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-60 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    autoFocus
                                    className="w-full bg-gray-100 dark:bg-gray-900 rounded-xl pl-9 pr-3 py-2 text-sm font-bold outline-none focus:ring-2 ring-black/5 dark:ring-white/10 dark:text-white border-2 border-transparent"
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
                                <div className="p-4 text-center text-xs text-gray-400 font-medium">No results found</div>
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
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${selected.includes(opt)
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
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-1 transition-colors group"
                    >
                        <Plus size={12} /> <span className="group-hover:text-black dark:group-hover:text-white transition-colors">Add Destination</span>
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
