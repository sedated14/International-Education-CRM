import React, { useState, useEffect } from 'react';
import { User, BookOpen, MapPin, Globe, MessageCircle, Save, Trash2 } from 'lucide-react';
import { Input, Select, SearchableSelect, PhoneInput } from '../ui/FormComponents';
import { COUNTRIES } from '../../data/countries';
import { Lead } from '../../types';
import { useLeads } from '../../context/LeadContext';

// Options
const GRADE_OPTIONS = ["9th", "10th", "11th", "12th", "Gap Year", "University"];

interface StudentFormProps {
    lead?: Lead; // If provided, we are editing
    onSubmit: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    isModal?: boolean;
    isSubmitting?: boolean;
}

export const StudentForm = ({ lead, onSubmit, onDelete, isModal = false, isSubmitting = false }: StudentFormProps) => {
    const { leads } = useLeads();

    // Get Agencies for Linking
    const agencies = leads.filter(l => l.type === 'Agent');
    const agencyOptions = agencies.map(a => a.agentName || "Unknown Agency").sort();

    // Form State
    const [formData, setFormData] = useState({
        studentName: '',
        dob: '',
        gender: '',
        nationality: '',
        residence: '',
        studentEmail: '',
        phoneNumber: '',
        whatsappNumber: '',
        currentSchool: '',
        currentGrade: '',

        graduatedInHomeCountry: false,
        gpa: '',
        englishLevel: '',
        destinations: [] as string[],
        targetGrades: { USA: '', Canada: '', Online: '' } as Record<string, string>,
        seekingGraduation: false,
        budget: '',
        sports: '',
        hobbies: '',
        favoriteSubject: '',
        personality: '',
        allergies: '',
        medicalInfo: '',
        dietaryRestrictions: '',
        essay: '',
        otherInfo: '',
        preferredCommunication: [] as string[],
        linkedAgencyName: ''
    });

    // Initial Data Load
    useEffect(() => {
        if (lead && lead.studentProfile) {
            const linkedAgency = agencies.find(a => String(a.id) === String(lead.studentProfile?.agencyId));

            setFormData({
                studentName: lead.studentName || '',
                dob: lead.studentProfile.dob || '',
                gender: lead.studentProfile.gender || '',
                nationality: lead.studentProfile.nationality || '',
                residence: lead.studentProfile.residence || '',
                studentEmail: lead.studentProfile?.email || '',
                phoneNumber: lead.studentProfile.phoneNumber || '',
                whatsappNumber: lead.studentProfile.whatsappNumber || '',
                currentSchool: lead.studentProfile.currentSchool || '',
                currentGrade: lead.studentProfile.currentGrade || '',

                graduatedInHomeCountry: lead.studentProfile.graduatedInHomeCountry || false,
                gpa: lead.studentProfile.gpa || '',
                englishLevel: lead.studentProfile.englishLevel || '',
                destinations: Array.isArray(lead.studentProfile.desiredDestination) ? lead.studentProfile.desiredDestination : [lead.studentProfile.desiredDestination].filter(Boolean) as string[],
                targetGrades: lead.studentProfile.targetGrades || { USA: '', Canada: '', Online: '' },
                seekingGraduation: lead.studentProfile.seekingGraduation || false,
                budget: lead.studentProfile.budget || '',
                sports: Array.isArray(lead.studentProfile.sports) ? lead.studentProfile.sports.join(', ') : (lead.studentProfile.sports || ''),
                hobbies: Array.isArray(lead.studentProfile.hobbies) ? lead.studentProfile.hobbies.join(', ') : (lead.studentProfile.hobbies || ''),
                favoriteSubject: lead.studentProfile.favoriteSubject || '',
                personality: lead.studentProfile.personality || '',
                allergies: Array.isArray(lead.studentProfile.allergies) ? lead.studentProfile.allergies.join(', ') : (lead.studentProfile.allergies || ''),
                medicalInfo: lead.studentProfile.medicalInfo || '',
                dietaryRestrictions: Array.isArray(lead.studentProfile.dietaryRestrictions) ? lead.studentProfile.dietaryRestrictions.join(', ') : (lead.studentProfile.dietaryRestrictions || ''),
                essay: lead.studentProfile.essay || '',
                otherInfo: lead.studentProfile.otherInfo || '',
                preferredCommunication: lead.studentProfile.preferredCommunication || [],
                linkedAgencyName: linkedAgency ? (linkedAgency.agentName || '') : ''
            });
        }
    }, [lead, leads]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Transform back to Profile Object
        const submissionData = {
            studentName: formData.studentName, // Top level
            country: formData.residence || formData.nationality || (lead?.country || 'Unknown'), // Top level
            studentProfile: {
                ...((lead?.studentProfile) || {}),
                dob: formData.dob,
                gender: formData.gender,
                nationality: formData.nationality,
                residence: formData.residence,
                phoneNumber: formData.phoneNumber,
                whatsappNumber: formData.whatsappNumber,
                email: formData.studentEmail,
                currentSchool: formData.currentSchool,
                currentGrade: formData.currentGrade,

                graduatedInHomeCountry: formData.graduatedInHomeCountry,
                gpa: formData.gpa,
                englishLevel: formData.englishLevel,
                desiredDestination: formData.destinations,
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
                preferredCommunication: formData.preferredCommunication,
                otherInfo: formData.otherInfo,
                agencyId: formData.linkedAgencyName
                    ? agencies.find(a => a.agentName === formData.linkedAgencyName)?.id
                    : undefined
            }
        };

        onSubmit(submissionData);
    };

    const sectionClass = isModal
        ? "space-y-6"
        : "bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">

            {/* Personal Info */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <User size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Personal Information</h2>
                </div>
                <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    <Input label="Full Name" value={formData.studentName} onChange={v => setFormData({ ...formData, studentName: v })} />
                    <Input label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({ ...formData, dob: v })} />
                    <Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={v => setFormData({ ...formData, gender: v })} />
                    {!isModal && <div className="hidden md:block" />}

                    <SearchableSelect label="Nationality" options={COUNTRIES} value={formData.nationality} onChange={v => setFormData({ ...formData, nationality: v })} placeholder="Select Country" />
                    <SearchableSelect label="Country of Residence" options={COUNTRIES} value={formData.residence} onChange={v => setFormData({ ...formData, residence: v })} placeholder="Select Residence" />

                    <div className="col-span-full h-px bg-gray-50 dark:bg-gray-800 my-2" />

                    <div className="col-span-full">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe size={16} className="text-gray-400" />
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Linked Agency</label>
                        </div>
                        <SearchableSelect
                            options={agencyOptions}
                            value={formData.linkedAgencyName}
                            onChange={v => setFormData({ ...formData, linkedAgencyName: v })}
                            placeholder="Search for an Agency..."
                        />
                        <p className="text-[10px] text-gray-400 mt-2 ml-1">Type to search existing agencies to link this student to.</p>
                    </div>

                    <div className="col-span-full h-px bg-gray-50 dark:bg-gray-800 my-2" />

                    <Input label="Email" value={formData.studentEmail} onChange={v => setFormData({ ...formData, studentEmail: v })} />

                    <div className="col-span-full">
                        <PhoneInput
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={v => setFormData({ ...formData, phoneNumber: v })}
                            defaultCountry={formData.residence || formData.nationality}
                        />
                    </div>
                    <div className="col-span-full">
                        <PhoneInput
                            label="WhatsApp"
                            value={formData.whatsappNumber}
                            onChange={v => setFormData({ ...formData, whatsappNumber: v })}
                            icon={<MessageCircle size={16} />}
                            defaultCountry={formData.residence || formData.nationality}
                        />
                    </div>
                </div>
            </section>

            {/* Academics */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Education</h2>
                </div>
                <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    <Input label="Current School" value={formData.currentSchool} onChange={v => setFormData({ ...formData, currentSchool: v })} />
                    <Select label="Current Grade" options={GRADE_OPTIONS} value={formData.currentGrade} onChange={v => setFormData({ ...formData, currentGrade: v })} />

                    {formData.currentGrade === '12th' && (
                        <div className="col-span-full bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/30">
                            <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase mb-2">Graduated in Home Country?</p>
                            <div className="flex gap-2">
                                {['Yes', 'No'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, graduatedInHomeCountry: opt === 'Yes' })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${(formData.graduatedInHomeCountry === (opt === 'Yes'))
                                            ? 'bg-yellow-500 text-white border-yellow-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Input label="GPA / Grades" value={formData.gpa} onChange={v => setFormData({ ...formData, gpa: v })} />
                    <Select label="English Level" options={["Low", "Intermediate", "Advanced"]} value={formData.englishLevel} onChange={v => setFormData({ ...formData, englishLevel: v })} />
                </div>
            </section>

            {/* Destination */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <MapPin size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Destination</h2>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Target Countries</p>
                    <div className="flex flex-wrap gap-2">
                        {['USA', 'Canada', 'Online'].map(country => (
                            <button
                                key={country}
                                type="button"
                                onClick={() => {
                                    const exists = formData.destinations.includes(country);
                                    setFormData({
                                        ...formData,
                                        destinations: exists
                                            ? formData.destinations.filter(d => d !== country)
                                            : [...formData.destinations, country]
                                    });
                                }}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${formData.destinations.includes(country)
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                        : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-200 dark:hover:border-gray-700'
                                    }`}
                            >
                                {country}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {formData.destinations.map(country => (
                        <div key={country} className="animate-in fade-in slide-in-from-top-2">
                            <Input
                                label={`Target Grade for ${country}`}
                                value={formData.targetGrades[country] || ''}
                                onChange={v => setFormData({
                                    ...formData,
                                    targetGrades: { ...formData.targetGrades, [country]: v }
                                })}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {!isModal && (
                <div className="flex justify-end gap-3 pt-6">
                    {onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-5 py-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            )}

            {isModal && (
                <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            )}
        </form>
    );
};
