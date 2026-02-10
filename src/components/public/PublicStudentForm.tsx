'use client';

import React, { useState, useEffect } from 'react';
import { FormFieldID } from '../../types';
import { User, BookOpen, MapPin, Heart, FileText, Send, CheckCircle2 } from 'lucide-react';
import { COUNTRIES } from '../../data/countries';

// Simpler Input Component for Public Form to avoid dependency issues if internal UI components change
const PublicInput = ({
    label, value, onChange, type = 'text', required = false, isTextArea = false, placeholder = ''
}: {
    label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; isTextArea?: boolean; placeholder?: string;
}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {isTextArea ? (
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none bg-white dark:bg-gray-800 transition-all min-h-[100px]"
                placeholder={placeholder}
                required={required}
            />
        ) : (
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none bg-white dark:bg-gray-800 transition-all"
                placeholder={placeholder}
                required={required}
            />
        )}
    </div>
);

const PublicSelect = ({
    label, value, onChange, options, required = false
}: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
}) => (
    <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none bg-white dark:bg-gray-800 transition-all appearance-none"
            required={required}
        >
            <option value="">Select...</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
);

const GRADE_OPTIONS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const ENGLISH_LEVELS = ["Low", "Intermediate", "Advanced"];

interface PublicStudentFormProps {
    formId: string;
    includedFields: FormFieldID[];
    onSubmitSuccess?: () => void;
}

