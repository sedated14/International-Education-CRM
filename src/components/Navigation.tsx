"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Globe, Zap, GraduationCap, LayoutDashboard, ChevronRight, ChevronLeft, AlertCircle, Sun, Moon, LayoutTemplate } from 'lucide-react';
import { clsx } from 'clsx';

export const Navigation = () => {
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const [duplicateCount, setDuplicateCount] = React.useState(0);
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
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
                "bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-6 gap-6 z-30 flex-shrink-0 h-screen transition-all duration-300 ease-in-out relative",
                isExpanded ? "w-64" : "w-20"
            )}
        >
            {/* Toggle Button - Absolute positioned to be on the border */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute -right-3 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 z-50 transition-colors"
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Logo Area */}
            <div className={clsx("flex items-center justify-center transition-all duration-300", isExpanded ? "px-6 w-full justify-start gap-3" : "")}>
                <div className="w-10 h-10 bg-black dark:bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0 transition-colors">A</div>
                {isExpanded && <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white whitespace-nowrap overflow-hidden">Apex CRM</span>}
            </div>

            <div className="flex flex-col gap-2 w-full px-3 mt-4">
                <NavItem
                    href="/"
                    active={pathname === '/'}
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    isExpanded={isExpanded}
                    activeClass="bg-gray-900 text-white shadow-md shadow-gray-200 dark:bg-blue-600 dark:shadow-none"
                    inactiveClass="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                />

                <NavItem
                    href="/agencies"
                    active={pathname?.startsWith('/agencies')}
                    icon={<Globe size={20} />}
                    label="Agents"
                    isExpanded={isExpanded}
                    activeClass="bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                    inactiveClass="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                />

                <NavItem
                    href="/students"
                    active={pathname?.startsWith('/students')}
                    icon={<GraduationCap size={20} />}
                    label="Students"
                    isExpanded={isExpanded}
                    activeClass="bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                    inactiveClass="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
                />

                <NavItem
                    href="/settings/forms"
                    active={pathname?.startsWith('/settings/forms')}
                    icon={<LayoutTemplate size={20} />}
                    label="Lead Forms"
                    isExpanded={isExpanded}
                    activeClass="bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-none"
                    inactiveClass="bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30"
                />

                {duplicateCount > 0 && (
                    <NavItem
                        href="/duplicates"
                        active={pathname?.startsWith('/duplicates')}
                        icon={
                            <div className="relative">
                                <AlertCircle size={20} />
                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
                            </div>
                        }
                        label="Duplicate Review"
                        isExpanded={isExpanded}
                        activeClass="bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-none"
                        inactiveClass="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    />
                )}
            </div>

            <div className="mt-auto pb-6 px-3 w-full flex flex-col gap-2">
                {/* Dark Mode Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className={clsx(
                            "flex items-center rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400",
                            isExpanded ? "px-4 py-3 gap-3 w-full" : "justify-center w-10 h-10 mx-auto"
                        )}
                    >
                        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        {isExpanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                            {theme === "dark" ? "Light Mode" : "Dark Mode"}
                        </span>}
                    </button>
                )}

                {/* Lightning Bolt Status */}
                <div className={clsx(
                    "rounded-xl flex items-center transition-all duration-300",
                    isExpanded ? "bg-orange-50 dark:bg-orange-900/20 p-3 gap-3" : "justify-center w-full"
                )} title="AI Gmail Sync Active">
                    <Zap className="text-orange-500 animate-pulse shrink-0" size={20} />
                    {isExpanded && (
                        <div className="flex flex-col overflow-hidden whitespace-nowrap">
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">Gmail Sync Active</span>
                            <span className="text-[10px] text-orange-600/70 dark:text-orange-500/70">Scanning emails...</span>
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
