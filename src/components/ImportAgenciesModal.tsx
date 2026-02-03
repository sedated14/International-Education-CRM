
import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileSpreadsheet, ArrowRight, Check, AlertCircle, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLeads } from '../context/LeadContext';
import { Agency } from '../types';
import { COUNTRIES } from '../data/countries';

interface Props {
    onClose: () => void;
}

// Map logical names to data keys
const CRM_FIELDS = [
    { key: 'agencyName', label: 'Agency Name', required: true },
    { key: 'country', label: 'Country' },
    { key: 'region', label: 'Region/Continent' },
    { key: 'city', label: 'City' },
    { key: 'contactFirstName', label: 'Contact First Name' },
    { key: 'contactLastName', label: 'Contact Last Name' },
    { key: 'nickname', label: 'Nickname' },
    { key: 'email', label: 'Contact Email' },
    { key: 'position', label: 'Position' },
    { key: 'metAt', label: 'Met AT' },
    { key: 'whatsapp', label: 'Contact WhatsApp' },
    { key: 'phone', label: 'Contact Phone Number' },
    { key: 'skype', label: 'Contact Skype Address' },
    { key: 'prefComm', label: 'Preferred Method of Communication' },
    { key: 'address', label: 'Address' },

    // Secondary Contact
    { key: 'secFirstName', label: 'Secondary Contact First Name' },
    { key: 'secLastName', label: 'Secondary Contact Last Name' },
    { key: 'secPosition', label: 'Secondary Contact Position' },
    { key: 'secEmail', label: 'Secondary Email' },
    { key: 'secWhatsapp', label: 'Secondary Contact WhatsApp' },

    { key: 'website', label: 'Website' },
];

