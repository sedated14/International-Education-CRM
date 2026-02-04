import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    count?: number;
}

export const LeadColumn: React.FC<Props> = ({ title, icon, children, count }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={`flex flex-col bg-[#F9F9FB] dark:bg-gray-900/50 rounded-[32px] overflow-hidden border border-gray-200/60 dark:border-gray-800 shadow-inner transition-all duration-300 ${isCollapsed ? 'h-auto' : 'h-[500px] md:h-full'}`}>
            <div
                className="p-6 pb-4 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    {icon && <div className="text-gray-400">{icon}</div>}
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">{title}</h2>
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {count !== undefined ? count : 0}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                        <Search size={18} />
                    </button>
                    <div className="text-gray-400">
                        {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </div>
                </div>
            </div>
            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {children}
                </div>
            )}
        </div>
    );
};
