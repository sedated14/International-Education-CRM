"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '../../../../components/Navigation';
import { useLeads } from '../../../../context/LeadContext';
import { ArrowLeft, Save, Trash2, User, BookOpen, MapPin, Heart, FileText, DollarSign, MessageCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { Input, Select, SearchableSelect, CheckboxGroup, PhoneInput } from '../../../../components/ui/FormComponents';
import { COUNTRIES } from '../../../../data/countries';

export default function EditStudentPage() {
    const params = useParams();
    const router = useRouter();
    const { leads, updateLead, deleteLead } = useLeads();
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Find lead
    const lead = leads.find(l => String(l.id) === String(params.id) && l.type === 'Student');

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

        graduatedInHomeCountry: false, // New
        gpa: '',
        englishLevel: '',
        destinations: [] as string[],
        targetGrades: { USA: '', Canada: '', Online: '' } as Record<string, string>,
        seekingGraduation: false, // New
        budget: '',
        sports: '', // String (comma sep) for Input compliance or array? StudentProfile uses array. 
        // Let's keep it string for editing easy with Input component which expects string
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

    // Load data
    useEffect(() => {
        if (lead && lead.studentProfile) {
            // Find linked agency name if ID exists
            const linkedAgency = agencies.find(a => String(a.id) === String(lead.studentProfile?.agencyId));

            setFormData({
                studentName: lead.studentName || '',
                dob: lead.studentProfile.dob || '',
                gender: lead.studentProfile.gender || '',
                nationality: lead.studentProfile.nationality || '',
                residence: lead.studentProfile.residence || '',
                studentEmail: lead.studentProfile?.email || '', // Lead email
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
                sports: lead.studentProfile.sports?.join(', ') || '',
                hobbies: lead.studentProfile.hobbies?.join(', ') || '',
                favoriteSubject: lead.studentProfile.favoriteSubject || '',
                personality: lead.studentProfile.personality || '',
                allergies: lead.studentProfile.allergies?.join(', ') || '',
                medicalInfo: lead.studentProfile.medicalInfo || '',
                dietaryRestrictions: lead.studentProfile.dietaryRestrictions?.join(', ') || '',
                essay: lead.studentProfile.essay || '',
                otherInfo: lead.studentProfile.otherInfo || '',
                preferredCommunication: lead.studentProfile.preferredCommunication || [],
                linkedAgencyName: linkedAgency ? (linkedAgency.agentName || '') : ''
            });
        }
    }, [lead, leads]); // Added leads dep since we filter agencies from it

    if (!leads.length) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Loading...</div>;
    if (!lead) return <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">Student not found</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updatedProfile = {
                ...lead.studentProfile,
                age: lead.studentProfile?.age ?? 0,
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
                englishLevel: formData.englishLevel as any,
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
                otherInfo: formData.otherInfo,
                // Link Agency Logic
                agencyId: formData.linkedAgencyName
                    ? agencies.find(a => a.agentName === formData.linkedAgencyName)?.id
                    : undefined
            };

            await updateLead(lead.id, {
                studentName: formData.studentName,
                country: formData.residence || formData.nationality || lead.country,
                studentProfile: updatedProfile as any
            });

            router.push(`/students/${lead.id}`);

        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this student profile? This cannot be undone.")) {
            await deleteLead(lead.id);
            router.push('/students');
        }
    }

    return (
        <div className="flex h-screen bg-[#F0F2F5] dark:bg-gray-950 text-[#1D1D1F] dark:text-gray-100 overflow-hidden font-sans">
            <Navigation />

            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-[#F0F2F5] dark:bg-gray-950 z-20">
                    <div className="flex items-center gap-4">
                        <Link href={`/students/${lead.id}`} className="p-2 hover:bg-white dark:hover:bg-gray-900 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Edit Student</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Update details for {lead.studentName}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-5 py-2.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-20 max-w-5xl mx-auto w-full">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Personal Info */}
                        <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <User size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Personal Information</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" value={formData.studentName} onChange={v => setFormData({ ...formData, studentName: v })} />
                                <Input label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({ ...formData, dob: v })} />
                                <Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={v => setFormData({ ...formData, gender: v })} />
                                <div className="hidden md:block" />
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
                                <PhoneInput
                                    label="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={v => setFormData({ ...formData, phoneNumber: v })}
                                    defaultCountry={formData.residence || formData.nationality}
                                />
                                <PhoneInput
                                    label="WhatsApp"
                                    value={formData.whatsappNumber}
                                    onChange={v => setFormData({ ...formData, whatsappNumber: v })}
                                    icon={<MessageCircle size={16} />}
                                    defaultCountry={formData.residence || formData.nationality}
                                />
                            </div>
                        </section>

                        {/* Academics */}
                        <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <BookOpen size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Education</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <MapPin size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Study Plans</h2>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Destinations</label>
                                    <CheckboxGroup
                                        options={['USA', 'Canada', 'Online']}
                                        selected={formData.destinations}
                                        onChange={v => setFormData({ ...formData, destinations: v })}
                                    />
                                </div>

                                {(formData.destinations.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                        {formData.destinations.map(dest => (
                                            <Select
                                                key={dest}
                                                label={`Target Grade for ${dest}`}
                                                options={GRADE_OPTIONS}
                                                value={formData.targetGrades[dest]}
                                                onChange={v => setFormData({
                                                    ...formData,
                                                    targetGrades: { ...formData.targetGrades, [dest]: v }
                                                })}
                                            />
                                        ))}

                                        {Object.values(formData.targetGrades).some(g => g === '12th') && (
                                            <div className="col-span-full bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/30 mt-2">
                                                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Seeking Graduation?</p>
                                                <div className="flex gap-2">
                                                    {['Yes', 'No'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, seekingGraduation: opt === 'Yes' })}
                                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${(formData.seekingGraduation === (opt === 'Yes'))
                                                                ? 'bg-indigo-500 text-white border-indigo-600'
                                                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                                                }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Additional Info */}
                        <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                    <Heart size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Interests & Details</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Sports" placeholder="Soccer, Tennis..." value={formData.sports} onChange={v => setFormData({ ...formData, sports: v })} />
                                <Input label="Hobbies" placeholder="Reading, Gaming..." value={formData.hobbies} onChange={v => setFormData({ ...formData, hobbies: v })} />
                                <Input label="Dietary Restrictions" value={formData.dietaryRestrictions} onChange={v => setFormData({ ...formData, dietaryRestrictions: v })} />
                                <Input label="Allergies" value={formData.allergies} onChange={v => setFormData({ ...formData, allergies: v })} />
                                <Input label="Medical Info" isTextArea value={formData.medicalInfo} onChange={v => setFormData({ ...formData, medicalInfo: v })} />
                                <Input label="Budget Range" icon={<DollarSign size={16} />} value={formData.budget} onChange={v => setFormData({ ...formData, budget: v })} />
                            </div>
                        </section>

                        {/* Notes */}
                        <section className="bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                                    <FileText size={20} />
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">Notes & Essay</h2>
                            </div>
                            <div className="space-y-6">
                                <Input label="Student Essay" isTextArea rows={6} value={formData.essay} onChange={v => setFormData({ ...formData, essay: v })} />
                                <Input label="Other Notes" isTextArea value={formData.otherInfo} onChange={v => setFormData({ ...formData, otherInfo: v })} />
                            </div>
                        </section>

                    </form>
                </div>

            </main>
        </div>
    );
}

const GRADE_OPTIONS = ['5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
