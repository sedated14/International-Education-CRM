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

import { AsYouType, CountryCode, validatePhoneNumberLength } from 'libphonenumber-js';

// ... Imports ...

export const PhoneInput = ({ label, value = '', onChange, defaultCountry, required, icon }: PhoneInputProps) => {
    // We store the ISO Country Code (e.g. 'US') as the source of truth for "Selected Country"
    const [selectedIso, setSelectedIso] = useState<CountryCode>('US');
    const [phoneNumber, setPhoneNumber] = useState('');

    // Sort codes alphabetically by country name for the dropdown
    const sortedCodes = [...COUNTRY_PHONE_CODES].sort((a, b) => a.country.localeCompare(b.country));

    // Initialize/Sync State
    useEffect(() => {
        if (value) {
            // Value is typically "+1 5555555555" or similar
            // We try to match the code primarily
            // But now we have ISOs.
            // If we have a value, we can try to guess the country if it's not set, or just use +code matching.

            // Find matched country by code prefix
            // We sort by code length (desc) to match longest code first (+1-246 vs +1) if strictly matching string start
            const match = COUNTRY_PHONE_CODES
                .filter(c => value.startsWith(c.code))
                .sort((a, b) => b.code.length - a.code.length)[0];

            if (match) {
                // Determine if we should update ISO. Only if we haven't touched it? 
                // Or robustly: if the current selectedIso doesn't match the code in value, update it.
                // But +1 corresponds to US, CA, etc. Match.iso might be Antigua (+1). 
                // If value was saved as "+1 ...", we might default to US if we don't know better.

                // If the user hasn't interacted, we trust the value.
                if (match.iso) {
                    if (match.code === '+1' && selectedIso === 'CA') {
                        // Keep Canada if already selected?
                    } else {
                        setSelectedIso(match.iso as CountryCode);
                    }
                }

                // Strip the code from the phone number for display
                // Note: The value usually contains the code. 
                const rawNumber = value.slice(match.code.length).trim();

                // Format the *remaining* number using the ISO
                const asYouType = new AsYouType(match.iso as CountryCode);
                const formatted = asYouType.input(rawNumber);

                setPhoneNumber(formatted);
            } else {
                setPhoneNumber(value);
            }
        }
        else if (defaultCountry && !value) {
            // Default country by Name -> find ISO
            const countryMatch = COUNTRY_PHONE_CODES.find(c => c.country === defaultCountry);
            if (countryMatch) {
                setSelectedIso(countryMatch.iso as CountryCode);
            }
        }
    }, [defaultCountry, value]);

    const handleIsoChange = (newIso: string) => {
        setSelectedIso(newIso as CountryCode);
        const match = COUNTRY_PHONE_CODES.find(c => c.iso === newIso);

        // Re-format existing number with new ISO
        if (match) {
            const asYouType = new AsYouType(newIso as CountryCode);
            // We strip non-digits to re-type
            const clean = phoneNumber.replace(/\D/g, '');
            const formatted = asYouType.input(clean);
            setPhoneNumber(formatted);

            // Construct full value: Code + Clean Number (or formatted? Usually DB stores formatted or raw with code)
            // User requested "format based on country code".
            // We usually save "+1 (555) 555-5555" or similar.
            onChange(`${match.code} ${formatted}`);
        }
    };

    const handleNumberChange = (input: string) => {
        // Input is the raw typing in the field

        // Strip non-digit chars to check raw length validity against the country
        const digits = input.replace(/[^0-9]/g, '');

        // If we have digits, check length. 
        // We need to be careful: validatePhoneNumberLength expects the full number *including* country code if we don't pass country, 
        // OR the national number if we pass country? 
        // Actually validatePhoneNumberLength(number, country) docs say: "checks if the phone number length is valid for this country"
        // It is best to pass the full text (formatted or not) but AsYouType is robust.

        // Let's rely on AsYouType to produce a formatted string, then check if it's "Too Long"
        const asYouType = new AsYouType(selectedIso);
        const formatted = asYouType.input(digits);

        // Check validity of the POTENTIAL new number
        // We use the digits to construct a number object or just check length
        // validatePhoneNumberLength returns 'TOO_LONG' if it exceeds possible length

        const validationResult = validatePhoneNumberLength(digits, selectedIso);

        // If it's TOO_LONG, we should probably BLOCK the input, BUT:
        // Case: User is deleting digits. We must always allow getting SHORTER.
        // So we compare with current state? 
        // Or simpler: We calculate the validation of the *new* input.

        // If we are adding chars and it becomes TOO_LONG -> Block.
        // If we are removing chars -> Allow.

        // Problem: 'input' from onChange is the *new* value. 
        // If it's shorter than previous 'phoneNumber', allow it.
        if (input.length < phoneNumber.length) {
            setPhoneNumber(formatted);
            // Update parent
            const match = COUNTRY_PHONE_CODES.find(c => c.iso === selectedIso);
            if (match) onChange(`${match.code} ${formatted}`);
            return;
        }

        if (validationResult === 'TOO_LONG') {
            // Block update (don't set state)
            return;
        }

        setPhoneNumber(formatted);

        const match = COUNTRY_PHONE_CODES.find(c => c.iso === selectedIso);
        if (match) {
            onChange(`${match.code} ${formatted}`);
        }
    };

    const currentCountry = COUNTRY_PHONE_CODES.find(c => c.iso === selectedIso);

    return (
        <div className="group w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <div className="flex gap-2 w-full">
                {/* Country Select - RESTORED WIDTH & CONTENT */}
                <div className="relative w-[140px] shrink-0">
                    <select
                        className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-3 py-4 font-bold text-gray-900 dark:text-white outline-none text-xs appearance-none cursor-pointer transition-all truncate pr-8"
                        value={selectedIso}
                        onChange={e => handleIsoChange(e.target.value)}
                    >
                        {sortedCodes.map((c) => (
                            <option key={c.iso + c.country} value={c.iso}>
                                {c.country} ({c.code})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown size={14} />
                    </div>
                </div>

                {/* Number Input */}
                <div className="relative flex-1 min-w-0">
                    {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
                    <input
                        type="tel"
                        className={`w-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 outline-none transition-all ${icon ? 'pl-10' : ''}`}
                        placeholder={selectedIso === 'US' ? "(555) 555-5555" : "Phone Number"}
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
