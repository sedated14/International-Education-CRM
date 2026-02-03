"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Star, Globe, Zap, GraduationCap, LayoutDashboard, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const Navigation = () => {
    const pathname = usePathname();
    const [duplicateCount, setDuplicateCount] = React.useState(0);
    const [isExpanded, setIsExpanded] = React.useState(true);

    React.useEffect(() => {
        // Dynamically import to avoid server/client mismatches if any, though explicit import is better. 
        // using require or direct import if we are sure about environment. Next.js handles this well with "use client" but this file doesn't have it.
        // It should be a client component to use hooks.
        // Adding "use client" at top as well.

        import('@/lib/firebase').then(({ db }) => {
            import('firebase/firestore').then(({ collection, onSnapshot }) => {
                const unsubscribe = onSnapshot(collection(db, 'import_duplicates'), (snap) => {
                    setDuplicateCount(snap.size);
                });
                return () => unsubscribe();
            });
        });
    }, []);

    return (
        <nav
            className={clsx(
                "bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-30 flex-shrink-0 h-screen transition-all duration-300 ease-in-out relative",
                isExpanded ? "w-64" : "w-20"
            )}
        >
            {/* Toggle Button - Absolute positioned to be on the border */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md hover:bg-gray-50 text-gray-400 z-50"
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Logo Area */}
            <div className={clsx("flex items-center justify-center transition-all duration-300", isExpanded ? "px-6 w-full justify-start gap-3" : "")}>
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">A</div>
                {isExpanded && <span className="font-extrabold text-xl tracking-tight text-gray-900 whitespace-nowrap overflow-hidden">Apex CRM</span>}
            </div>

            <div className="flex flex-col gap-2 w-full px-3 mt-4">
                <NavItem
                    href="/"
                    active={pathname === '/'}
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    isExpanded={isExpanded}
                    activeClass="bg-gray-900 text-white shadow-md shadow-gray-200"
                    inactiveClass="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                />

                <NavItem
                    href="/agencies"
                    active={pathname?.startsWith('/agencies')}
                    icon={<Globe size={20} />}
                    label="Agents"
                    isExpanded={isExpanded}
                    activeClass="bg-blue-600 text-white shadow-md shadow-blue-200"
                    inactiveClass="bg-blue-50 text-blue-600 hover:bg-blue-100"
                />

                <NavItem
                    href="/students"
                    active={pathname?.startsWith('/students')}
                    icon={<GraduationCap size={20} />}
                    label="Students"
                    isExpanded={isExpanded}
                    activeClass="bg-yellow-500 text-white shadow-md shadow-yellow-200"
                    inactiveClass="bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                />

                {duplicateCount > 0 && (
                    <NavItem
                        href="/duplicates"
                        active={pathname?.startsWith('/duplicates')}
                        icon={
                            <div className="relative">
                                <AlertCircle size={20} />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                            </div>
                        }
                        label="Duplicate Review"
                        isExpanded={isExpanded}
                        activeClass="bg-red-600 text-white shadow-md shadow-red-200"
                        inactiveClass="bg-red-50 text-red-600 hover:bg-red-100"
                    />
                )}
            </div>

            <div className="mt-auto pb-6 px-3 w-full flex flex-col gap-2">
                {/* Lightning Bolt Status */}
                <div className={clsx(
                    "rounded-xl flex items-center transition-all duration-300",
                    isExpanded ? "bg-orange-50 p-3 gap-3" : "justify-center w-full"
                )} title="AI Gmail Sync Active">
                    <Zap className="text-orange-500 animate-pulse shrink-0" size={20} />
                    {isExpanded && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <span className="text-xs font-bold text-orange-700">Gmail Sync Active</span>
                            <span className="text-[10px] text-orange-600/70">Scanning emails...</span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

interface NavItemProps {
    href: string;
    active: boolean;
    icon: React.ReactNode;
    label: string;
    isExpanded: boolean;
    activeClass: string;
    inactiveClass: string;
}

const NavItem = ({ href, active, icon, label, isExpanded, activeClass, inactiveClass }: NavItemProps) => {
    return (
        <Link href={href} className="w-full group">
            <div className={clsx(
                "flex items-center rounded-xl transition-all duration-200 cursor-pointer",
                isExpanded ? "px-4 py-3 gap-3" : "justify-center w-10 h-10 mx-auto",
                active ? `${activeClass} shadow-sm font-bold` : `${inactiveClass} font-medium`
            )}>
                <div className={clsx("shrink-0", active ? "" : "group-hover:scale-110 transition-transform")}>{icon}</div>

                {isExpanded && (
                    <span className={clsx(
                        "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                        // For active text, we expect activeClass to handle color (e.g. text-white).
                        // For inactive, inactiveClass handles it.
                    )}>
                        {label}
                    </span>
                )}
            </div>
        </Link>
    );
};