export default function PublicStudentForm({ formId, includedFields, onSubmitSuccess }: PublicStudentFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Flattened State
    const [formData, setFormData] = useState<Record<string, any>>({
        firstName: '', middleName: '', lastName: '', age: '',
        dob: '', gender: '', nationality: '', residence: '',
        studentEmail: '', phoneNumber: '', whatsappNumber: '',
        currentSchool: '', currentGrade: '', graduatedInHomeCountry: false,
        gpa: '', englishLevel: '',
        destinations: [], targetGrade: '', seekingGraduation: false, // Changed targetGrades to targetGrade
        sports: '', hobbies: '', favoriteSubject: '', personality: '', budget: '',
        allergies: '', medicalInfo: '', dietaryRestrictions: '',
        essay: '', otherInfo: '', preferredCommunication: []
    });

    const isFieldVisible = (id: FormFieldID) => includedFields.includes(id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Map single targetGrade to all selected destinations
            const targetGradesMap = (formData.destinations as string[]).reduce((acc, dest) => ({
                ...acc,
                [dest]: formData.targetGrade
            }), {} as Record<string, string>);

            const submissionData = {
                formId,
                leadData: {
                    studentName: [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' '),
                    country: formData.residence || formData.nationality || 'Unknown',
                    studentProfile: {
                        ...formData,
                        targetGrades: targetGradesMap, // Include the mapped grades
                        // Fix array splits for text inputs
                        sports: formData.sports.split(',').map((s: string) => s.trim()).filter(Boolean),
                        hobbies: formData.hobbies.split(',').map((s: string) => s.trim()).filter(Boolean),
                        allergies: formData.allergies.split(',').map((s: string) => s.trim()).filter(Boolean),
                        dietaryRestrictions: formData.dietaryRestrictions.split(',').map((s: string) => s.trim()).filter(Boolean),
                    }
                }
            };

            const res = await fetch('/api/public/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            if (res.ok) {
                const data = await res.json();
                const emailErrors = [];
                if (data.emailResults?.student?.error) emailErrors.push(`Student Email: ${data.emailResults.student.error}`);
                if (data.emailResults?.admin?.error) emailErrors.push(`Admin Email: ${data.emailResults.admin.error}`);

                if (emailErrors.length > 0) {
                    alert(`Form submitted, but some emails failed to send:\n${emailErrors.join('\n')}`);
                }

                setSubmitted(true);
                if (onSubmitSuccess) onSubmitSuccess();
            } else {
                const errorData = await res.json();
                console.error("Submission Data:", JSON.stringify(submissionData, null, 2));
                alert(`Error submitting form: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert(`Error submitting form: ${(error as Error).message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Thank You!</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Your information has been received. We will be in touch with you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 pb-10">

            {/* About Section */}
            {(isFieldVisible('firstName') || isFieldVisible('lastName') || isFieldVisible('studentEmail')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <User className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">About You</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isFieldVisible('firstName') && <PublicInput label="First Name" value={formData.firstName} onChange={v => setFormData({ ...formData, firstName: v })} required />}
                        {isFieldVisible('middleName') && <PublicInput label="Middle Name" value={formData.middleName} onChange={v => setFormData({ ...formData, middleName: v })} />}
                        {isFieldVisible('lastName') && <PublicInput label="Last Name" value={formData.lastName} onChange={v => setFormData({ ...formData, lastName: v })} required />}
                        {isFieldVisible('age') && <PublicInput label="Age" type="number" value={formData.age} onChange={v => setFormData({ ...formData, age: v })} />}
                        {isFieldVisible('dob') && <PublicInput label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({ ...formData, dob: v })} />}
                        {isFieldVisible('gender') && <PublicSelect label="Gender" options={['Male', 'Female']} value={formData.gender} onChange={v => setFormData({ ...formData, gender: v })} />}
                        {isFieldVisible('nationality') && <PublicSelect label="Nationality" options={COUNTRIES} value={formData.nationality} onChange={v => setFormData({ ...formData, nationality: v })} />}
                        {isFieldVisible('residence') && <PublicSelect label="Country of Residence" options={COUNTRIES} value={formData.residence} onChange={v => setFormData({ ...formData, residence: v })} />}
                    </div>
                    {isFieldVisible('studentEmail') && <PublicInput label="Email Address" type="email" value={formData.studentEmail} onChange={v => setFormData({ ...formData, studentEmail: v })} required />}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isFieldVisible('phoneNumber') && <PublicInput label="Phone Number" value={formData.phoneNumber} onChange={v => setFormData({ ...formData, phoneNumber: v })} />}
                        {isFieldVisible('whatsappNumber') && <PublicInput label="WhatsApp Number" value={formData.whatsappNumber} onChange={v => setFormData({ ...formData, whatsappNumber: v })} />}
                    </div>
                </section>
            )}

            {/* Academics Section */}
            {(isFieldVisible('currentSchool') || isFieldVisible('currentGrade') || isFieldVisible('gpa') || isFieldVisible('englishLevel')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <BookOpen className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Academics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isFieldVisible('currentSchool') && <PublicInput label="Current School" value={formData.currentSchool} onChange={v => setFormData({ ...formData, currentSchool: v })} />}
                        {isFieldVisible('currentGrade') && <PublicSelect label="Current Grade" options={GRADE_OPTIONS} value={formData.currentGrade} onChange={v => setFormData({ ...formData, currentGrade: v })} />}
                        {isFieldVisible('graduatedInHomeCountry') && (
                            <div className="flex items-center gap-2 mt-6">
                                <input type="checkbox" checked={formData.graduatedInHomeCountry} onChange={e => setFormData({ ...formData, graduatedInHomeCountry: e.target.checked })} className="w-5 h-5 rounded border-gray-300" />
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Graduated in Home Country?</label>
                            </div>
                        )}
                        {isFieldVisible('gpa') && <PublicInput label="GPA" value={formData.gpa} onChange={v => setFormData({ ...formData, gpa: v })} />}
                        {isFieldVisible('englishLevel') && <PublicSelect label="English Level" options={ENGLISH_LEVELS} value={formData.englishLevel} onChange={v => setFormData({ ...formData, englishLevel: v })} />}
                    </div>
                </section>
            )}

            {/* Destination Section */}
            {(isFieldVisible('destinations') || isFieldVisible('targetGrades') || isFieldVisible('seekingGraduation')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <MapPin className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Destinations</h3>
                    </div>

                    {isFieldVisible('destinations') && (
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Where do you want to study?</label>
                            <div className="flex flex-wrap gap-2">
                                {['USA', 'Canada', 'Online US High School', 'Online Canada High School'].map(dest => (
                                    <button
                                        key={dest}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.destinations as string[];
                                            const exists = current.includes(dest);
                                            setFormData({
                                                ...formData,
                                                destinations: exists ? current.filter(d => d !== dest) : [...current, dest]
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${(formData.destinations as string[]).includes(dest)
                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}
                                    >
                                        {dest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {isFieldVisible('targetGrades') && (formData.destinations as string[]).length > 0 && (
                        <PublicSelect
                            label={`Requested Grade for ${(formData.destinations as string[]).join(', ')}`}
                            options={GRADE_OPTIONS}
                            value={formData.targetGrade}
                            onChange={v => setFormData({ ...formData, targetGrade: v })}
                        />
                    )}

                    {isFieldVisible('seekingGraduation') && formData.targetGrade === '12th' && (
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Are you seeking graduation?</label>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, seekingGraduation: true })}
                                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${formData.seekingGraduation
                                        ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    Yes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, seekingGraduation: false })}
                                    className={`flex-1 py-2 rounded-lg font-bold border transition-all ${!formData.seekingGraduation
                                        ? 'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                                        }`}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* Interests Section */}
            {(isFieldVisible('sports') || isFieldVisible('hobbies') || isFieldVisible('favoriteSubject') || isFieldVisible('budget')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <Heart className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Interests & Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isFieldVisible('sports') && <PublicInput label="Sports" value={formData.sports} onChange={v => setFormData({ ...formData, sports: v })} placeholder="e.g. Soccer, Basketball" />}
                        {isFieldVisible('hobbies') && <PublicInput label="Hobbies" value={formData.hobbies} onChange={v => setFormData({ ...formData, hobbies: v })} placeholder="e.g. Reading, Music" />}
                        {isFieldVisible('favoriteSubject') && <PublicInput label="Favorite Subject" value={formData.favoriteSubject} onChange={v => setFormData({ ...formData, favoriteSubject: v })} />}
                        {isFieldVisible('personality') && <PublicInput label="Personality" value={formData.personality} onChange={v => setFormData({ ...formData, personality: v })} />}
                        {isFieldVisible('budget') && <PublicInput label="Budget (USD)" value={formData.budget} onChange={v => setFormData({ ...formData, budget: v })} />}
                    </div>
                </section>
            )}

            {/* Health Section */}
            {(isFieldVisible('allergies') || isFieldVisible('medicalInfo') || isFieldVisible('dietaryRestrictions')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <Heart className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Health</h3>
                    </div>
                    {isFieldVisible('allergies') && <PublicInput label="Allergies" value={formData.allergies} onChange={v => setFormData({ ...formData, allergies: v })} />}
                    {isFieldVisible('dietaryRestrictions') && <PublicInput label="Dietary Restrictions" value={formData.dietaryRestrictions} onChange={v => setFormData({ ...formData, dietaryRestrictions: v })} />}
                    {isFieldVisible('medicalInfo') && <PublicInput label="Medical Information" value={formData.medicalInfo} onChange={v => setFormData({ ...formData, medicalInfo: v })} isTextArea />}
                </section>
            )}

            {/* Other Section */}
            {(isFieldVisible('essay') || isFieldVisible('otherInfo') || isFieldVisible('preferredCommunication')) && (
                <section className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-2 mb-4">
                        <FileText className="text-gray-400" size={20} />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Additional Info</h3>
                    </div>
                    {isFieldVisible('essay') && <PublicInput label="Why do you want to study abroad?" value={formData.essay} onChange={v => setFormData({ ...formData, essay: v })} isTextArea />}
                    {isFieldVisible('otherInfo') && <PublicInput label="Anything else we should know?" value={formData.otherInfo} onChange={v => setFormData({ ...formData, otherInfo: v })} isTextArea />}

                    {isFieldVisible('preferredCommunication') && (
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Preferred Communication Method</label>
                            <div className="flex flex-wrap gap-2">
                                {['Email', 'Phone', 'Text'].map(method => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.preferredCommunication as string[];
                                            const exists = current.includes(method);
                                            setFormData({
                                                ...formData,
                                                preferredCommunication: exists ? current.filter(m => m !== method) : [...current, method]
                                            });
                                        }}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${(formData.preferredCommunication as string[]).includes(method)
                                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                                            }`}
                                    >
                                        {method}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                    {submitting ? 'Submitting...' : <><Send size={20} /> Submit Inquiry</>}
                </button>
            </div>

        </form>
    );
}
