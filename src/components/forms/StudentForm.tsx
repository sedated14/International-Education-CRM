import React, { useState, useEffect } from 'react';
import { User, BookOpen, MapPin, Globe, MessageCircle, Save, Trash2, Heart, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import { Input, Select, SearchableSelect, PhoneInput, CheckboxGroup as CheckboxGroupUnused } from '../ui/FormComponents'; // CheckboxGroup imported but unused in original, keeping for safety or removing if better
import { COUNTRIES } from '../../data/countries';
import { Lead } from '../../types';
import { useLeads } from '../../context/LeadContext';

// Options
const GRADE_OPTIONS = ["K", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
const ENGLISH_LEVELS = ["Low", "Intermediate", "Advanced"];

interface StudentFormProps {
    lead?: Lead; // If provided, we are editing
    onSubmit: (data: any) => Promise<void>;
    onDelete?: () => Promise<void>;
    isModal?: boolean;
    isSubmitting?: boolean;
    showLinkedAgency?: boolean; // Control visibility of Agency Linker
}

export const StudentForm = ({ lead, onSubmit, onDelete, isModal = false, isSubmitting = false, showLinkedAgency = true }: StudentFormProps) => {
    const { leads } = useLeads();

    // Get Agencies for Linking
    const agencies = leads.filter(l => l.type === 'Agent');
    const agencyOptions = agencies.map(a => a.agentName || "Unknown Agency").sort();

    // Form State
    const [formData, setFormData] = useState({
        studentName: '', // Full Name (legacy/display)
        firstName: '',
        middleName: '',
        lastName: '',

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

        essay: '', // Why do you want to study abroad?
        otherInfo: '', // Anything else?
        preferredCommunication: [] as string[],

        linkedAgencyName: ''
    });

    // Initial Data Load
    useEffect(() => {
        if (lead && lead.studentProfile) {
            const linkedAgency = agencies.find(a => String(a.id) === String(lead.studentProfile?.agencyId));
            const profile = lead.studentProfile;

            // Try to split name if first/last not saved
            const existingName = lead.studentName || '';
            const splitName = existingName.split(' ');
            const fName = profile.firstName || splitName[0] || '';
            const lName = profile.lastName || (splitName.length > 1 ? splitName.slice(1).join(' ') : '') || '';

            setFormData({
                studentName: lead.studentName || '',
                firstName: fName,
                middleName: profile.middleName || '',
                lastName: lName,

                dob: profile.dob || '',
                gender: profile.gender || '',
                nationality: profile.nationality || '',
                residence: profile.residence || '',
                studentEmail: profile.email || '',
                phoneNumber: profile.phoneNumber || '',
                whatsappNumber: profile.whatsappNumber || '',

                currentSchool: profile.currentSchool || '',
                currentGrade: profile.currentGrade || '',

                graduatedInHomeCountry: profile.graduatedInHomeCountry || false,
                gpa: profile.gpa || '',
                englishLevel: profile.englishLevel || '',

                destinations: Array.isArray(profile.desiredDestination) ? profile.desiredDestination : [profile.desiredDestination].filter(Boolean) as string[],
                targetGrades: profile.targetGrades || { USA: '', Canada: '', Online: '' },
                seekingGraduation: profile.seekingGraduation || false,

                budget: profile.budget || '',
                sports: Array.isArray(profile.sports) ? profile.sports.join(', ') : (profile.sports || ''),
                hobbies: Array.isArray(profile.hobbies) ? profile.hobbies.join(', ') : (profile.hobbies || ''),
                favoriteSubject: profile.favoriteSubject || '',
                personality: profile.personality || '',

                allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : (profile.allergies || ''),
                medicalInfo: profile.medicalInfo || '',
                dietaryRestrictions: Array.isArray(profile.dietaryRestrictions) ? profile.dietaryRestrictions.join(', ') : (profile.dietaryRestrictions || ''),

                essay: profile.essay || '',
                otherInfo: profile.otherInfo || '',
                preferredCommunication: profile.preferredCommunication || [],

                linkedAgencyName: linkedAgency ? (linkedAgency.agentName || '') : ''
            });
        }
    }, [lead, leads]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Construct Full Name
        const fullName = [formData.firstName, formData.middleName, formData.lastName].filter(Boolean).join(' ');

        // Find the selected Agency Lead to extract ID and Profile
        const selectedAgencyLead = formData.linkedAgencyName
            ? agencies.find(a => a.agentName === formData.linkedAgencyName)
            : undefined;

        // Transform back to Profile Object
        const submissionData = {
            studentName: fullName, // Top level
            country: formData.residence || formData.nationality || (lead?.country || 'Unknown'), // Top level

            // Snapshot the Agency Profile for robust display (Cards, Profile View)
            // This ensures it shows up immediately and persists even if context hydration fails
            agencyProfile: selectedAgencyLead?.agencyProfile,

            studentProfile: {
                ...((lead?.studentProfile) || {}),
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,

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

                // Link ID for Context Hydration (if needed for updates)
                agencyId: selectedAgencyLead ? String(selectedAgencyLead.id) : undefined
            }
        };

        onSubmit(submissionData);
    };

    const sectionClass = isModal
        ? "space-y-6"
        : "bg-white dark:bg-gray-900 rounded-[32px] p-8 shadow-sm border border-gray-100 dark:border-gray-800";

    return (
        <form id="student-form" onSubmit={handleSubmit} className="space-y-8 text-left">
            {/* Top Save Button (Mobile/Quick Access) */}
            <div className="flex justify-end mb-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm shadow-md hover:opacity-80 transition-all flex items-center gap-2"
                >
                    {isSubmitting ? 'Saving...' : <><Save size={16} /> Save</>}
                </button>
            </div>

            {/* Section - About You */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <User size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">About You</h2>
                </div>
                <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    <Input label="First Name" value={formData.firstName} onChange={v => setFormData({ ...formData, firstName: v })} />
                    <Input label="Middle Name" value={formData.middleName} onChange={v => setFormData({ ...formData, middleName: v })} />
                    <Input label="Last Name" value={formData.lastName} onChange={v => setFormData({ ...formData, lastName: v })} />

                    <Input label="Date of Birth" type="date" value={formData.dob} onChange={v => setFormData({ ...formData, dob: v })} />

                    <Select label="Gender" options={["Male", "Female"]} value={formData.gender} onChange={v => setFormData({ ...formData, gender: v })} />

                    <SearchableSelect label="Nationality" options={COUNTRIES} value={formData.nationality} onChange={v => setFormData({ ...formData, nationality: v })} placeholder="Select Nationality..." />
                    <SearchableSelect label="Country of Residence" options={COUNTRIES} value={formData.residence} onChange={v => setFormData({ ...formData, residence: v })} placeholder="Select Country..." />

                    {/* Linked Agency - Conditional */}
                    {showLinkedAgency && (
                        <>
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
                        </>
                    )}

                    <Input label="Email Address" value={formData.studentEmail} onChange={v => setFormData({ ...formData, studentEmail: v })} />

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
                            label="WhatsApp Number"
                            value={formData.whatsappNumber}
                            onChange={v => setFormData({ ...formData, whatsappNumber: v })}
                            icon={<MessageCircle size={16} />}
                            defaultCountry={formData.residence || formData.nationality}
                        />
                    </div>
                </div>
            </section>

            {/* Section - Academics */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Academics</h2>
                </div>
                <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    <Input label="Current School Name" value={formData.currentSchool} onChange={v => setFormData({ ...formData, currentSchool: v })} />
                    <Select label="Current Grade" options={GRADE_OPTIONS} value={formData.currentGrade} onChange={v => setFormData({ ...formData, currentGrade: v })} />

                    {formData.currentGrade === '12th' && (
                        <div className="col-span-full bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30">
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Graduated in Home Country?</p>
                            <div className="flex gap-2">
                                {['Yes', 'No'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, graduatedInHomeCountry: opt === 'Yes' })}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${(formData.graduatedInHomeCountry === (opt === 'Yes'))
                                            ? 'bg-blue-500 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Input label="Current GPA" value={formData.gpa} onChange={v => setFormData({ ...formData, gpa: v })} />
                    <Select label="English Level" options={ENGLISH_LEVELS} value={formData.englishLevel} onChange={v => setFormData({ ...formData, englishLevel: v })} />
                </div>
            </section>

            {/* Section - Destination */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <MapPin size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Destination</h2>
                </div>

                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-xl mb-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Where do you want to study?</p>
                    <div className="flex flex-wrap gap-2">
                        {['USA', 'Canada', 'Online US High School', 'Online Canada High School'].map(country => (
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
                    {/* Dynamic Grade Mappings */}
                    {formData.destinations.some(d => d.includes('USA')) && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Select
                                label="Requested Grade for USA"
                                options={GRADE_OPTIONS}
                                value={formData.targetGrades.USA}
                                onChange={v => setFormData({ ...formData, targetGrades: { ...formData.targetGrades, USA: v } })}
                            />
                        </div>
                    )}
                    {formData.destinations.some(d => d.includes('Canada')) && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Select
                                label="Requested Grade for Canada"
                                options={GRADE_OPTIONS}
                                value={formData.targetGrades.Canada}
                                onChange={v => setFormData({ ...formData, targetGrades: { ...formData.targetGrades, Canada: v } })}
                            />
                        </div>
                    )}
                    {formData.destinations.some(d => d.includes('Online')) && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <Select
                                label="Requested Grade for Online"
                                options={GRADE_OPTIONS}
                                value={formData.targetGrades.Online}
                                onChange={v => setFormData({ ...formData, targetGrades: { ...formData.targetGrades, Online: v } })}
                            />
                        </div>
                    )}

                    {/* Seeking Graduation Logic */}
                    {(Object.values(formData.targetGrades).some(g => g === '12th')) && (
                        <div className="mt-4 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-900/30 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-3">Are you seeking graduation?</label>
                            <div className="flex gap-3">
                                {['Yes', 'No'].map(opt => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, seekingGraduation: opt === 'Yes' })}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${(formData.seekingGraduation === (opt === 'Yes'))
                                            ? 'border-purple-500 bg-purple-500 text-white'
                                            : 'border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Section - Interests & Health */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                        <Heart size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Interests & Health</h2>
                </div>
                <div className={`grid grid-cols-1 ${isModal ? 'gap-4' : 'md:grid-cols-2 gap-6'}`}>
                    <Input label="Sports Practice & Likes" value={formData.sports} onChange={v => setFormData({ ...formData, sports: v })} />
                    <Input label="Hobbies" value={formData.hobbies} onChange={v => setFormData({ ...formData, hobbies: v })} />
                    <Input label="Favorite Subjects" value={formData.favoriteSubject} onChange={v => setFormData({ ...formData, favoriteSubject: v })} />
                    <Input label="Personality" value={formData.personality} onChange={v => setFormData({ ...formData, personality: v })} />

                    <Input label="Dietary Restrictions" value={formData.dietaryRestrictions} onChange={v => setFormData({ ...formData, dietaryRestrictions: v })} />
                    <Input label="Allergies (esp. Pets)" value={formData.allergies} onChange={v => setFormData({ ...formData, allergies: v })} />

                    <div className="col-span-full">
                        <Input label="Medical Information" value={formData.medicalInfo} onChange={v => setFormData({ ...formData, medicalInfo: v })} isTextArea />
                    </div>
                    <div className="col-span-full">
                        <Input label="Budget" icon={<DollarSign size={16} />} value={formData.budget} onChange={v => setFormData({ ...formData, budget: v })} />
                    </div>
                </div>
            </section>

            {/* Section - Inquiry Details */}
            <section className={sectionClass}>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        <FileText size={20} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Inquiry Details</h2>
                </div>

                <div className="space-y-6">
                    <Input
                        label="Why do you want to study abroad?"
                        value={formData.essay}
                        onChange={v => setFormData({ ...formData, essay: v })}
                        isTextArea
                        rows={4}
                    />
                    <Input
                        label="Anything else we should know?"
                        value={formData.otherInfo}
                        onChange={v => setFormData({ ...formData, otherInfo: v })}
                        isTextArea
                    />

                    {/* Preferred Communication */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 rounded-2xl">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preferred Method of Communication</label>
                        <div className="flex flex-wrap gap-4">
                            {['Email', 'Phone', 'Text'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    onClick={() => {
                                        const exists = formData.preferredCommunication.includes(method);
                                        setFormData({
                                            ...formData,
                                            preferredCommunication: exists
                                                ? formData.preferredCommunication.filter(m => m !== method)
                                                : [...formData.preferredCommunication, method]
                                        });
                                    }}
                                    className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all ${formData.preferredCommunication.includes(method)
                                        ? 'border-gray-900 dark:border-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                        : 'border-transparent bg-gray-200/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {formData.preferredCommunication.includes(method) ? <CheckCircle2 size={18} /> : <div className="w-[18px]" />}
                                    <span className="font-bold text-sm">{method}</span>
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4">We will use these methods to contact you.</p>
                    </div>
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
