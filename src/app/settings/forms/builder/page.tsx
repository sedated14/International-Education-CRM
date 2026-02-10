'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Copy, Check, Eye } from 'lucide-react';
import { FormConfig, FormFieldID } from '../../../../types';
import { Input } from '../../../../components/ui/FormComponents';

const AVAILABLE_FIELDS: { id: FormFieldID; label: string; section: string }[] = [
    // About
    { id: 'firstName', label: 'First Name', section: 'About' },
    { id: 'middleName', label: 'Middle Name', section: 'About' },
    { id: 'lastName', label: 'Last Name', section: 'About' },
    { id: 'age', label: 'Age', section: 'About' },
    { id: 'dob', label: 'Date of Birth', section: 'About' },
    { id: 'gender', label: 'Gender', section: 'About' },
    { id: 'nationality', label: 'Nationality', section: 'About' },
    { id: 'residence', label: 'Country of Residence', section: 'About' },
    { id: 'studentEmail', label: 'Student Email', section: 'About' },
    { id: 'phoneNumber', label: 'Phone Number', section: 'About' },
    { id: 'whatsappNumber', label: 'WhatsApp Number', section: 'About' },

    // Academics
    { id: 'currentSchool', label: 'Current School', section: 'Academics' },
    { id: 'currentGrade', label: 'Current Grade', section: 'Academics' },
    { id: 'graduatedInHomeCountry', label: 'Graduated in Home Country', section: 'Academics' },
    { id: 'gpa', label: 'GPA', section: 'Academics' },
    { id: 'englishLevel', label: 'English Level', section: 'Academics' },

    // Destinations
    { id: 'destinations', label: 'Desired Destinations', section: 'Destinations' },
    { id: 'targetGrades', label: 'Requested Grade', section: 'Destinations' },
    { id: 'seekingGraduation', label: 'Seeking Graduation', section: 'Destinations' },

    // Interests
    { id: 'sports', label: 'Sports', section: 'Interests' },
    { id: 'hobbies', label: 'Hobbies', section: 'Interests' },
    { id: 'favoriteSubject', label: 'Favorite Subject', section: 'Interests' },
    { id: 'personality', label: 'Personality', section: 'Interests' },
    { id: 'budget', label: 'Budget', section: 'Interests' },

    // Health
    { id: 'allergies', label: 'Allergies', section: 'Health' },
    { id: 'medicalInfo', label: 'Medical Info', section: 'Health' },
    { id: 'dietaryRestrictions', label: 'Dietary Restrictions', section: 'Health' },

    // Other
    { id: 'essay', label: 'Essay / Personal Statement', section: 'Other' },
    { id: 'otherInfo', label: 'Other Information', section: 'Other' },
    { id: 'preferredCommunication', label: 'Preferred Communication', section: 'Other' },
];

function FormBuilderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const formId = searchParams.get('id');

    const [loading, setLoading] = useState(!!formId);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState('New Website Form');
    const [emails, setEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [includedFields, setIncludedFields] = useState<FormFieldID[]>([
        'firstName', 'lastName', 'studentEmail', 'residence', 'nationality'
    ]); // Defaults

    // Embed Code State
    const [showEmbed, setShowEmbed] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (formId) {
            fetchForm(formId);
            setShowEmbed(true);
        }
    }, [formId]);

    const fetchForm = async (id: string) => {
        try {
            const res = await fetch(`/api/forms/${id}`);
            const data = await res.json();
            if (data && !data.error) {
                setName(data.name);
                setEmails(data.notificationEmails || []);
                setIncludedFields(data.includedFields || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {
            name,
            notificationEmails: emails,
            includedFields
        };

        try {
            const url = formId ? `/api/forms/${formId}` : '/api/forms';
            const method = formId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                if (!formId) {
                    router.replace(`/settings/forms/builder?id=${data.id}`);
                }
                alert('Form saved successfully!');
            } else {
                alert('Error saving form');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving form');
        } finally {
            setSaving(false);
        }
    };

    const toggleField = (id: FormFieldID) => {
        setIncludedFields(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    const addEmail = () => {
        if (newEmail && newEmail.includes('@')) {
            setEmails([...emails, newEmail]);
            setNewEmail('');
        }
    };

    const removeEmail = (email: string) => {
        setEmails(emails.filter(e => e !== email));
    };

    const copyEmbedCode = () => {
        if (!formId) return;
        const code = `<iframe src="${window.location.origin}/public/form/${formId}" width="100%" height="800px" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    // Group fields by section
    const groupedFields = AVAILABLE_FIELDS.reduce((acc, field) => {
        if (!acc[field.section]) acc[field.section] = [];
        acc[field.section].push(field);
        return acc;
    }, {} as Record<string, typeof AVAILABLE_FIELDS>);

    return (
        <div className="p-8 max-w-7xl mx-auto pb-40">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/settings/forms" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        {formId ? 'Edit Form' : 'Create New Form'}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-1 space-y-8">

                    {/* General Settings */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">General Settings</h2>
                        <Input label="Form Name" value={name} onChange={setName} placeholder="e.g. Website Main Inquiry" />
                    </div>

                    {/* Email Notifications */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4">Email Notifications</h2>
                        <p className="text-xs text-gray-500 mb-4">Submissions will be sent to these addresses.</p>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter email address"
                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                            />
                            <button
                                onClick={addEmail}
                                className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-80"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {emails.map(email => (
                                <div key={email} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm">
                                    <span>{email}</span>
                                    <button onClick={() => removeEmail(email)} className="text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {emails.length === 0 && <p className="text-sm text-gray-400 italic">No recipients added.</p>}
                        </div>
                    </div>

                    {/* Embed Code (Only if saved) */}
                    {showEmbed && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <h2 className="font-bold text-lg mb-4 text-blue-900 dark:text-blue-100">Embed Code</h2>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mb-4">Copy and paste this code into your website.</p>

                            <div className="relative">
                                <pre className="bg-white dark:bg-gray-950 p-3 rounded-lg text-[10px] text-gray-600 dark:text-gray-400 overflow-x-auto border border-blue-200 dark:border-blue-800/50">
                                    {`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/public/form/${formId}" width="100%" height="800px" frameborder="0"></iframe>`}
                                </pre>
                                <button
                                    onClick={copyEmbedCode}
                                    className="absolute top-2 right-2 p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="mt-4 text-center">
                                <Link href={`/public/form/${formId}`} target="_blank" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                                    <Eye size={12} /> Preview Live Page
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Field Selection */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-xl">Form Fields</h2>
                            <div className="text-sm text-gray-500">
                                <span className="font-bold text-black dark:text-white">{includedFields.length}</span> fields selected
                            </div>
                        </div>

                        <div className="space-y-8">
                            {Object.entries(groupedFields).map(([section, fields]) => (
                                <div key={section}>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 dark:border-gray-800 pb-2">
                                        {section}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {fields.map(field => (
                                            <button
                                                key={field.id}
                                                onClick={() => toggleField(field.id)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${includedFields.includes(field.id)
                                                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md'
                                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                    }`}
                                            >
                                                <span className="font-medium text-sm">{field.label}</span>
                                                {includedFields.includes(field.id) && <Check size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-end items-center gap-4 z-50">
                <Link href="/settings/forms" className="px-6 py-3 font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Cancel
                </Link>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-90 shadow-lg transform active:scale-95 transition-all flex items-center gap-2"
                >
                    {saving ? 'Saving...' : <><Save size={18} /> Save Form</>}
                </button>
            </div>
        </div>
    );
}

export default function FormBuilderPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading Builder...</div>}>
            <FormBuilderContent />
        </Suspense>
    );
}
