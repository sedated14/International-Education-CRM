import React, { useState, useRef, useEffect } from 'react';
import { Plus, Mail, FileSpreadsheet, Link, PenTool, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentLeadModal } from './AgentLeadModal';
import { ImportAgenciesModal } from './ImportAgenciesModal';

interface Props {
    onOpenManual: () => void;
}

export const NewLeadMenu: React.FC<Props> = ({ onOpenManual }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const router = useRouter();

    const handleSelect = (option: string) => {
        setIsOpen(false);
        if (option === 'agent_lead') {
            setShowAgentModal(true);
        } else if (option === 'student_form') {
            router.push('/apply');
        } else if (option === 'gmail') {
            alert("Gmail Integration coming soon");
        } else if (option === 'csv') {
            setShowImportModal(true);
        } else if (option === 'copy_link') {
            alert("Public Form Link copied!");
        }
    };

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-lg transition-all ${isOpen ? 'bg-gray-900 text-white shadow-xl scale-[1.02]' : 'bg-black text-white hover:shadow-xl hover:-translate-y-0.5'}`}
                >
                    {isOpen ? <X size={18} /> : <Plus size={18} />}
                    <span>New Lead</span>
                </button>

                {/* DROPDOWN MENU */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 py-2">Ingestion Method</div>

                        <MenuItem
                            icon={<PenTool size={16} />}
                            label="New Agent Lead"
                            desc="Manually add agency"
                            onClick={() => handleSelect('agent_lead')}
                        />
                        <MenuItem
                            icon={<Link size={16} />}
                            label="Student Form"
                            desc="Student Lead Form"
                            onClick={() => handleSelect('student_form')}
                        />
                        <MenuItem
                            icon={<Mail size={16} />}
                            label="Sync from Gmail"
                            desc="Import tagged emails"
                            onClick={() => handleSelect('gmail')}
                        />
                        <MenuItem
                            icon={<FileSpreadsheet size={16} />}
                            label="Upload CSV"
                            desc="Bulk import leads"
                            onClick={() => handleSelect('csv')}
                        />
                        <MenuItem
                            icon={<Link size={16} />}
                            label="Copy Form Link"
                            desc="Share external link"
                            onClick={() => handleSelect('copy_link')}
                            isLast
                        />
                    </div>
                )}
            </div>

            {/* MODAL */}
            {showAgentModal && <AgentLeadModal onClose={() => setShowAgentModal(false)} />}
            {showImportModal && <ImportAgenciesModal onClose={() => setShowImportModal(false)} />}
        </>
    );
};

const MenuItem = ({ icon, label, desc, onClick, isLast }: { icon: React.ReactNode, label: string, desc: string, onClick: () => void, isLast?: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors flex items-center gap-4 group ${!isLast ? 'mb-1' : ''}`}
    >
        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-white flex items-center justify-center group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
            {icon}
        </div>
        <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white">{label}</div>
            <div className="text-xs text-gray-400 dark:text-gray-400 font-medium">{desc}</div>
        </div>
    </button>
);
