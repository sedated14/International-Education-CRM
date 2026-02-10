'use client';

import React, { useEffect, useState } from 'react';
import PublicStudentForm from '../../../../components/public/PublicStudentForm';
import { FormConfig } from '../../../../types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ClientPublicFormPage({ formId }: { formId: string }) {
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/forms/${formId}`);
                if (!res.ok) throw new Error('Form not found');
                const data = await res.json();
                setFormConfig(data);
            } catch (err) {
                setError('Form not found or unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchForm();
    }, [formId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    if (error || !formConfig) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="text-center text-red-500">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Error</h1>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{formConfig.name}</h1>
                </div>

                <PublicStudentForm
                    formId={formId}
                    includedFields={formConfig.includedFields}
                />

                <div className="mt-12 text-center text-xs text-gray-300 dark:text-gray-700">
                    Powered by Apex CRM
                </div>
            </div>
        </div>
    );
}
