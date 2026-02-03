"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, User, MapPin, BookOpen, Heart, DollarSign, FileText, CheckCircle2, ArrowRight, Phone, MessageCircle, Globe, ChevronDown, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useLeads } from '../../context/LeadContext';
import { Lead } from '../../types';

export default function ApplyPage() {
    const router = useRouter();
    const { addLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        studentName: '',
        dob: '',
        gender: '',
        nationality: '',
        residence: '',
        studentEmail: '',
        phoneNumber: '',
        whatsappNumber: '',

        // Schooling
        currentSchool: '',
        currentGrade: '',
        graduatedInHomeCountry: false, // New Field
        gpa: '',
        englishLevel: '',

        // Destination (Dynamic)
        destinations: [] as string[],
        targetGrades: {
            USA: '',
            Canada: '',
            Online: ''
        },
        seekingGraduation: false, // New Field

        // Personal Details
        budget: '',
        sports: '',
        hobbies: '',
        favoriteSubject: '',
        personality: '',

        // Health
        allergies: '',
        medicalInfo: '',
        dietaryRestrictions: '',

        // Essay
        essay: '',
        otherInfo: '',

        // Preference
        preferredCommunication: [] as string[]
    });

    const handleDestinationChange = (dest: string) => {
        setFormData(prev => {
            const exists = prev.destinations.includes(dest);
            return {
                ...prev,
                destinations: exists
                    ? prev.destinations.filter(d => d !== dest)
                    : [...prev.destinations, dest]
            };
        });
    };

    const handleTargetGradeChange = (country: 'USA' | 'Canada' | 'Online', value: string) => {
        setFormData(prev => ({
            ...prev,
            targetGrades: {
                ...prev.targetGrades,
                [country]: value
            }
        }));
    };

    const handleCommunicationChange = (method: string) => {
        setFormData(prev => {
            const exists = prev.preferredCommunication.includes(method);
            return {
                ...prev,
                preferredCommunication: exists
                    ? prev.preferredCommunication.filter(m => m !== method)
                    : [...prev.preferredCommunication, method]
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Construct New Lead Object
        const newLead: Lead = {
            id: Date.now(), // Simple ID generation
            title: `Inquiry: Student - ${formData.nationality || 'Unknown'}`,
            type: 'Student',
            source: 'Form',
            createdAt: new Date().toISOString(),
            followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(), // 72h default
            studentName: formData.studentName,
            country: formData.residence || formData.nationality || 'Unknown',
            status: 'Inquiry',
            score: 0,
            timestamp: 'Just now', // Can be refined
            studentProfile: {
                age: 0, // Need to calc from DOB
                dob: formData.dob,
                gender: formData.gender,
                nationality: formData.nationality,
                residence: formData.residence,
                phoneNumber: formData.phoneNumber,
                whatsappNumber: formData.whatsappNumber,
                currentSchool: formData.currentSchool,
                currentGrade: formData.currentGrade,
                graduatedInHomeCountry: formData.graduatedInHomeCountry,
                gpa: formData.gpa,
                englishLevel: (formData.englishLevel as 'Low' | 'Intermediate' | 'Advanced') || 'Intermediate',
                desiredDestination: formData.destinations as any,
                targetGrades: formData.targetGrades,
                seekingGraduation: formData.seekingGraduation,
                sports: formData.sports.split(',').map(s => s.trim()).filter(Boolean),
                hobbies: formData.hobbies.split(',').map(s => s.trim()).filter(Boolean),
                favoriteSubject: formData.favoriteSubject,
                personality: formData.personality,
                allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
                medicalInfo: formData.medicalInfo,
                dietaryRestrictions: formData.dietaryRestrictions.split(',').map(s => s.trim()).filter(Boolean),
                budget: formData.budget,
                essay: formData.essay,
                preferredCommunication: formData.preferredCommunication as any,
                otherInfo: formData.otherInfo
            }
        };

        addLead(newLead);

        setSubmitted(true);
        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 flex items-center justify-center p-4 font-sans">
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[32px] shadow-xl max-w-lg w-full text-center border border-white/50 dark:border-gray-800">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 dark:text-green-400 animate-in zoom-in duration-300">
                        <CheckCircle2 size={40} strokeWidth={3} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Inquiry Received!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-lg">
                        Thank you for your inquiry. You will be contacted soon via your preferred method(s) of communication ({formData.preferredCommunication.join(', ')}).
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] dark:bg-gray-950 font-sans selection:bg-orange-100 dark:selection:bg-orange-900/30 selection:text-orange-900 dark:selection:text-orange-400">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #E0E7FF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #FFF7ED 0%, transparent 30%)' }}
            />

            <div className="relative max-w-3xl mx-auto px-6 py-12 md:py-20">

                {/* Header */}
                <div className="text-center mb-12 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full shadow-sm border border-white/50 dark:border-white/10 mb-6">
                        <Sparkles size={14} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">Student Inquiry / Consultation</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Begin Your Journey.</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                        Complete this inquiry form to receive school recommendations or schedule a consultation.
                    </p>
                </div>

                {/* Form Card */}
                <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white dark:border-white/10 p-8 md:p-12 animate-in slide-in-from-bottom-10 duration-700 delay-150">

                    <div className="space-y-10">

                        {/* SECTION 1: ABOUT YOU */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <User size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">About You</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="Full Name" placeholder="Mario Rossi" value={formData.studentName} onChange={(v: any) => setFormData({ ...formData, studentName: v })} />
                                <Input type="date" label="Date of Birth" value={formData.dob} onChange={(v: any) => setFormData({ ...formData, dob: v })} />
                                <Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={(v: any) => setFormData({ ...formData, gender: v })} />
                                <div className="hidden md:block"></div> {/* Spacer */}
                                <Combobox label="Nationality" placeholder="Select Nationality..." icon={<Globe size={16} />} value={formData.nationality} onChange={(v: any) => setFormData({ ...formData, nationality: v })} options={COUNTRIES} />
                                <Combobox label="Country of Residence" placeholder="Select Country..." icon={<MapPin size={16} />} value={formData.residence} onChange={(v: any) => setFormData({ ...formData, residence: v })} options={COUNTRIES} />
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="Email Address" placeholder="hello@example.com" value={formData.studentEmail} onChange={(v: any) => setFormData({ ...formData, studentEmail: v })} />
                                <Input label="Phone Number" placeholder="+1 234 567 890" icon={<Phone size={16} />} value={formData.phoneNumber} onChange={(v: any) => setFormData({ ...formData, phoneNumber: v })} />
                                <Input label="WhatsApp Number" placeholder="+1 234 567 890" icon={<MessageCircle size={16} />} value={formData.whatsappNumber} onChange={(v: any) => setFormData({ ...formData, whatsappNumber: v })} />
                            </div>
                        </section>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                        {/* SECTION 2: ACADEMICS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <BookOpen size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Academics</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="Current School" placeholder="International High School..." value={formData.currentSchool} onChange={(v: any) => setFormData({ ...formData, currentSchool: v })} />
                                <Select label="Current Grade" options={GRADE_OPTIONS} value={formData.currentGrade} onChange={(v: any) => setFormData({ ...formData, currentGrade: v })} />
                            </div>

                            {/* Conditional: Graduated in Home Country */}
                            {formData.currentGrade === '12th' && (
                                <div className="mt-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Graduated in Home Country?</label>
                                    <div className="flex gap-3">
                                        {['Yes', 'No'].map(opt => (
                                            <label key={opt} className={`
                                                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none
                                                ${(formData.graduatedInHomeCountry === (opt === 'Yes'))
                                                    ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                                                    : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                            `}>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    checked={formData.graduatedInHomeCountry === (opt === 'Yes')}
                                                    onChange={() => setFormData({ ...formData, graduatedInHomeCountry: opt === 'Yes' })}
                                                />
                                                <span className="font-bold text-sm">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <Input label="Current GPA" placeholder="3.8 / 4.0" value={formData.gpa} onChange={(v: any) => setFormData({ ...formData, gpa: v })} />
                                <Select label="English Level" options={["Low", "Intermediate", "Advanced"]} value={formData.englishLevel} onChange={(v: any) => setFormData({ ...formData, englishLevel: v })} />
                            </div>
                        </section>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                        {/* SECTION 3: DESTINATION (Dynamic) */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <MapPin size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Destination</h2>
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Where do you want to study?</p>
                                <div className="flex flex-wrap gap-4">
                                    {['USA', 'Canada', 'Online'].map(country => (
                                        <label key={country} className={`
                                            flex items-center gap-3 px-6 py-4 rounded-2xl border-2 cursor-pointer transition-all select-none
                                            ${formData.destinations.includes(country)
                                                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100'
                                                : 'border-white dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.destinations.includes(country)}
                                                onChange={() => handleDestinationChange(country)}
                                            />
                                            <span className="font-bold">{country}</span>
                                            {formData.destinations.includes(country) && <CheckCircle2 size={16} className="text-purple-500" />}
                                        </label>
                                    ))}
                                </div>

                                {/* Dynamic Grade Inputs */}
                                {formData.destinations.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-top-2">
                                        {formData.destinations.includes('USA') && (
                                            <Select
                                                label="Requested Grade for USA"
                                                options={GRADE_OPTIONS}
                                                value={formData.targetGrades.USA}
                                                onChange={(v: any) => handleTargetGradeChange('USA', v)}
                                            />
                                        )}
                                        {formData.destinations.includes('Canada') && (
                                            <Select
                                                label="Requested Grade for Canada"
                                                options={GRADE_OPTIONS}
                                                value={formData.targetGrades.Canada}
                                                onChange={(v: any) => handleTargetGradeChange('Canada', v)}
                                            />
                                        )}
                                        {formData.destinations.includes('Online') && (
                                            <Select
                                                label="Requested Grade for Online School"
                                                options={GRADE_OPTIONS}
                                                value={formData.targetGrades.Online}
                                                onChange={(v: any) => handleTargetGradeChange('Online', v)}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Conditional: Seeking Graduation */}
                                {(Object.values(formData.targetGrades).some(g => g === '12th')) && (
                                    <div className="mt-4 bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Seeking Graduation?</label>
                                        <div className="flex gap-3">
                                            {['Yes', 'No'].map(opt => (
                                                <label key={opt} className={`
                                                    flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none
                                                    ${(formData.seekingGraduation === (opt === 'Yes'))
                                                        ? 'border-purple-500 bg-purple-500 text-white shadow-md'
                                                        : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                                `}>
                                                    <input
                                                        type="radio"
                                                        className="hidden"
                                                        checked={formData.seekingGraduation === (opt === 'Yes')}
                                                        onChange={() => setFormData({ ...formData, seekingGraduation: opt === 'Yes' })}
                                                    />
                                                    <span className="font-bold text-sm">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <div className="h-px bg-gray-100 w-full" />

                        {/* SECTION 4: INTERESTS & LIFESTYLE */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                    <Heart size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Interests & Health</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="Sports Practice & Likes" placeholder="Soccer, Tennis..." value={formData.sports} onChange={(v: any) => setFormData({ ...formData, sports: v })} />
                                <Input label="Hobbies" placeholder="Reading, Music..." value={formData.hobbies} onChange={(v: any) => setFormData({ ...formData, hobbies: v })} />
                                <Input label="Favorite Subjects" placeholder="Math, Art..." value={formData.favoriteSubject} onChange={(v: any) => setFormData({ ...formData, favoriteSubject: v })} />
                                <Input label="Personality" placeholder="Extroverted, Social..." value={formData.personality} onChange={(v: any) => setFormData({ ...formData, personality: v })} />
                                <Input label="Dietary Restrictions" placeholder="Vegetarian, etc..." value={formData.dietaryRestrictions} onChange={(v: any) => setFormData({ ...formData, dietaryRestrictions: v })} />
                                <Input label="Allergies (esp. Pets)" placeholder="Cats, Peanuts..." value={formData.allergies} onChange={(v: any) => setFormData({ ...formData, allergies: v })} />
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                <Input label="Medical Information" placeholder="Current medications, conditions..." value={formData.medicalInfo} onChange={(v: any) => setFormData({ ...formData, medicalInfo: v })} isTextArea />
                                <Input label="Budget" placeholder="Approximate budget per year..." icon={<DollarSign size={16} />} value={formData.budget} onChange={(v: any) => setFormData({ ...formData, budget: v })} />
                            </div>
                        </section>

                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

                        {/* SECTION 5: FINAL THOUGHTS */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Inquiry Details</h2>
                            </div>

                            <Input
                                label="Why do you want to study abroad?"
                                placeholder="Tell us your story..."
                                value={formData.essay}
                                onChange={(v: any) => setFormData({ ...formData, essay: v })}
                                isTextArea
                                rows={4}
                            />
                            <Input
                                label="Anything else we should know?"
                                placeholder="Additional context..."
                                value={formData.otherInfo}
                                onChange={(v: any) => setFormData({ ...formData, otherInfo: v })}
                                isTextArea
                            />

                            {/* Preferred Communication - Multi-select Checkboxes */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 rounded-3xl">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preferred Method of Communication</label>
                                <div className="flex flex-wrap gap-4">
                                    {['Email', 'Phone', 'Text'].map(method => (
                                        <label key={method} className={`
                                            flex items-center gap-3 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all select-none
                                            ${formData.preferredCommunication.includes(method)
                                                ? 'border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-md'
                                                : 'border-transparent bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}
                                        `}>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={formData.preferredCommunication.includes(method)}
                                                onChange={() => handleCommunicationChange(method)}
                                            />
                                            {formData.preferredCommunication.includes(method) ? <CheckCircle2 size={18} className="text-black dark:text-white" /> : <div className="w-[18px]" />}
                                            <span className="font-bold text-sm">{method}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-4">Select all that apply. We will use these methods to contact you.</p>
                            </div>
                        </section>

                    </div>

                    {/* Submit Button */}
                    <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={isSubmitting || formData.preferredCommunication.length === 0}
                            className="w-full group relative flex items-center justify-center gap-3 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-black text-lg hover:bg-gray-900 dark:hover:bg-gray-200 hover:shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse">Sending Inquiry...</span>
                            ) : (
                                <>
                                    <span>Submit Inquiry</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                </form>

                <p className="text-center text-gray-400 text-sm font-medium mt-8">
                    &copy; 2026 Apex CRM. Secure Inquiry Portal.
                </p>

            </div >
        </div >
    );
}

// --- Reusable Components ---

const Input = ({ label, placeholder, value, onChange, type = "text", isTextArea = false, rows = 3, icon }: any) => (
    <div className="group">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
            {isTextArea ? (
                <textarea
                    className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none transition-all resize-none"
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={rows}
                />
            ) : (
                <input
                    type={type}
                    className={`w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none transition-all ${icon ? 'pl-10' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            )}
        </div>
    </div>
);

const Select = ({ label, options, value, onChange }: any) => (
    <div className="group">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>
        <div className="relative">
            <select
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white outline-none appearance-none cursor-pointer transition-all"
                value={value}
                onChange={e => onChange(e.target.value)}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
            </div>
        </div>
    </div>
);

// Searchable Combobox Component
const Combobox = ({ label, placeholder, value, onChange, options, icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial value
    useEffect(() => {
        if (!isOpen) {
            // When closing, reset search term to match value or clear if empty
            // But we don't want to clear search if user is just clicking out
            // Actually, we usually want search term to reflect value if present
            setSearchTerm(value);
        }
    }, [isOpen, value]);

    // Handle clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredOptions = options.filter((opt: string) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="group relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
                <div
                    className="relative"
                    onClick={() => setIsOpen(true)}
                >
                    <input
                        type="text"
                        className={`w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-black dark:focus:border-white rounded-2xl px-5 py-4 font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none transition-all ${icon ? 'pl-10' : ''}`}
                        placeholder={placeholder}
                        value={isOpen ? searchTerm : value}
                        onChange={e => {
                            setSearchTerm(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            setIsOpen(true);
                            setSearchTerm(value);
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                // Try to find an exact match first, then case-insensitive
                                const exactMatch = options.find((opt: string) => opt.toLowerCase() === searchTerm.toLowerCase());
                                if (exactMatch) {
                                    onChange(exactMatch);
                                    setSearchTerm(exactMatch);
                                    setIsOpen(false);
                                } else if (filteredOptions.length > 0) {
                                    // If no exact match but we have filtered results, select the first one
                                    onChange(filteredOptions[0]);
                                    setSearchTerm(filteredOptions[0]);
                                    setIsOpen(false);
                                }
                            }
                        }}
                        onBlur={() => {
                            // Give time for click event on dropdown items to fire
                            setTimeout(() => {
                                setIsOpen(false);
                                // If user leaves field, revert to value if no match found, 
                                // OR if we want to be smart, 'auto-select' if it's a perfect match
                                const exactMatch = options.find((opt: string) => opt.toLowerCase() === searchTerm.toLowerCase());
                                if (exactMatch) {
                                    onChange(exactMatch);
                                }
                            }, 200);
                        }}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        {isOpen ? <Search size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt: string) => (
                                <div
                                    key={opt}
                                    className={`px-5 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold text-sm text-gray-700 dark:text-gray-200 flex justify-between items-center ${value === opt ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : ''}`}
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm(opt);
                                    }}
                                >
                                    {opt}
                                    {value === opt && <Check size={14} />}
                                </div>
                            ))
                        ) : (
                            <div className="px-5 py-4 text-sm text-gray-400 font-medium text-center">No results found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


const COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

const GRADE_OPTIONS = ['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
