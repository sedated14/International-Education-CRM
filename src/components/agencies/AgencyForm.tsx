"use client";
import React, { useState, useEffect } from 'react';
import { Agency } from '../../types';
import { User, Globe, Building2, Phone, Mail, MessageCircle, Video, Save, Search, Plus, X, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { countryToRegion, getTimezone } from '../../utils/countries';
import { Input, Select, SearchableSelect, CheckboxGroup, CountrySelector, PhoneInput } from '../ui/FormComponents';

interface AgencyFormProps {
    initialData?: Agency;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
    cancelHref?: string;
    renderFooter?: boolean;
}

export const AgencyForm = ({ initialData, onSubmit, isSubmitting, submitLabel = 'Save Agency', cancelHref = '/agencies', renderFooter = false }: AgencyFormProps) => {

    // Initial Form State
    const [formData, setFormData] = useState<Partial<Agency> & {
        contactFirstName: string;
        contactLastName: string;
        nickname: string;
        secContactFirstName: string;
        secContactLastName: string;
        contractSignedDate?: string;
    }>({
        name: '',
        region: '',
        country: '',
        city: '',
        address: '',
        type: 'Recruitment Agency',
        website: '',
        metAt: '',
        // Primary Contact
        contactFirstName: '',
        contactLastName: '',
        nickname: '',
        partnershipStatus: 'Prospective',
        contractSignedDate: '', // Initialize
        commissionRate: '',
        timezone: '',
        language: '',
        culturalNotes: '',
        generalNotes: '',
        secContactFirstName: '',
        secContactLastName: ''
    });

    // Separate state for contacts
    const [primaryContact, setPrimaryContact] = useState({
        position: '',
        email: '',
        phone: '',
        whatsapp: '',
        skype: '',
        preferredCommunication: 'Email',
        notes: ''
    });

    const [secondaryContact, setSecondaryContact] = useState({
        firstName: '',
        lastName: '',
        position: '',
        email: '',
        whatsapp: '',
        notes: ''
    });

    const [additionalContacts, setAdditionalContacts] = useState<any[]>([]);

    // Load initial data if present
    useEffect(() => {
        if (initialData) {
            const primary = initialData.keyContacts && initialData.keyContacts.length > 0 ? initialData.keyContacts[0] : null;
            const secondary = initialData.secondaryContact || null;
            // Any contacts beyond the first one are considered additional
            const additional = initialData.keyContacts && initialData.keyContacts.length > 1 ? initialData.keyContacts.slice(1) : [];

            setFormData(prev => ({
                ...prev,
                ...initialData,
                contactFirstName: primary?.firstName || '',
                contactLastName: primary?.lastName || '',
                nickname: primary?.nickname || '',
                secContactFirstName: secondary?.firstName || '',
                secContactLastName: secondary?.lastName || ''
            }));

            setPrimaryContact({
                position: primary?.role || '',
                email: primary?.email || '',
                phone: primary?.phone || '',
                whatsapp: primary?.whatsapp || '',
                skype: primary?.skype || '',
                preferredCommunication: primary?.preferredCommunication || 'Email',
                notes: primary?.notes || ''
            });

            setSecondaryContact({
                firstName: secondary?.firstName || '',
                lastName: secondary?.lastName || '',
                position: secondary?.role || '',
                email: secondary?.email || '',
                whatsapp: secondary?.whatsapp || '',
                notes: secondary?.notes || ''
            });

            setAdditionalContacts(additional);
        }
    }, [initialData]);

    const handleCountryChange = (country: string) => {
        const region = countryToRegion[country] || '';
        const timezone = getTimezone(country, formData.city);

        // Default recruiting country to main country if empty
        const currentRecruiting = formData.recruitingCountries || [];
        const newRecruiting = currentRecruiting.length === 0 ? [country] : currentRecruiting;

        setFormData(prev => ({
            ...prev,
            country,
            region,
            timezone,
            recruitingCountries: newRecruiting
        }));
    };

    const addContact = () => {
        setAdditionalContacts([...additionalContacts, {
            name: '',
            role: '',
            email: '',
            phone: '',
            whatsapp: '',
            notes: ''
        }]);
    };

    const removeContact = (index: number) => {
        setAdditionalContacts(prev => prev.filter((_, i) => i !== index));
    };

    const updateAdditionalContact = (index: number, field: string, value: string) => {
        const updated = [...additionalContacts];
        updated[index] = { ...updated[index], [field]: value };
        setAdditionalContacts(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Construct final Agency object
        const newAgency: any = {
            ...formData,
            // ID is handled by backend for new, or preserved for edit
            // Combine names
            keyContacts: [
                {
                    name: `${formData.contactFirstName} ${formData.contactLastName}`,
                    firstName: formData.contactFirstName,
                    lastName: formData.contactLastName,
                    nickname: formData.nickname,
                    role: primaryContact.position,
                    email: primaryContact.email,
                    phone: primaryContact.phone,
                    whatsapp: primaryContact.whatsapp,
                    skype: primaryContact.skype,
                    preferredCommunication: primaryContact.preferredCommunication,
                    notes: primaryContact.notes
                },
                ...additionalContacts.map(c => ({
                    ...c,
                    name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()
                }))
            ],
            secondaryContact: secondaryContact.firstName ? {
                name: `${secondaryContact.firstName} ${secondaryContact.lastName}`,
                firstName: secondaryContact.firstName,
                lastName: secondaryContact.lastName,
                role: secondaryContact.position,
                email: secondaryContact.email,
                phone: '',
                whatsapp: secondaryContact.whatsapp,
                notes: secondaryContact.notes
            } : undefined,

            // Stats (preserve if edit, init if new)
            historicalSends: initialData?.historicalSends || 0,
            lastContactDate: initialData?.lastContactDate || new Date().toISOString()
        };

        if (initialData) {
            newAgency.id = initialData.id;
        }

        await onSubmit(newAgency);
    };

    return (
        <form id="agency-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8 pb-20">

            {/* LEFT COLUMN: Main Info */}
            <div className="xl:col-span-2 space-y-8">

                {/* SECTION 1: AGENCY INFO */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="text-blue-500" /> Agency Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Agency Name" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} required />

                        {/* Country moved to 2nd position */}
                        <SearchableSelect
                            label="Country"
                            options={Object.keys(countryToRegion)}
                            value={formData.country || ''}
                            onChange={handleCountryChange}
                            placeholder="Search country..."
                            required
                        />

                        <Input label="Region / Continent" placeholder="e.g. LATAM, Southeast Asia" value={formData.region} onChange={v => setFormData({ ...formData, region: v })} />
                        <Input label="City" value={formData.city} onChange={v => {
                            const timezone = getTimezone(formData.country || '', v);
                            setFormData({ ...formData, city: v, timezone });
                        }} />
                        <Input label="Full Address" value={formData.address} onChange={v => setFormData({ ...formData, address: v })} className="md:col-span-2" />
                        <Input label="Website" value={formData.website} onChange={v => setFormData({ ...formData, website: v })} icon={<Globe size={16} />} />

                    </div>
                </section>

                {/* SECTION 2: PRIMARY CONTACT */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-orange-500" /> Primary Contact
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" value={formData.contactFirstName} onChange={v => setFormData({ ...formData, contactFirstName: v })} required />
                        <Input label="Last Name" value={formData.contactLastName} onChange={v => setFormData({ ...formData, contactLastName: v })} required />
                        <Input label="Nickname" value={formData.nickname} onChange={v => setFormData({ ...formData, nickname: v })} />

                        <Input label="Position" value={primaryContact.position} onChange={v => setPrimaryContact({ ...primaryContact, position: v })} required />
                        <Input label="Met At" placeholder="Event or Location" value={formData.metAt} onChange={v => setFormData({ ...formData, metAt: v })} className="md:col-span-2" />
                        <Select label="Preferred Communication" options={['Email', 'WhatsApp', 'Phone', 'Skype']} value={primaryContact.preferredCommunication} onChange={v => setPrimaryContact({ ...primaryContact, preferredCommunication: v })} />

                        <Input label="Email" type="email" icon={<Mail size={16} />} value={primaryContact.email} onChange={v => setPrimaryContact({ ...primaryContact, email: v })} required />
                        <div className="md:col-span-2">
                            <PhoneInput label="Phone Number" icon={<Phone size={16} />} value={primaryContact.phone} onChange={v => setPrimaryContact({ ...primaryContact, phone: v })} defaultCountry={formData.country} />
                        </div>
                        <div className="md:col-span-2">
                            <PhoneInput label="WhatsApp" icon={<MessageCircle size={16} />} value={primaryContact.whatsapp} onChange={v => setPrimaryContact({ ...primaryContact, whatsapp: v })} defaultCountry={formData.country} />
                        </div>
                        <Input label="Skype Address" icon={<Video size={16} />} value={primaryContact.skype} onChange={v => setPrimaryContact({ ...primaryContact, skype: v })} />

                        <div className="md:col-span-2">
                            <Input label="Contact Notes" isTextArea value={primaryContact.notes} onChange={v => setPrimaryContact({ ...primaryContact, notes: v })} />
                        </div>
                    </div>
                </section>

                {/* SECTION 3: SECONDARY CONTACT */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <User className="text-purple-500" /> Secondary Contact (Optional)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" value={secondaryContact.firstName} onChange={v => setSecondaryContact({ ...secondaryContact, firstName: v })} />
                        <Input label="Last Name" value={secondaryContact.lastName} onChange={v => setSecondaryContact({ ...secondaryContact, lastName: v })} />
                        <Input label="Position" value={secondaryContact.position} onChange={v => setSecondaryContact({ ...secondaryContact, position: v })} />
                        <div className="hidden md:block" />
                        <Input label="Email" icon={<Mail size={16} />} value={secondaryContact.email} onChange={v => setSecondaryContact({ ...secondaryContact, email: v })} />
                        <div className="md:col-span-2">
                            <PhoneInput label="WhatsApp" icon={<MessageCircle size={16} />} value={secondaryContact.whatsapp} onChange={v => setSecondaryContact({ ...secondaryContact, whatsapp: v })} defaultCountry={formData.country} />
                        </div>
                        <div className="md:col-span-2">
                            <Input label="Contact Notes" isTextArea value={secondaryContact.notes} onChange={v => setSecondaryContact({ ...secondaryContact, notes: v })} />
                        </div>
                    </div>
                </section>

                {/* SECTION 3b: ADDITIONAL CONTACTS */}
                {additionalContacts.map((contact, index) => (
                    <section key={index} className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 relative">
                        <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="absolute top-8 right-8 text-red-400 hover:text-red-600 font-bold text-xs uppercase tracking-wide"
                        >
                            Remove
                        </button>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="text-gray-400" /> Additional Contact {index + 1}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Full Name" value={contact.name} onChange={v => updateAdditionalContact(index, 'name', v)} required />
                            <Input label="Position" value={contact.role} onChange={v => updateAdditionalContact(index, 'role', v)} />
                            <Input label="Email" icon={<Mail size={16} />} value={contact.email} onChange={v => updateAdditionalContact(index, 'email', v)} />
                            <div className="md:col-span-2">
                                <PhoneInput label="WhatsApp" icon={<MessageCircle size={16} />} value={contact.whatsapp} onChange={v => updateAdditionalContact(index, 'whatsapp', v)} defaultCountry={formData.country} />
                            </div>
                            <div className="md:col-span-2">
                                <Input label="Contact Notes" isTextArea value={contact.notes} onChange={v => updateAdditionalContact(index, 'notes', v)} />
                            </div>
                        </div>
                    </section>
                ))}

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={addContact}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold hover:text-black dark:hover:text-white transition-colors px-6 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <User size={18} /> Add Additional Contact
                    </button>
                </div>

                {/* NOTES SECTION - Moved here for better flow but distinct from Partnership Data */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <ClipboardList className="text-gray-400" /> Agency Notes
                    </h2>
                    <div className="space-y-6">
                        <Input label="Cultural & Communication Notes" isTextArea rows={6} value={formData.culturalNotes} onChange={v => setFormData({ ...formData, culturalNotes: v })} />
                        <Input label="General Notes" isTextArea rows={6} value={formData.generalNotes} onChange={v => setFormData({ ...formData, generalNotes: v })} />
                    </div>
                </section>

            </div>

            {/* RIGHT COLUMN: Partnership Sidebar */}
            <div className="xl:col-span-1 space-y-8">

                {/* SECTION 4: PARTNERSHIP DETAILS - NO STICKY, NO NOTES */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="text-green-500" /> Partnership
                    </h2>
                    <div className="space-y-6">
                        <Select label="Status" options={['Prospective', 'Active', 'Pending', 'Inactive', 'Do Not Contact']} value={formData.partnershipStatus} onChange={v => setFormData({ ...formData, partnershipStatus: v as any })} />
                        <Input
                            label="Contract Signed"
                            type="date"
                            value={formData.contractSignedDate ? new Date(formData.contractSignedDate).toISOString().split('T')[0] : ''}
                            onChange={v => setFormData({ ...formData, contractSignedDate: new Date(v).toISOString() })}
                        />
                        <Input label="Timezone" placeholder="e.g. GMT-3" value={formData.timezone} onChange={v => setFormData({ ...formData, timezone: v })} />
                        <Input label="Language" value={formData.language} onChange={v => setFormData({ ...formData, language: v })} />
                        <Input label="Commission" placeholder="e.g. 15%" value={formData.commissionRate} onChange={v => setFormData({ ...formData, commissionRate: v })} />

                    </div>
                </section>

                {/* SECTION 5: PROFILE DETAILS - MOVED TO RIGHT COLUMN */}
                <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="text-purple-500" /> Agency Profile
                    </h2>

                    {/* Use 1 column grid for sidebar */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Recruiting Countries */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Countries Recruited From</label>
                            <div className="space-y-3">
                                {(formData.recruitingCountries || []).map((country, idx) => {
                                    // Sort options: Agency Country first, then alphabetical
                                    const allCountries = Object.keys(countryToRegion).sort();
                                    const agencyCountry = formData.country;
                                    let sortedOptions = allCountries;

                                    if (agencyCountry) {
                                        sortedOptions = [
                                            agencyCountry,
                                            ...allCountries.filter(c => c !== agencyCountry)
                                        ];
                                    }

                                    return (
                                        <div key={idx} className="flex gap-2">
                                            <div className="flex-1">
                                                <SearchableSelect
                                                    options={sortedOptions}
                                                    value={country}
                                                    onChange={(v) => {
                                                        const updated = [...(formData.recruitingCountries || [])];
                                                        updated[idx] = v;
                                                        setFormData({ ...formData, recruitingCountries: updated });
                                                    }}
                                                    placeholder="Select Country..."
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = (formData.recruitingCountries || []).filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, recruitingCountries: updated });
                                                }}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        recruitingCountries: [...(formData.recruitingCountries || []), formData.country || '']
                                    })}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
                                >
                                    <Plus size={16} /> Add Country
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                        {/* Grades Offered */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Grades Offered</label>
                            <CheckboxGroup
                                options={['Elementary', 'Middle School', 'High School', 'College/University']}
                                selected={formData.gradesOffered || []}
                                onChange={v => setFormData({ ...formData, gradesOffered: v })}
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Duration</label>
                            <CheckboxGroup
                                options={['Short Term', 'Semester', 'Academic Year', 'Calendar Year', 'Summer']}
                                selected={formData.duration || []}
                                onChange={v => setFormData({ ...formData, duration: v })}
                            />
                        </div>

                        {/* Target Countries */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Target Countries</label>
                            <CountrySelector
                                selected={formData.targetCountries || []}
                                onChange={v => setFormData({ ...formData, targetCountries: v })}
                            />
                        </div>
                    </div>
                </section>
            </div>


            {/* OPTIONAL FOOTER */}
            {
                renderFooter && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 flex justify-end gap-4 shadow-xl-up animate-in slide-in-from-bottom-5">
                        {cancelHref ? (
                            <Link href={cancelHref}>
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={() => { }} // Default cancel action if no href? Or just don't render? Using href for now.
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Save size={18} />
                            {isSubmitting ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                )
            }
        </form >
    );
};
