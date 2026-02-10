'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, Code, Loader2, ExternalLink } from 'lucide-react';
import { FormConfig } from '../../../types';

export default function FormsPage() {
    const [forms, setForms] = useState<FormConfig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await fetch('/api/forms');
            const data = await res.json();
            setForms(data);
        } catch (error) {
            console.error('Failed to fetch forms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this form?')) return;

        try {
            await fetch(`/api/forms/${id}`, { method: 'DELETE' });
            fetchForms();
        } catch (error) {
            console.error('Failed to delete form', error);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Lead Forms</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Create and manage embeddable forms for your websites.</p>
                </div>
                <Link
                    href="/settings/forms/builder"
                    className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-80 transition-all"
                >
                    <Plus size={20} />
                    Create New Form
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : forms.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Code size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Forms Created</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">Create your first form to start collecting student leads from your website.</p>
                    <Link
                        href="/settings/forms/builder"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold hover:opacity-80 transition-all"
                    >
                        <Plus size={20} />
                        Create Form
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {forms.map(form => (
                        <div key={form.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{form.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {form.id.slice(0, 8)}...</p>
                                </div>
                                <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                                    Active
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">{form.includedFields.length}</span> Fields Included
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-medium">{form.notificationEmails.length}</span> Email Recipients
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                                <Link
                                    href={`/settings/forms/builder?id=${form.id}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <Edit size={16} />
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(form.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="mt-3">
                                <Link
                                    href={`/public/form/${form.id}`}
                                    target="_blank"
                                    className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <ExternalLink size={14} /> View Public Form
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
