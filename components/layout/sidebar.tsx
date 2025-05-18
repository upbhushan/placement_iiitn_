"use client"

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    GraduationCap,
    MessageSquare,
    Briefcase,
    Settings,
    Users,
    Upload,
    FileText,
    ChevronRight,
    Menu,
    X,
    User,
    BellRing,
    Building,
    Mail,
    BarChart4,
    FileSpreadsheet,
    LogOut,
    ChevronUp,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import useStudentStore from "@/lib/store/userStore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [expanded, setExpanded] = useState(false); // Rename open to expanded for clarity
    const [collapsed, setCollapsed] = useState(true); // Default to collapsed
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const { student } = useStudentStore();
    const clearStudent = useStudentStore((state) => state.clearStudent);

    // Initialize sidebar state
    useEffect(() => {
        setMounted(true);

        // Default to expanded on desktop, collapsed on mobile
        const savedExpanded = localStorage.getItem('sidebarExpanded');
        if (savedExpanded !== null) {
            setExpanded(savedExpanded === 'true');
        } else {
            setExpanded(isDesktop); // Default expanded on desktop only
        }

        // Always keep collapsed state from localStorage if available
        const savedCollapsed = localStorage.getItem('sidebarCollapsed');
        if (savedCollapsed !== null) {
            setCollapsed(savedCollapsed === 'true');
        }
    }, [isDesktop]);

    // Save state changes to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('sidebarCollapsed', collapsed.toString());
            localStorage.setItem('sidebarExpanded', expanded.toString());
        }
    }, [collapsed, expanded, mounted]);

    const toggleCollapsed = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        // If expanding, also expand the sidebar if it's not already
        if (!newState && !expanded) {
            setExpanded(true);
        }

        // Dispatch event for layout
        window.dispatchEvent(new CustomEvent('sidebarStateChange', {
            detail: { isExpanded: expanded, isCollapsed: newState }
        }));
    };

    const toggleExpanded = () => {
        const newState = !expanded;
        setExpanded(newState);

        // Dispatch event for layout
        window.dispatchEvent(new CustomEvent('sidebarStateChange', {
            detail: { isExpanded: newState, isCollapsed: collapsed }
        }));
    };

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
        clearStudent(); // Clear student data from the store
    };

    const isAdmin = session?.user?.role === 'admin';
    const isStudent = session?.user?.role === 'student';
    const isAuthenticated = !!session;

    const adminNavItems = [
        {
            section: 'Dashboard',
            items: [
                {
                    title: 'Overview',
                    href: '/admin',
                    icon: <LayoutDashboard className="h-5 w-5" />
                },
                {
                    title: 'Analytics',
                    href: '/admin/analytics',
                    icon: <BarChart4 className="h-5 w-5" />
                }
            ]
        },
        {
            section: 'Student Management',
            items: [
                {
                    title: 'All Students',
                    href: '/admin/students',
                    icon: <Users className="h-5 w-5" />
                },
                {
                    title: 'Bulk Upload',
                    href: '/admin/bulk-upload',
                    icon: <Upload className="h-5 w-5" />
                },
                {
                    title: 'Placement Records',
                    href: '/admin/placements',
                    icon: <Building className="h-5 w-5" />
                }
            ]
        },
        {
            section: 'Forms & Communications',
            items: [
                {
                    title: 'Forms',
                    href: '/admin/forms',
                    icon: <FileText className="h-5 w-5" />
                },
                {
                    title: 'Form Responses',
                    href: '/admin/forms/responses',
                    icon: <FileSpreadsheet className="h-5 w-5" />
                },
                {
                    title: 'Announcements',
                    href: '/admin/announcements',
                    icon: <BellRing className="h-5 w-5" />
                }
            ]
        },
        {
            section: 'Settings',
            items: [
                {
                    title: 'Settings',
                    href: '/settings',
                    icon: <Settings className="h-5 w-5" />
                }
            ]
        }
    ];

    const studentNavItems = [
        {
            section: 'Dashboard',
            items: [
                {
                    title: 'Overview',
                    href: '/dashboard',
                    icon: <LayoutDashboard className="h-5 w-5" />
                },
                {
                    title: 'My Profile',
                    href: '/student/profile',
                    icon: <User className="h-5 w-5" />
                }
            ]
        },
        {
            section: 'Learning & Opportunities',
            items: [
                {
                    title: 'Forum',
                    href: '/student/forum',
                    icon: <MessageSquare className="h-5 w-5" />
                },
                {
                    title: 'Opportunities',
                    href: '/opportunities',
                    icon: <Briefcase className="h-5 w-5" />
                },
                {
                    title: 'Forms',
                    href: '/student/forms',
                    icon: <FileText className="h-5 w-5" />
                }
            ]
        },
        {
            section: 'Support',
            items: [
                {
                    title: 'Contact Admin',
                    href: '/contact',
                    icon: <Mail className="h-5 w-5" />
                }
            ]
        }
    ];

    // Determine which nav items to show based on role
    const navItems = isAdmin ? adminNavItems : isStudent ? studentNavItems : [];

    // Don't render if not authenticated
    if (!isAuthenticated) return null;

    // Helper function to determine if a link is active
    const isActiveLink = (href: string, currentPath: string): boolean => {
        // Exact match
        if (href === currentPath) return true;

        // Special case for home/overview pages to prevent them from 
        // matching with their child routes
        if (href === '/admin' && currentPath !== '/admin' && currentPath.startsWith('/admin/')) {
            return false;
        }

        if (href === '/dashboard' && currentPath !== '/dashboard' && currentPath.startsWith('/dashboard/')) {
            return false;
        }

        // Check for nested routes - only if the href is not a root level page
        if (href !== '/' &&
            href !== '/admin' &&
            href !== '/dashboard' &&
            currentPath.startsWith(href + '/')) {
            return true;
        }

        return false;
    };

    return (
        <TooltipProvider delayDuration={300}>
            <>
                {/* Toggle Button for Expanding/Collapsing (Mobile) */}
                <div className="fixed bottom-4 right-4 z-50 lg:hidden">
                    <Button
                        variant="default"
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-lg bg-primary"
                        onClick={toggleExpanded}
                    >
                        {expanded ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
                    </Button>
                </div>

                {/* Sidebar - Always visible, never completely hidden */}
                <div
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out flex flex-col",
                        expanded ? "translate-x-0" : "", // Never completely off-screen
                        collapsed ? "w-16" : "w-64", // Width based on collapsed state
                        className
                    )}
                >
                    {/* Header */}
                    <div className={cn(
                        "flex h-16 items-center border-b border-gray-200 dark:border-gray-800",
                        collapsed ? "justify-center px-0" : "px-4"
                    )}>
                        <Link href="/" className={cn(
                            "flex items-center",
                            collapsed ? "justify-center" : ""
                        )}>
                            <GraduationCap className="h-6 w-6 text-primary flex-shrink-0" />
                            {!collapsed && <span className="text-lg font-semibold ml-2">Campus System</span>}
                        </Link>
                    </div>

                    {/* Collapse Toggle Button */}
                    <div className="flex justify-end px-2 mt-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCollapsed}
                            className="h-7 w-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ?
                                <ChevronsRight className="h-4 w-4 text-gray-500" /> :
                                <ChevronsLeft className="h-4 w-4 text-gray-500" />
                            }
                        </Button>
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-grow">
                        <div className={cn(
                            "py-4",
                            collapsed ? "px-2" : "px-3"
                        )}>
                            {navItems.map((section, i) => (
                                <div key={i} className="mb-6">
                                    {!collapsed && (
                                        <h2 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                            {section.section}
                                        </h2>
                                    )}
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            collapsed ? (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={item.href}
                                                            className={cn(
                                                                "flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                                                                isActiveLink(item.href, pathname)
                                                                    ? "bg-gray-100 dark:bg-gray-800 text-primary"
                                                                    : "text-gray-700 dark:text-gray-300"
                                                            )}
                                                        >
                                                            {item.icon}
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right" sideOffset={5}>
                                                        {item.title}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group",
                                                        isActiveLink(item.href, pathname)
                                                            ? "bg-gray-100 dark:bg-gray-800 text-primary font-medium"
                                                            : "text-gray-700 dark:text-gray-300"
                                                    )}
                                                >
                                                    <div className="mr-2">{item.icon}</div>
                                                    <span>{item.title}</span>
                                                    <ChevronRight className={cn(
                                                        "ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                                                        isActiveLink(item.href, pathname)
                                                            ? "opacity-100 text-primary" : "text-gray-400"
                                                    )} />
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                    {i < navItems.length - 1 && !collapsed && (
                                        <Separator className="my-4 bg-gray-200 dark:bg-gray-800" />
                                    )}
                                    {i < navItems.length - 1 && collapsed && (
                                        <div className="my-4" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer with theme toggle and user profile */}
                    <div className="mt-auto">
                        {/* Theme Toggle - Stylish Card */}
                        {collapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex justify-center py-3 my-2">
                                        {mounted && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                                className="h-9 w-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                            >
                                                <SunIcon className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                                <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                            </Button>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={5}>
                                    {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <div className="mx-3 my-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {theme === "dark" ? "Dark Mode" : "Light Mode"}
                                        </span>
                                    </div>
                                    {mounted && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                            className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                                        >
                                            <SunIcon className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                            <MoonIcon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* User Profile Dropdown */}
                        <div className={cn(
                            "pb-5",
                            collapsed ? "px-2" : "px-3"
                        )}>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full h-auto p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-800",
                                            collapsed ? "justify-center px-0" : "justify-between"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center",
                                            collapsed ? "justify-center" : ""
                                        )}>
                                            <Avatar className={cn(
                                                "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-primary/20 transition-all group-hover:ring-primary/40",
                                                collapsed ? "h-8 w-8" : "h-9 w-9 mr-3"
                                            )}>
                                                {student?.photo ? (
                                                    <AvatarImage src={student.photo} alt={session.user?.name || "User"} className="object-cover" />
                                                ) : (
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            {!collapsed && (
                                                <div className="text-left">
                                                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100 truncate max-w-[130px]">
                                                        {session.user?.name || "User"}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[130px]">
                                                        {session.user?.email}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {!collapsed && (
                                            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    align={collapsed ? "center" : "end"}
                                    sideOffset={8}
                                    className="w-60 p-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg"
                                >
                                    {collapsed && (
                                        <>
                                            <DropdownMenuLabel className="px-3 py-2 text-gray-700 dark:text-gray-300 flex items-center">
                                                <div className="flex flex-col">
                                                    <p className="font-medium">{session.user?.name || "User"}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{session.user?.email}</p>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-800" />
                                        </>
                                    )}

                                    <DropdownMenuLabel className="px-3 py-2 text-gray-700 dark:text-gray-300">
                                        My Account
                                    </DropdownMenuLabel>

                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800"
                                    >
                                        <Link href="/dashboard">
                                            <LayoutDashboard className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>

                                    {session?.user?.role === "student" && (
                                        <DropdownMenuItem
                                            asChild
                                            className="cursor-pointer px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800"
                                        >
                                            <Link href="/student/profile">
                                                <User className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                My Profile
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer px-3 py-2 rounded-lg text-gray-800 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-gray-800"
                                    >
                                        <Link href="/settings">
                                            <Settings className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-800" />

                                    <DropdownMenuItem
                                        className="cursor-pointer px-3 py-2 rounded-lg text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </>
        </TooltipProvider>
    );
}