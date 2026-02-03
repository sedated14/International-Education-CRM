import React from 'react';
import { Search } from 'lucide-react';

interface Props {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const LeadColumn: React.FC<Props> = ({ title, icon, children }) => {
    return (
        <div className="flex-1 flex flex-col bg-[#F9F9FB] rounded-[32px] overflow-hidden border border-gray-200/60 shadow-inner h-full">
            <div className="p-6 pb-4 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    {icon && <div className="text-gray-400">{icon}</div>}
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
                    <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
                </div>
                <button className="text-gray-400 hover:text-black transition-colors">
                    <Search size={18} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {children}
            </div>
        </div>
    );
};