export const ImportAgenciesModal: React.FC<Props> = ({ onClose }) => {
    const { leads, addLead } = useLeads();
    const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'importing'>('upload');
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({}); // Header -> CRM Field Key
    const [fileName, setFileName] = useState('');
    const [globalStatus, setGlobalStatus] = useState<string>('Prospective');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importStats, setImportStats] = useState({ total: 0, success: 0, duplicates: 0, skipped: 0, colleagues: 0, inReview: 0 });
    const [skippedLog, setSkippedLog] = useState<string[]>([]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length > 0) {
                const headerRow = data[0] as string[];
                const rows = data.slice(1); // Exclude header
                setHeaders(headerRow);
                setFileData(rows);

                // Auto-map simple matches
                const initialMap: any = {};
                headerRow.forEach(h => {
                    const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (lower.includes('agencyname') || lower === 'company') initialMap[h] = 'agencyName';
                    else if (lower.includes('website') || lower.includes('web')) initialMap[h] = 'website';
                    else if (lower === 'city') initialMap[h] = 'city';
                    else if (lower === 'country') initialMap[h] = 'country';
                    else if (lower.includes('region') || lower.includes('continent')) initialMap[h] = 'region';

                    // Contact 1
                    else if (lower.includes('contactfirstname')) initialMap[h] = 'contactFirstName';
                    else if (lower.includes('contactlastname')) initialMap[h] = 'contactLastName';
                    else if (lower.includes('firstname')) initialMap[h] = 'contactFirstName'; // Fallback
                    else if (lower.includes('lastname')) initialMap[h] = 'contactLastName'; // Fallback
                    else if (lower.includes('nickname')) initialMap[h] = 'nickname';
                    else if (lower.includes('contactemail') || lower === 'email') initialMap[h] = 'email';
                    else if (lower.includes('position') && !lower.includes('secondary')) initialMap[h] = 'position';
                    else if (lower.includes('metat')) initialMap[h] = 'metAt';
                    else if (lower.includes('whatsapp') && !lower.includes('secondary')) initialMap[h] = 'whatsapp';
                    else if (lower.includes('phone')) initialMap[h] = 'phone';
                    else if (lower.includes('skype')) initialMap[h] = 'skype';
                    else if (lower.includes('preferred') || lower.includes('method') || lower.includes('comm')) initialMap[h] = 'prefComm';
                    else if (lower.includes('address')) initialMap[h] = 'address';

                    // Secondary
                    else if (lower.includes('secondary') && lower.includes('first')) initialMap[h] = 'secFirstName';
                    else if (lower.includes('secondary') && lower.includes('last')) initialMap[h] = 'secLastName';
                    else if (lower.includes('secondary') && lower.includes('position')) initialMap[h] = 'secPosition';
                    else if (lower.includes('secondary') && lower.includes('email')) initialMap[h] = 'secEmail';
                    else if (lower.includes('secondary') && lower.includes('whatsapp')) initialMap[h] = 'secWhatsapp';
                });
                setMapping(initialMap);

                setStep('map');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        setStep('importing');
        let successCount = 0;
        let duplicateCount = 0;
        let skippedCount = 0;
        let colleagueCount = 0;
        let inReviewCount = 0;
        const skipped: string[] = [];

        // 0. Fetch existing duplicates from portal to prevent re-adding
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        let existingDuplicates: any[] = [];
        try {
            const duplicateSnapshot = await getDocs(collection(db, 'import_duplicates'));
            existingDuplicates = duplicateSnapshot.docs.map(d => d.data());
        } catch (e) {
            console.error("Error fetching existing duplicates:", e);
        }

        // 1. Gather all existing emails for quick lookup
        const existingEmails = new Set<string>();
        leads.forEach(l => {
            if (l.type === 'Agent' && l.agencyProfile) {
                (l.agencyProfile.keyContacts || []).forEach(c => {
                    if (c.email) existingEmails.add(c.email.toLowerCase());
                });
                if (l.agencyProfile.secondaryContact?.email) {
                    existingEmails.add(l.agencyProfile.secondaryContact.email.toLowerCase());
                }
            }
        });

        // 2. GROUPING PHASE
        const groupedLeads: Record<string, any> = {};

        for (const row of fileData) {
            // Reconstruct object based on mapping
            const mappedData: any = {};
            headers.forEach((h, index) => {
                const crmKey = mapping[h];
                if (crmKey) {
                    mappedData[crmKey] = row[index];
                }
            });

            if (!mappedData.agencyName) continue; // Skip empty rows

            const agencyName = mappedData.agencyName.trim();
            const normalizedName = agencyName.toLowerCase();

            // Extract Contacts from THIS row
            const rowContacts: any[] = [];

            // Primary Contact
            const contactName = [mappedData.contactFirstName, mappedData.contactLastName].filter(Boolean).join(' ');
            if (contactName || mappedData.email) {
                rowContacts.push({
                    name: contactName || 'Unknown',
                    firstName: mappedData.contactFirstName,
                    lastName: mappedData.contactLastName,
                    nickname: mappedData.nickname,
                    role: mappedData.position || 'Agent',
                    email: mappedData.email || '',
                    phone: mappedData.phone || '',
                    whatsapp: mappedData.whatsapp,
                    skype: mappedData.skype,
                    preferredCommunication: mappedData.prefComm
                });
            }

            // Secondary Contact
            const secName = [mappedData.secFirstName, mappedData.secLastName].filter(Boolean).join(' ');
            if (secName || mappedData.secEmail) {
                rowContacts.push({
                    name: secName || 'Unknown',
                    firstName: mappedData.secFirstName,
                    lastName: mappedData.secLastName,
                    role: mappedData.secPosition || '',
                    email: mappedData.secEmail || '',
                    phone: '',
                    whatsapp: mappedData.secWhatsapp,
                    preferredCommunication: ''
                });
            }

            // Initialize or Merge
            if (!groupedLeads[normalizedName]) {
                groupedLeads[normalizedName] = {
                    title: agencyName,
                    type: 'Agent',
                    agentName: agencyName,
                    country: mappedData.country || 'Unknown',
                    status: 'Inquiry',
                    source: 'CSV',
                    createdAt: new Date().toISOString(),
                    agencyProfile: {
                        website: mappedData.website || '',
                        city: mappedData.city || '',
                        region: mappedData.region || '',
                        address: mappedData.address || '',
                        partnershipStatus: globalStatus,
                        commissionRate: '',
                        timezone: '',
                        language: 'English',
                        metAt: mappedData.metAt || '',
                        keyContacts: [] // Will fill below
                    }
                };
            }

            // Merge Contacts (Avoid exact duplicates within the group handled by set/check?)
            // For simple grouping, just push. We can deduce uniqueness later if needed, but pushing is safer for now.
            groupedLeads[normalizedName].agencyProfile.keyContacts.push(...rowContacts);

            // If the first row didn't have a website but this one does, should we update? 
            // Let's assume the first row with the name is the master for metadata, but we could improve later.
            if (!groupedLeads[normalizedName].agencyProfile.website && mappedData.website) {
                groupedLeads[normalizedName].agencyProfile.website = mappedData.website;
            }
        }

        // 3. PROCESSING PHASE (Iterate Grouped Leads)
        for (const leadKey in groupedLeads) {
            const newLead = groupedLeads[leadKey];

            // Deduplicate contacts WITHIN the new lead before processing
            // (e.g. if CSV had same contact repeated for some reason)
            const uniqueContacts: any[] = [];
            const seenContactEmails = new Set();
            newLead.agencyProfile.keyContacts.forEach((c: any) => {
                if (c.email && seenContactEmails.has(c.email.toLowerCase())) return;
                if (c.email) seenContactEmails.add(c.email.toLowerCase());
                uniqueContacts.push(c);
            });
            newLead.agencyProfile.keyContacts = uniqueContacts;

            // 2.5 Check if already in duplicate portal
            const isAlreadyInReview = existingDuplicates.some((dup: any) => {
                const nameMatch = dup.agentName?.toLowerCase().trim() === newLead.agentName?.toLowerCase().trim();
                const dupEmails = (dup.agencyProfile?.keyContacts || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean);
                const newEmails = (newLead.agencyProfile?.keyContacts || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean);
                const emailMatch = newEmails.some((e: string) => dupEmails.includes(e));

                return nameMatch || emailMatch;
            });

            if (isAlreadyInReview) {
                console.log("Skipping record already in review:", newLead.agentName);
                inReviewCount++;
                skipped.push(`${newLead.agentName} (Already in Review)`);
                continue;
            }


            // 3. Strict Deduplication Check: Skip if EXACTLY identical
            // Criteria: Agency Name + Country + Email + First Name (of FIRST contact)
            const isIdentical = leads.some(l => {
                if (l.type !== 'Agent' || !l.agencyProfile) return false;

                const leadName = l.agentName?.toLowerCase().trim();
                const leadCountry = l.country?.toLowerCase().trim();

                // Check if AT LEAST ONE contact matches exactly? Or just Agency?
                // Let's check Agency + First Contact match
                const leadEmail = l.agencyProfile.keyContacts?.[0]?.email?.toLowerCase().trim();

                const importName = newLead.agentName?.toLowerCase().trim();
                const importCountry = (newLead.country || 'unknown').toLowerCase().trim();
                const importEmail = newLead.agencyProfile.keyContacts?.[0]?.email?.toLowerCase().trim();

                return leadName === importName &&
                    leadCountry === importCountry &&
                    leadEmail === importEmail;
            });

            if (isIdentical) {
                console.log("Skipping identical record:", newLead.agentName);
                skippedCount++;
                skipped.push(newLead.agentName);
                continue;
            }

            // Extract emails for checks
            const contactEmails: string[] = newLead.agencyProfile.keyContacts.map((c: any) => c.email?.toLowerCase()).filter(Boolean);
            const importEmailDomain = contactEmails[0]?.split('@')[1]; // Use first contact domain

            // Filter out common public domains to avoid false positives on 'gmail.com' etc.
            const isPublicDomain = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(importEmailDomain || '');

            let potentialColleagueMatch: any = null;

            if (importEmailDomain && !isPublicDomain) {
                potentialColleagueMatch = leads.find(l => {
                    if (l.type !== 'Agent' || !l.agencyProfile) return false;

                    const leadName = l.agentName?.toLowerCase().trim();
                    const importName = newLead.agentName?.toLowerCase().trim();

                    // Allow matching even if names are different (User request: Handle slightly different agency names with same domain)
                    // if (leadName !== importName) return false; 


                    // Check if ANY existing contact has same domain
                    const hasDomainMatch = (l.agencyProfile.keyContacts || []).some(c =>
                        c.email?.toLowerCase().split('@')[1] === importEmailDomain
                    ) || (l.agencyProfile.secondaryContact?.email?.toLowerCase().split('@')[1] === importEmailDomain);

                    return hasDomainMatch;
                });
            }

            if (potentialColleagueMatch) {
                try {
                    const { addDoc, collection } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');

                    // If we have multiple contacts for a potential colleague match, 
                    // we should probably add the entire GROUPED object as a "Duplicate Item", 
                    // and let the dashboard handle adding ALL contacts.

                    await addDoc(collection(db, 'import_duplicates'), JSON.parse(JSON.stringify({
                        ...newLead,
                        duplicateReason: 'Potential Colleague',
                        existingLeadId: potentialColleagueMatch.id, // Link to existing agency
                        importedAt: new Date().toISOString(),
                        status: 'pending'
                    })));
                    colleagueCount++;
                    continue; // Skip further processing
                } catch (e) {
                    console.error("Error saving colleague match:", e);
                }
            }

            // 4. Duplicate Email Check (Conflict)

            let isDuplicate = false;
            let matchType = '';

            // Check if ANY of the new contacts have an email that exists
            const conflictEmail = contactEmails.find(e => existingEmails.has(e));

            if (conflictEmail) {
                isDuplicate = true;
                matchType = 'Email Conflict (' + conflictEmail + ')';
            }

            if (isDuplicate) {
                // Save to 'import_duplicates' collection
                try {
                    // Dynamically import db/collection to avoid top-level issues if not used (though we should import at top)
                    // Assuming we'll add imports to the top of the file
                    const { addDoc, collection } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');

                    await addDoc(collection(db, 'import_duplicates'), JSON.parse(JSON.stringify({
                        ...newLead,
                        duplicateReason: matchType,
                        importedAt: new Date().toISOString(),
                        status: 'pending'
                    })));
                    duplicateCount++;
                } catch (e) {
                    console.error("Error saving duplicate:", e);
                }
            } else {
                // Unique - Add to Leads
                addLead(newLead);
                successCount++;

                // Add new emails to set to avoid duplicates *within* later groups (unlikely if grouped by name, but good practice)
                contactEmails.forEach(e => existingEmails.add(e));
            }
        }

        setImportStats({ total: successCount + duplicateCount + skippedCount + colleagueCount + inReviewCount, success: successCount, duplicates: duplicateCount, skipped: skippedCount, colleagues: colleagueCount, inReview: inReviewCount });
        setSkippedLog(skipped);

        // Don't auto-close if there are issues
        if (duplicateCount === 0 && skippedCount === 0 && colleagueCount === 0 && inReviewCount === 0) {
            setTimeout(() => onClose(), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Import Agencies</h2>
                        <p className="text-gray-500 font-medium text-sm">Upload a spreadsheet to bulk create leads</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {step === 'upload' && (
                        <div
                            className="border-4 border-dashed border-gray-200 rounded-3xl h-[400px] flex flex-col items-center justify-center cursor-pointer hover:border-black/20 hover:bg-gray-50 transition-all group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFileUpload} />
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Click to Upload Spreadsheet</h3>
                            <p className="text-gray-400 font-medium">Supports .xlsx, .xls, .csv</p>
                        </div>
                    )}

                    {step === 'map' && (
                        <div className="h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <FileSpreadsheet className="text-blue-500" />
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900">{fileName}</p>
                                    <p className="text-xs text-blue-600 font-bold uppercase">{fileData.length} Rows Found</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Set Status:</span>
                                    <select
                                        value={globalStatus}
                                        onChange={e => setGlobalStatus(e.target.value)}
                                        className="bg-white border border-blue-200 text-blue-900 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                    >
                                        <option value="Prospective">Prospective (Default)</option>
                                        <option value="Active">Active</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Do Not Contact">Do Not Contact</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-4 px-4 font-bold text-xs text-gray-400 uppercase tracking-widest">
                                <div>Spreadsheet Column</div>
                                <div></div>
                                <div>CRM Field</div>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {headers.map((header) => (
                                    <div key={header} className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="font-bold text-gray-700 truncate" title={header}>{header}</div>
                                        <ArrowRight size={16} className="text-gray-300" />
                                        <select
                                            className={`w-full p-2 rounded-lg font-bold text-sm outline-none border-2 transition-colors ${mapping[header] ? 'border-green-500 bg-white text-gray-900' : 'border-gray-200 bg-gray-100 text-gray-400'}`}
                                            value={mapping[header] || ''}
                                            onChange={e => setMapping(prev => ({ ...prev, [header]: e.target.value }))}
                                        >
                                            <option value="">Do Not Import</option>
                                            {CRM_FIELDS.map(f => (
                                                <option key={f.key} value={f.key}>{f.label} {f.required ? '*' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            {importStats.total > 0 && importStats.total === (importStats.success + importStats.duplicates + importStats.skipped + importStats.colleagues + importStats.inReview) ? (
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                    <Check size={40} className="text-green-600" />
                                </div>
                            ) : (importStats.duplicates > 0 || importStats.skipped > 0 ? (
                                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                                    <AlertCircle size={40} className="text-yellow-600" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Database size={40} className="text-green-600" />
                                </div>
                            ))}

                            <h3 className="text-2xl font-black text-gray-900 mb-2">
                                {importStats.total > 0 && importStats.total === (importStats.success + importStats.duplicates + importStats.skipped + importStats.colleagues + importStats.inReview)
                                    ? "Import Complete!"
                                    : "Processing Import..."}
                            </h3>
                            <p className="text-gray-500 font-medium">
                                Found {importStats.success} valid, {importStats.duplicates} duplicates, {importStats.colleagues} colleagues, and {importStats.skipped} skipped.
                            </p>

                            {importStats.total > 0 && importStats.total === (importStats.success + importStats.duplicates + importStats.skipped + importStats.colleagues + importStats.inReview) && (
                                <div className="mt-8 space-y-3 w-full max-w-md">
                                    {importStats.success > 0 && (
                                        <div className="bg-green-50 px-6 py-3 rounded-full text-green-700 font-bold border border-green-100">
                                            {importStats.success} Leads Imported Successfully
                                        </div>
                                    )}
                                    {importStats.duplicates > 0 && (
                                        <div className="bg-yellow-50 px-6 py-3 rounded-full text-yellow-700 font-bold border border-yellow-100">
                                            {importStats.duplicates} Duplicates Moved to Review
                                        </div>
                                    )}
                                    {importStats.colleagues > 0 && (
                                        <div className="bg-blue-50 px-6 py-3 rounded-full text-blue-700 font-bold border border-blue-100">
                                            {importStats.colleagues} Potential Colleagues Found
                                        </div>
                                    )}
                                    {importStats.inReview > 0 && (
                                        <div className="bg-purple-50 px-6 py-3 rounded-full text-purple-700 font-bold border border-purple-100">
                                            {importStats.inReview} Leads Already in Review
                                        </div>
                                    )}
                                    {importStats.skipped > 0 && (
                                        <div className="bg-gray-100 px-6 py-3 rounded-2xl text-gray-700 font-bold border border-gray-200 text-left">
                                            <div className="flex justify-between items-center mb-2">
                                                <span>{importStats.skipped} Identical Records Skipped</span>
                                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Already Exists</span>
                                            </div>
                                            <div className="max-h-32 overflow-y-auto text-xs text-gray-500 space-y-1 custom-scrollbar">
                                                {skippedLog.map((name, i) => (
                                                    <div key={i} className="truncate">• {name}</div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                {step === 'map' && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-[32px]">
                        <button onClick={() => setStep('upload')} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors">Back</button>
                        <button
                            onClick={handleImport}
                            className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                            disabled={!Object.values(mapping).includes('agencyName')} // Require at least agency name
                        >
                            Start Import <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
